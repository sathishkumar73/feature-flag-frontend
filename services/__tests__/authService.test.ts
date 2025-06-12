jest.mock('@/lib/supabaseClient');
import authService from '../authService';
import { apiPost } from '@/lib/apiClient';

jest.mock('@/lib/apiClient');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signup calls apiPost with correct data', async () => {
    (apiPost as jest.Mock).mockResolvedValue({});
    const payload = { email: 'test@example.com', password: 'pw' };
    await authService.signup(payload);
    expect(apiPost).toHaveBeenCalledWith('/auth/signup', expect.objectContaining(payload));
  });

  it('login calls apiPost with correct data', async () => {
    (apiPost as jest.Mock).mockResolvedValue({});
    const payload = { email: 'test@example.com', password: 'pw' };
    await authService.login(payload);
    expect(apiPost).toHaveBeenCalledWith('/auth/login', expect.objectContaining(payload));
  });
});
