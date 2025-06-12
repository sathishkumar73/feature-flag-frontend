// Tests for lib/apiClient.ts
jest.mock('../supabaseClient');

const apiClient = require('../apiClient');
const getHeaders = apiClient.getHeaders;
const addRequestInterceptor = apiClient.addRequestInterceptor;
const addResponseInterceptor = apiClient.addResponseInterceptor;
const supabase = require('../supabaseClient').supabase;

describe('getHeaders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns correct headers with no token', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    const headers = await getHeaders();
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Authorization']).toBeUndefined();
  });

  it('returns correct headers with token', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { access_token: 'abc123' } } });
    const headers = await getHeaders();
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Authorization']).toBe('Bearer abc123');
  });

  it('merges additional headers', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { access_token: 'abc123' } } });
    const headers = await getHeaders({ 'X-Test': 'yes' });
    expect(headers['X-Test']).toBe('yes');
    expect(headers['Authorization']).toBe('Bearer abc123');
  });
});

describe('Interceptors', () => {
  it('calls request and response interceptors', async () => {
    const reqInterceptor = jest.fn(async (input, init) => ({ input, init }));
    const resInterceptor = jest.fn(async (res) => res);
    addRequestInterceptor(reqInterceptor);
    addResponseInterceptor(resInterceptor);
    // Simulate a fetch call
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}), url: 'http://test', status: 200 });
    await apiClient.apiGet('test');
    expect(reqInterceptor).toHaveBeenCalled();
    expect(resInterceptor).toHaveBeenCalled();
  });
});

describe('parseErrorResponse', () => {
  it('parses error from JSON body', () => {
    const res = { status: 400 };
    const err = apiClient.parseErrorResponse(res, JSON.stringify({ error: 'fail', status: 400 }));
    expect(err.message).toBe('fail');
    expect(err.status).toBe(400);
  });

  it('parses error from first string property', () => {
    const res = { status: 400 };
    const err = apiClient.parseErrorResponse(res, JSON.stringify({ foo: 'bar' }));
    expect(err.message).toBe('bar');
  });

  it('returns generic error if not JSON', () => {
    const res = { status: 500 };
    const err = apiClient.parseErrorResponse(res, 'not-json');
    expect(err.message).toBe('not-json');
  });
});
