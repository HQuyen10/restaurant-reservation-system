/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { createInstrumenter } from 'istanbul-lib-instrument';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));
const sourcePath = path.join(process.cwd(), 'static', 'js', 'restaurants.js');

function loadRestaurantsModule() {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const instrumenter = createInstrumenter({ coverageVariable: '__coverage__' });
  const instrumented = instrumenter.instrumentSync(
    `${source}
return {
  getScrollbarWidth,
  showRestaurantMessage,
  clearRestaurantMessage,
  normalizeText,
  getStatusVariant,
  getCuisineName,
  getUserName,
  prepareAdd,
  openResModal,
  closeResModal,
  handleOverlayClick,
  openApprovalModal,
  closeApprovalModal,
  handleApprovalOverlayClick,
  loadDropdowns,
  renderStatusCell,
  fetchRestaurants,
  addRestaurant,
  updateRestaurant,
  handleResponse,
  prepareEdit,
  handleDelete,
  submitApproval,
  handleLogout
};`,
    sourcePath
  );

  return new Function(instrumented)();
}

function setupRestaurantDom(options = {}) {
  const includeMessage = options.includeMessage !== false;
  const includeAdminField = options.includeAdminField !== false;
  document.body.innerHTML = `
    ${includeMessage ? '<div id="restaurant-admin-message" hidden></div>' : ''}
    <div id="appModalWrapper">
      <form id="appResForm">
        <input id="form-res-id" name="RestaurantID">
        <input id="res-name" name="RestaurantName">
        <input id="res-address" name="Address">
        <input id="res-phone" name="Phone">
        <input id="res-email" name="Email">
        <input id="res-open" name="Opentime">
        <input id="res-close" name="Closetime">
        <textarea id="res-desc" name="description"></textarea>
        <select id="res-cuisine" name="CuisineID"></select>
        <select id="res-user" name="UserID"></select>
        <select id="res-status" name="status">
          <option value="Đang hoạt động">Đang hoạt động</option>
          <option value="Chờ duyệt">Chờ duyệt</option>
        </select>
        <button type="submit">Save</button>
      </form>
    </div>
    <h2 id="appModalTitle"></h2>
    ${includeAdminField ? '<div id="adminFieldContainer"></div>' : ''}
    <div id="approvalModal">
      <span id="approval-restaurant-name"></span>
      <span id="approval-restaurant-user"></span>
      <span id="approval-restaurant-cuisine"></span>
      <span id="approval-restaurant-status"></span>
      <textarea id="approval-note"></textarea>
      <button id="approvalApproveButton">Approve</button>
      <button id="approvalRejectButton">Reject</button>
    </div>
    <table><tbody id="res-list-body"></tbody></table>
  `;
}

function restaurantFixture(status = 'Chờ duyệt') {
  return {
    RestaurantID: 1,
    RestaurantName: 'Golden',
    Address: '123 Q1',
    Phone: '0909',
    Email: 'golden@example.com',
    Opentime: '08:00:00',
    Closetime: '22:00:00',
    description: 'Nice',
    UserID: 7,
    CuisineID: 3,
    status
  };
}

