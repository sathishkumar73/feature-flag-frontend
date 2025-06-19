import { getHeaders, addRequestInterceptor, addResponseInterceptor, parseErrorResponse, apiGet } from '../apiClient';
import { supabase } from '../supabaseClient';

// Tests for lib/apiClient.ts
jest.mock('../supabaseClient');

describe('getHeaders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns correct headers with no token', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null } });
    const headers = await getHeaders();
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Authorization']).toBeUndefined();
  });

  it('returns correct headers with token', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: { access_token: 'abc123' } } });
    const headers = await getHeaders();
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Authorization']).toBe('Bearer abc123');
  });

  it('merges additional headers', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: { access_token: 'abc123' } } });
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
    await apiGet('test');
    expect(reqInterceptor).toHaveBeenCalled();
    expect(resInterceptor).toHaveBeenCalled();
  });
});

describe('parseErrorResponse', () => {
  function mockResponse(status: number): Response {
    // @ts-expect-error: minimal mock for testing
    return {
      status,
      headers: new Headers(),
      ok: status >= 200 && status < 300,
      redirected: false,
      statusText: '',
      type: 'basic',
      url: '',
      clone: () => ({} as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      json: async () => ({}),
      text: async () => '',
    };
  }

  it('parses error from JSON body', () => {
    const res = mockResponse(400);
    const err = parseErrorResponse(res, JSON.stringify({ error: 'fail', status: 400 }));
    expect(err.message).toBe('fail');
    // @ts-expect-error: status is attached dynamically
    expect(err.status).toBe(400);
  });

  it('parses error from first string property', () => {
    const res = mockResponse(400);
    const err = parseErrorResponse(res, JSON.stringify({ foo: 'bar' }));
    expect(err.message).toBe('bar');
  });

  it('returns generic error if not JSON', () => {
    const res = mockResponse(500);
    const err = parseErrorResponse(res, 'not-json');
    expect(err.message).toBe('not-json');
  });
});
