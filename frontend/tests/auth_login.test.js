/**
 * @jest-environment jsdom
 */

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('Auth Login Page Tests', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = `
      <form id="loginForm">
        <input name="Username" value="demo">
        <input name="Password" value="secret">
        <button type="submit">Login</button>
      </form>
    `;

    jest.clearAllMocks();
    window.localStorage.clear();
    global.localStorage = window.localStorage;
    global.alert = jest.fn();
    global.fetch = jest.fn();
    window.fetch = global.fetch;

    require('../static/js/auth_login.js');
  });

  test('Dang nhap thanh cong luu token', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'token-123',
        role: 'UNKNOWN',
        user_info: { id: 5 }
      })
    });

    document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST', body: expect.any(FormData) })
    );
    expect(localStorage.getItem('token')).toBe('token-123');
    expect(localStorage.getItem('role')).toBe('UNKNOWN');
    expect(localStorage.getItem('user_id')).toBe('5');
  });

  test('Dang nhap that bai hien alert loi', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Sai mat khau' })
    });

    document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushPromises();

    expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Sai mat khau'));
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('Dang nhap loi ket noi hien alert server', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockRejectedValueOnce(new Error('network down'));

    document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushPromises();

    expect(global.alert).toHaveBeenCalledWith('Kiểm tra lại Flask đã chạy chưa!');
    consoleSpy.mockRestore();
  });
});
