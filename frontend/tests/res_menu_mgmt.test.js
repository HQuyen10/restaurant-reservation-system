/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { createInstrumenter } from 'istanbul-lib-instrument';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));
const sourcePath = path.join(process.cwd(), 'static', 'js', 'res_menu_mgmt.js');

function loadResMenuModule() {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const instrumenter = createInstrumenter({ coverageVariable: '__coverage__' });
  const instrumented = instrumenter.instrumentSync(
    `${source}
window.__resMenuMgmt = {
  loadMenu,
  renderMenu,
  addFood,
  deleteFood,
  editFood,
  toggleAddForm,
  handleLogout
};`,
    sourcePath
  );

  window.eval(instrumented);
  return window.__resMenuMgmt;
}

function setupMenuDom() {
  document.body.innerHTML = `
    <section id="menuContainer"></section>
    <form id="addFoodForm" style="display: none">
      <input id="name" value="">
      <input id="price" value="">
      <input id="image" value="">
      <input id="category" value="">
      <input id="editImageInput" type="file">
    </form>
  `;
}

describe('res_menu_mgmt.js', () => {
  let menuPage;

  beforeEach(() => {
    jest.resetModules();
    setupMenuDom();

    window.localStorage.clear();
    localStorage.setItem('token', 'staff-token');
    global.localStorage = window.localStorage;

    global.fetch = jest.fn();
    window.fetch = global.fetch;
    global.alert = jest.fn();
    global.confirm = jest.fn();
    global.prompt = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    console.log.mockRestore();
    document.body.innerHTML = '';
  });

  test('renders menu items from API on initial load', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'F1', name: 'Pho', price: 50000, image: 'pho.jpg', category: 'Main', Visible: true },
        { id: 'F2', name: 'Lau', price: 120000, image: '', category: 'Hotpot', Visible: false }
      ]
    });

    menuPage = loadResMenuModule();
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/restaurant/menu/admin'),
      expect.objectContaining({ method: 'GET' })
    );
    expect(document.querySelectorAll('.menu-item')).toHaveLength(2);
    expect(document.getElementById('menuContainer').textContent).toContain('Pho');
    expect(document.querySelectorAll('.menu-item')[1].style.opacity).toBe('0.4');
  });

  test('shows unauthorized alert when menu API returns 403', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({})
    });

    menuPage = loadResMenuModule();
    await flushPromises();

    expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('quyền'));
    expect(document.querySelectorAll('.menu-item')).toHaveLength(0);
  });

  test('renders empty menu when API returns empty array', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    menuPage = loadResMenuModule();
    await flushPromises();

    expect(document.getElementById('menuContainer').innerHTML).toBe('');
  });

  test('toggle button updates visible state and DOM', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 'F1', name: 'Pho', price: 50000, Visible: true }]
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ visible: false })
      });

    menuPage = loadResMenuModule();
    await flushPromises();

    document.querySelector('.toggle-btn').click();
    await flushPromises();

    expect(global.fetch).toHaveBeenLastCalledWith(
      expect.stringContaining('/restaurant/menu/F1/toggle'),
      expect.objectContaining({ method: 'PUT' })
    );
    expect(document.querySelector('.menu-item').style.opacity).toBe('0.4');
    expect(document.querySelector('.toggle-btn').textContent).toContain('Hiện');
  });

  test('toggle button shows alert when API fails', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 'F1', name: 'Pho', price: 50000, Visible: true }]
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      });

    menuPage = loadResMenuModule();
    await flushPromises();

    document.querySelector('.toggle-btn').click();
    await flushPromises();

    expect(global.alert).toHaveBeenCalledWith('Thao tác thất bại!');
  });

  test('loadMenu handles missing token and server error', async () => {
    localStorage.removeItem('token');
    menuPage = loadResMenuModule();
    await flushPromises();

    expect(global.alert).toHaveBeenCalledWith('Bạn chưa đăng nhập!');

    localStorage.setItem('token', 'staff-token');
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({})
    });

    await menuPage.loadMenu();

    expect(console.error).toHaveBeenCalledWith('Load menu error:', expect.any(Error));
  });

  test('addFood validates form and posts success data', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    menuPage = loadResMenuModule();
    await flushPromises();

    await menuPage.addFood();
    expect(global.alert).toHaveBeenCalledWith('Vui lòng nhập tên món và giá!');

    document.getElementById('name').value = 'Com tam';
    document.getElementById('price').value = '45000';
    document.getElementById('image').value = 'com.jpg';
    document.getElementById('category').value = 'Rice';

    global.fetch
      .mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: 'F3' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    await menuPage.addFood();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/restaurant/menu'),
      expect.objectContaining({ method: 'POST', body: expect.stringContaining('Com tam') })
    );
    expect(global.alert).toHaveBeenCalledWith('Thêm món thành công!');
    expect(document.getElementById('name').value).toBe('');
  });

  test('addFood handles API failure and network error', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    menuPage = loadResMenuModule();
    await flushPromises();

    document.getElementById('name').value = 'Pho';
    document.getElementById('price').value = '50000';

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'bad request'
    });

    await menuPage.addFood();
    expect(global.alert).toHaveBeenCalledWith('Thêm thất bại! Vui lòng kiểm tra lại.');

    global.fetch.mockRejectedValueOnce(new Error('network down'));
    await menuPage.addFood();
    expect(global.alert).toHaveBeenCalledWith('Lỗi kết nối server!');
  });

  test('deleteFood respects confirm and reloads on success', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    menuPage = loadResMenuModule();
    await flushPromises();

    global.confirm.mockReturnValueOnce(false);
    await menuPage.deleteFood('F1');
    expect(global.fetch).toHaveBeenCalledTimes(1);

    global.confirm.mockReturnValueOnce(true);
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    await menuPage.deleteFood('F1');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/restaurant/menu/F1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  test('deleteFood shows alert when API fails', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    menuPage = loadResMenuModule();
    await flushPromises();

    global.confirm.mockReturnValueOnce(true);
    global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    await menuPage.deleteFood('F1');

    expect(global.alert).toHaveBeenCalledWith('Xoá thất bại');
  });

  test('editFood validates prompt and updates without new image', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    menuPage = loadResMenuModule();
    await flushPromises();

    global.prompt.mockReturnValueOnce('').mockReturnValueOnce('abc');
    await menuPage.editFood('F1', 'Old', '10000');
    expect(global.alert).toHaveBeenCalledWith('Dữ liệu không hợp lệ!');

    global.prompt.mockReturnValueOnce('New food').mockReturnValueOnce('90000');
    global.confirm.mockReturnValueOnce(false);
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    await menuPage.editFood('F1', 'Old', '10000');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/restaurant/menu/F1'),
      expect.objectContaining({ method: 'PUT', body: expect.any(FormData) })
    );
    expect(global.alert).toHaveBeenCalledWith('Sửa thành công');
  });

  test('editFood exits when prompt is cancelled and reports API failure', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    menuPage = loadResMenuModule();
    await flushPromises();

    global.prompt.mockReturnValueOnce(null);
    await menuPage.editFood('F1', 'Old', '10000');
    expect(global.fetch).toHaveBeenCalledTimes(1);

    global.prompt.mockReturnValueOnce('New food').mockReturnValueOnce('90000');
    global.confirm.mockReturnValueOnce(false);
    global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    await menuPage.editFood('F1', 'Old', '10000');
    expect(global.alert).toHaveBeenCalledWith('Sửa thất bại');
  });

  test('toggleAddForm and handleLogout cover UI branches', () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    menuPage = loadResMenuModule();

    menuPage.toggleAddForm();
    expect(document.getElementById('addFoodForm').style.display).toBe('block');
    menuPage.toggleAddForm();
    expect(document.getElementById('addFoodForm').style.display).toBe('none');

    global.confirm.mockReturnValueOnce(false);
    menuPage.handleLogout();
    expect(localStorage.getItem('token')).toBe('staff-token');

    global.confirm.mockReturnValueOnce(true);
    menuPage.handleLogout();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
