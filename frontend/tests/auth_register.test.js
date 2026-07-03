/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { createInstrumenter } from 'istanbul-lib-instrument';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));
const sourcePath = path.join(process.cwd(), 'static', 'js', 'auth_register.js');

function loadAuthRegisterModule() {
  const source = fs
    .readFileSync(sourcePath, 'utf8')
    .replace(
      /async function toggleRestaurantDropdown\(\) \{/,
      'window.toggleRestaurantDropdown = async function toggleRestaurantDropdown() {'
    )
    .replace(/if \(typeof window !== 'undefined'\) \{[\s\S]*?if \(typeof module !== 'undefined'\) \{[\s\S]*?\};\s*\}/, '');
  const instrumenter = createInstrumenter({ coverageVariable: '__coverage__' });
  const instrumented = instrumenter.instrumentSync(
    `${source}
return {
  toggleRestaurantDropdown: typeof toggleRestaurantDropdown !== 'undefined'
    ? toggleRestaurantDropdown
    : window.toggleRestaurantDropdown
};`,
    sourcePath
  );

  return new Function(instrumented)();
}

function setupRegisterDom() {
  document.body.innerHTML = `
    <form id="registerForm">
      <input id="user" name="Username" value="demo">
      <input id="pass" name="Password" value="secret">
      <input id="confirm_pass" value="secret">
      <select id="roleSelect" name="Role">
        <option value="CUSTOMER">Customer</option>
        <option value="STAFF">Staff</option>
      </select>
      <div id="restaurantDiv" style="display: none">
        <select id="restaurantSelect" name="restaurant_id">
          <option value="">Choose</option>
        </select>
      </div>
      <button type="submit">Register</button>
    </form>
  `;
}

describe('Auth Register Page Tests', () => {
  let registerPage;

  beforeEach(() => {
    jest.resetModules();
    setupRegisterDom();

    jest.clearAllMocks();
    global.alert = jest.fn();
    global.fetch = jest.fn();
    window.fetch = global.fetch;

    registerPage = loadAuthRegisterModule();
  });

  test('Dang ky dung mat khau goi API thanh cong', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'created' })
    });

    document.getElementById('registerForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/registerRequest'),
      expect.objectContaining({ method: 'POST', body: expect.any(FormData) })
    );
    expect(global.alert).toHaveBeenCalledWith('Chúc mừng! Đăng ký thành công.');
    consoleSpy.mockRestore();
  });

  test('Dang ky chan mat khau xac nhan khong khop', async () => {
    document.getElementById('confirm_pass').value = 'other';

    document.getElementById('registerForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(global.alert).toHaveBeenCalledWith('Mật khẩu xác nhận không khớp!');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('Dang ky loi backend hien alert loi', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Username exists' })
    });

    document.getElementById('registerForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Username exists'));
  });

  test('Toggle role staff tai danh sach nha hang', async () => {
    document.getElementById('roleSelect').value = 'STAFF';
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 3, name: 'Golden' }]
    });

    await registerPage.toggleRestaurantDropdown();

    expect(document.getElementById('restaurantDiv').style.display).toBe('block');
    expect(document.getElementById('restaurantSelect').textContent).toContain('Golden');
  });

  test('Toggle role customer an dropdown nha hang', async () => {
    document.getElementById('roleSelect').value = 'CUSTOMER';
    document.getElementById('restaurantSelect').value = '';

    await registerPage.toggleRestaurantDropdown();

    expect(document.getElementById('restaurantDiv').style.display).toBe('none');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
