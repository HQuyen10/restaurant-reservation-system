/**
 * @jest-environment jsdom
 */

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

function setupTableDom() {
  document.body.innerHTML = `
    <div id="restaurant-page-message" hidden></div>
    <section id="table-management-panel"></section>
    <button id="logoutButton">Logout</button>
    <button data-panel-target="tables">Tables</button>
    <button data-panel-target="register">Register</button>
    <main>
      <div id="left-side"></div>
      <div id="right-side"></div>
    </main>
  `;
}

describe('restaurant_table.js', () => {
  let tablePage;

  beforeEach(() => {
    jest.resetModules();
    setupTableDom();

    window.localStorage.clear();
    localStorage.setItem('token', 'staff-token');
    localStorage.setItem('role', 'STAFF');
    global.localStorage = window.localStorage;

    global.fetch = jest.fn();
    window.fetch = global.fetch;
    global.alert = jest.fn();
    global.confirm = jest.fn();
    global.prompt = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    tablePage = require('../static/js/restaurant_table.js');
    window.tableOnload = window.onload;
    window.onload = null;
  });

  afterEach(() => {
    console.error.mockRestore();
    document.body.innerHTML = '';
  });

  test('renderTableCard renders available reserved and fallback states', () => {
    expect(tablePage.renderTableCard({ id: 1, capacity: 4, status: 'Available' })).toContain('available');
    expect(tablePage.renderTableCard({ id: 2, capacity: 4, status: 'Reserved', customer_name: 'An' })).toContain('reserved');
    expect(tablePage.renderTableCard({ id: 3, capacity: 4, status: 'Cleaning' })).toContain('Cleaning');
    expect(tablePage.renderTableCard({ id: 9, capacity: 4, status: 'Available' })).toContain('double');
  });

  test('loadTables renders table cards into both sides', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, capacity: 2, status: 'Available' },
        { id: 2, capacity: 4, status: 'Reserved', customer_name: 'Lan' },
        { id: 3, capacity: 6, status: 'Cleaning' }
      ]
    });

    await tablePage.loadTables();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/restaurant/tables'),
      expect.objectContaining({ method: 'GET' })
    );
    expect(document.getElementById('left-side').querySelectorAll('.card')).toHaveLength(2);
    expect(document.getElementById('right-side').querySelectorAll('.card')).toHaveLength(1);
  });

  test('loadTables shows message when API fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    await tablePage.loadTables();

    expect(document.getElementById('restaurant-page-message').hidden).toBe(false);
    expect(document.getElementById('restaurant-page-message').className).toContain('error');
  });

  test('window onload loads tables and clears message', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    await window.tableOnload();

    expect(global.fetch).toHaveBeenCalled();
    expect(document.getElementById('table-management-panel').hidden).toBe(false);
  });

  test('updateTableStatus sends PUT payload and returns json', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ Status: 'Available' })
    });

    const result = await tablePage.updateTableStatus(1, { Status: 'Available' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/restaurant/tables/1/status'),
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ Status: 'Available' }) })
    );
    expect(result.Status).toBe('Available');
  });

  test('updateTableStatus throws when API fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    await expect(tablePage.updateTableStatus(1, { Status: 'Available' })).rejects.toThrow(
      'Không cập nhật được trạng thái bàn.'
    );
  });

  test('cancelBooking updates status after confirm', async () => {
    global.confirm.mockReturnValueOnce(true);
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    await tablePage.cancelBooking({ stopPropagation: jest.fn() }, 2);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/restaurant/tables/2/status'),
      expect.objectContaining({ method: 'PUT' })
    );
    expect(document.getElementById('restaurant-page-message').className).toContain('success');
  });

  test('cancelBooking exits when confirm is false', async () => {
    const event = { stopPropagation: jest.fn() };
    global.confirm.mockReturnValueOnce(false);

    await tablePage.cancelBooking(event, 2);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('addTable validates capacity and creates table', async () => {
    global.prompt.mockReturnValueOnce('0');
    await window.addTable();
    expect(document.getElementById('restaurant-page-message').className).toContain('error');

    global.prompt.mockReturnValueOnce('6');
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1 }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    await window.addTable();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/restaurant/tables'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(document.getElementById('restaurant-page-message').className).toContain('success');
  });

  test('addTable shows API error when create fails', async () => {
    global.prompt.mockReturnValueOnce('4');
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1 }] })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Duplicate table' }) });

    await window.addTable();

    expect(document.getElementById('restaurant-page-message').textContent).toBe('Duplicate table');
    expect(document.getElementById('restaurant-page-message').className).toContain('error');
  });

  test('focus event reloads tables', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    window.dispatchEvent(new Event('focus'));
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/restaurant/tables'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  test('navigation and logout events cover branch handlers', () => {
    document.querySelector('[data-panel-target="tables"]').click();
    expect(document.getElementById('table-management-panel').hidden).toBe(false);

    document.querySelector('[data-panel-target="register"]').click();
    window.openOrder(5);

    global.confirm.mockReturnValueOnce(false);
    document.getElementById('logoutButton').click();
    expect(localStorage.getItem('token')).toBe('staff-token');

    global.confirm.mockReturnValueOnce(true);
    document.getElementById('logoutButton').click();
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('auth headers and message helpers cover optional branches', () => {
    expect(tablePage.getAuthHeaders(false)).toEqual({ Authorization: 'Bearer staff-token' });

    tablePage.showPageMessage('Hello', 'info');
    expect(document.getElementById('restaurant-page-message').hidden).toBe(false);

    tablePage.clearPageMessage();
    expect(document.getElementById('restaurant-page-message').hidden).toBe(true);
  });
});
