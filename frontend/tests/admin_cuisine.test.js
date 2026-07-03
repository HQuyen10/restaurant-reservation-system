/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'fs';
import path from 'path';

const htmlContent = readFileSync(path.join(process.cwd(), 'templates', 'admin', 'cuisine.html'), 'utf8');
const bodyHTML = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? '';
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('Admin Cuisine Page Tests', () => {
  let cuisinePage;

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = bodyHTML;

    jest.clearAllMocks();
    global.alert = jest.fn();
    global.confirm = jest.fn();
    global.fetch = jest.fn();
    window.fetch = global.fetch;

    document.getElementById('form-id').value = '123';
    document.getElementById('form-name').value = 'Test Cuisine';
    document.getElementById('form-status').value = 'Inactive';
    document.getElementById('cuisineModal').style.display = 'none';

    cuisinePage = require('../static/js/admin_cuisine.js');
    window.cuisineOnload = window.onload;
    window.onload = null;
  });

  test('Modal them cuisine reset du lieu cu', () => {
    cuisinePage.openAddModal();

    expect(document.getElementById('form-id').value).toBe('');
    expect(document.getElementById('form-name').value).toBe('');
    expect(document.getElementById('modal-title').innerText).toBe('Thêm Cuisine');
    expect(document.getElementById('cuisineModal').style.display).toBe('flex');
  });

  test('Dong modal cuisine khong luu', () => {
    cuisinePage.openAddModal();
    cuisinePage.closeModal();

    expect(document.getElementById('cuisineModal').style.display).toBe('none');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('Window onload tai danh sach cuisine', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'Pho', status: 'Active' }]
    });

    window.cuisineOnload();
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/cuisines'),
      expect.objectContaining({ method: 'GET' })
    );
    expect(document.getElementById('cuisine-list-body').textContent).toContain('Pho');
  });
});
