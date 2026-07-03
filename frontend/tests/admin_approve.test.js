/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'fs';
import path from 'path';

const htmlContent = readFileSync(
  path.join(process.cwd(), 'templates', 'restaurant', 'register_restaurant.html'),
  'utf8'
).replace(/<script[^>]*src="[^"]*register_restaurant\.js"[^>]*><\/script>/gi, '');
const bodyHTML = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? htmlContent;

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('Restaurant Registration Page Tests', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = bodyHTML;

    window.localStorage.clear();
    localStorage.setItem('token', 'test-token');
    global.localStorage = window.localStorage;

    jest.clearAllMocks();
    global.fetch = jest.fn();
    window.fetch = global.fetch;
    global.confirm = jest.fn();

    require('../static/js/register_restaurant.js');
    window.registerRestaurantOnload = window.onload;
    window.onload = null;
  });

  test('Hien thi thong bao loi khi submit ma chua dang nhap', async () => {
    localStorage.removeItem('token');

    const form = document.getElementById('restaurant-register-form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushPromises();

    const messageBox = document.getElementById('restaurant-page-message');
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('registerRestaurant'),
      expect.any(Object)
    );
    expect(messageBox.hidden).toBe(false);
    expect(messageBox.className).toContain('error');
  });

  test('Goi API dang ky nha hang khi form hop le', async () => {
    const form = document.getElementById('restaurant-register-form');

    document.getElementById('register-restaurant-name').value = 'Nha hang test';
    document.getElementById('register-restaurant-address').value = '123 Quan 1';
    document.getElementById('register-restaurant-phone').value = '0123456789';
    document.getElementById('register-restaurant-email').value = 'test@example.com';
    document.getElementById('register-restaurant-open').value = '08:00';
    document.getElementById('register-restaurant-close').value = '22:00';
    document.getElementById('register-restaurant-description').value = 'Mo ta test';

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Dang ky thanh cong' })
    });

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushPromises();

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('registerRestaurant');
    expect(options.method).toBe('POST');
    expect(document.getElementById('restaurant-page-message').className).toContain('success');
  });

  test('Window onload tai danh sach cuisine thanh cong', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'Lau' }]
    });

    await window.registerRestaurantOnload();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/cuisines'),
      expect.objectContaining({ headers: expect.any(Object) })
    );
    expect(document.getElementById('register-restaurant-cuisine').textContent).toContain('Lau');
    expect(document.getElementById('restaurant-registration-panel').hidden).toBe(false);
  });

  test('Window onload hien loi khi khong tai duoc cuisine', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    await window.registerRestaurantOnload();

    const messageBox = document.getElementById('restaurant-page-message');
    expect(messageBox.hidden).toBe(false);
    expect(messageBox.className).toContain('error');
  });
});