describe('restaurants.js admin restaurant page', () => {
  let restaurantPage;

  beforeEach(() => {
    jest.resetModules();
    setupRestaurantDom();

    window.localStorage.clear();
    localStorage.setItem('token', 'admin-token');
    localStorage.setItem('role', 'ADMIN');
    global.localStorage = window.localStorage;

    global.fetch = jest.fn();
    window.fetch = global.fetch;
    global.alert = jest.fn();
    global.confirm = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    restaurantPage = loadRestaurantsModule();
    window.restaurantsOnload = window.onload;
    window.onload = null;
  });

  afterEach(() => {
    console.error.mockRestore();
    document.body.innerHTML = '';
  });

  test('window onload loads dropdowns and restaurants', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 3, name: 'Vietnamese' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 7, username: 'owner' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [restaurantFixture()] });

    await window.restaurantsOnload();

    expect(document.getElementById('res-cuisine').textContent).toContain('Vietnamese');
    expect(document.getElementById('res-user').textContent).toContain('owner');
    expect(document.getElementById('res-list-body').textContent).toContain('Golden');
    expect(document.querySelector('.admin-restaurants-status-button')).not.toBeNull();
  });

  test('helper functions cover status and fallback branches', () => {
    expect(restaurantPage.normalizeText('Hoạt Động')).toContain('hoat');
    expect(restaurantPage.getStatusVariant('dang hoat dong')).toBe('active');
    expect(restaurantPage.getStatusVariant('tu choi')).toBe('rejected');
    expect(restaurantPage.getStatusVariant('ngung hoat dong')).toBe('inactive');
    expect(restaurantPage.getStatusVariant('Khác')).toBe('neutral');
    expect(restaurantPage.getCuisineName()).toBe('N/A');
    expect(restaurantPage.getUserName()).toBe('User: N/A');
    expect(restaurantPage.renderStatusCell({ RestaurantID: 1, status: 'dang hoat dong' })).toContain('active');
  });

  test('fetch restaurant API error shows message', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    await window.restaurantsOnload();

    expect(document.getElementById('restaurant-admin-message').hidden).toBe(false);
    expect(document.getElementById('restaurant-admin-message').className).toContain('error');
  });

  test('dropdown API error shows message', async () => {
    global.fetch.mockRejectedValueOnce(new Error('dropdown down'));

    await window.restaurantsOnload();

    expect(document.getElementById('restaurant-admin-message').className).toContain('error');
  });

  test('prepareAdd opens modal and resets form', () => {
    document.getElementById('form-res-id').value = '9';
    window.prepareAdd();

    expect(document.getElementById('form-res-id').value).toBe('');
    expect(document.getElementById('appModalWrapper').classList.contains('is-visible')).toBe(true);
    expect(document.getElementById('adminFieldContainer').style.display).toBe('flex');
  });

  test('prepareEdit fills form from selected restaurant', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 3, name: 'Vietnamese' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 7, username: 'owner' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [restaurantFixture('Đang hoạt động')] });

    await window.restaurantsOnload();
    window.prepareEdit(1);

    expect(document.getElementById('form-res-id').value).toBe('1');
    expect(document.getElementById('res-name').value).toBe('Golden');
    expect(document.getElementById('appModalWrapper').classList.contains('is-visible')).toBe(true);
  });

  test('prepareEdit ignores unknown restaurant id', () => {
    window.prepareEdit(404);

    expect(document.getElementById('form-res-id').value).toBe('');
  });

  test('form submit creates and updates restaurant', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'created' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'updated' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    document.getElementById('appResForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/restaurants'),
      expect.objectContaining({ method: 'POST', body: expect.any(FormData) })
    );

    document.getElementById('form-res-id').value = '1';
    document.getElementById('appResForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/restaurants/1'),
      expect.objectContaining({ method: 'PUT', body: expect.any(FormData) })
    );
  });

  test('form submit shows API validation error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Name required' })
    });

    document.getElementById('appResForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushPromises();

    expect(document.getElementById('restaurant-admin-message').textContent).toBe('Name required');
    expect(document.getElementById('restaurant-admin-message').className).toContain('error');
  });

  test('delete button respects confirm and handles success', async () => {
    global.confirm.mockReturnValueOnce(false);
    await window.handleDelete(1);
    expect(global.fetch).not.toHaveBeenCalled();

    global.confirm.mockReturnValueOnce(true);
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'deleted' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    await window.handleDelete(1);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/restaurants/1'),
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(document.getElementById('restaurant-admin-message').className).toContain('success');
  });

  test('delete button shows API error', async () => {
    global.confirm.mockReturnValueOnce(true);
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Cannot delete' })
    });

    await window.handleDelete(1);

    expect(document.getElementById('restaurant-admin-message').textContent).toBe('Cannot delete');
    expect(document.getElementById('restaurant-admin-message').className).toContain('error');
  });

  test('approval modal approve and reject flows call API', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 3, name: 'Vietnamese' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 7, username: 'owner' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [restaurantFixture()] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'approved' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 3, name: 'Vietnamese' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 7, username: 'owner' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [restaurantFixture()] })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'reject failed' }) });

    await window.restaurantsOnload();
    window.openApprovalModal(1);
    document.getElementById('approvalApproveButton').click();
    await flushPromises();
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/restaurants/1/approve'),
      expect.objectContaining({ method: 'PUT' })
    );

    await window.restaurantsOnload();
    window.openApprovalModal(1);
    document.getElementById('approvalRejectButton').click();
    await flushPromises();
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/restaurants/1/reject'),
      expect.objectContaining({ method: 'PUT' })
    );
    expect(document.getElementById('restaurant-admin-message').className).toContain('error');
  });

  test('approval modal handles missing restaurant and overlay close', () => {
    window.openApprovalModal(404);
    expect(document.getElementById('restaurant-admin-message').className).toContain('error');

    document.getElementById('approvalModal').classList.add('is-visible');
    window.handleApprovalOverlayClick({ target: { id: 'approvalModal' } });
    expect(document.getElementById('approvalModal').classList.contains('is-visible')).toBe(false);
  });

  test('modal overlay closes only when clicking wrapper', () => {
    window.prepareAdd();

    window.handleOverlayClick({ target: { id: 'child' } });
    expect(document.getElementById('appModalWrapper').classList.contains('is-visible')).toBe(true);

    window.handleOverlayClick({ target: { id: 'appModalWrapper' } });
    expect(document.getElementById('appModalWrapper').classList.contains('is-visible')).toBe(false);
  });

  test('direct helpers cover message and response fallback branches', async () => {
    const response = {
      ok: true,
      json: async () => ({ message: 'ok' })
    };
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    await restaurantPage.handleResponse(response);

    expect(document.getElementById('restaurant-admin-message').className).toContain('success');

    restaurantPage.showRestaurantMessage('', undefined);
    expect(document.getElementById('restaurant-admin-message').className).toContain('info');

    restaurantPage.clearRestaurantMessage();
    expect(document.getElementById('restaurant-admin-message').hidden).toBe(true);
  });

  test('fallback restaurant fields render default values', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ RestaurantID: 2, status: '', UserID: null, CuisineID: null }]
      });

    await window.restaurantsOnload();
    window.prepareEdit(2);

    const text = document.getElementById('res-list-body').textContent;
    expect(text).toContain('N/A');
    expect(text).toContain('--:--');
    expect(document.getElementById('res-status').value).toBe('Đang hoạt động');
  });

  test('delete and approval success use fallback messages', async () => {
    global.confirm.mockReturnValueOnce(true);
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    await window.handleDelete(1);
    expect(document.getElementById('restaurant-admin-message').textContent).toBe('Đã xóa nhà hàng.');

    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [restaurantFixture()] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    await window.restaurantsOnload();
    window.openApprovalModal(1);
    document.getElementById('approvalApproveButton').click();
    await flushPromises();
    await flushPromises();

    expect(document.getElementById('restaurant-admin-message').textContent).toBe(
      'Đã cập nhật trạng thái nhà hàng.'
    );
  });

  test('module handles optional DOM and non admin dropdown branch', async () => {
    jest.resetModules();
    setupRestaurantDom({ includeMessage: false, includeAdminField: false });
    localStorage.setItem('role', 'STAFF');

    const staffPage = loadRestaurantsModule();
    staffPage.showRestaurantMessage('hidden message', 'info');
    staffPage.clearRestaurantMessage();
    staffPage.openResModal();
    expect(document.getElementById('appModalWrapper').classList.contains('is-visible')).toBe(true);

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 3, name: 'Vietnamese' }]
    });

    await staffPage.loadDropdowns();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(document.getElementById('res-cuisine').textContent).toContain('Vietnamese');
  });

  test('direct approval helper exits without selected restaurant and logout branches', async () => {
    await restaurantPage.submitApproval('approve');
    expect(global.fetch).not.toHaveBeenCalled();

    global.confirm.mockReturnValueOnce(false);
    restaurantPage.handleLogout();
    expect(localStorage.getItem('token')).toBe('admin-token');

    global.confirm.mockReturnValueOnce(true);
    restaurantPage.handleLogout();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
