jest.mock('@/lib/supabaseClient');
import flagService from '../flagService';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/apiClient';

jest.mock('@/lib/apiClient');

describe('flagService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchFlags calls apiGet with correct params', async () => {
    (apiGet as jest.Mock).mockResolvedValue({ data: [], meta: { totalPages: 1 } });
    await flagService.fetchFlags(2, 20, 'prod', 'name_asc');
    expect(apiGet).toHaveBeenCalledWith('/flags', expect.objectContaining({
      page: 2,
      limit: 20,
      environment: 'prod',
      sort: 'name',
      order: 'asc',
    }));
  });

  it('fetchFlags omits environment param if "all"', async () => {
    (apiGet as jest.Mock).mockResolvedValue({ data: [], meta: { totalPages: 1 } });
    await flagService.fetchFlags(1, 10, 'all', 'createdAt_desc');
    expect(apiGet).toHaveBeenCalledWith('/flags', expect.not.objectContaining({ environment: expect.anything() }));
  });

  it('createFlag calls apiPost with correct data', async () => {
    (apiPost as jest.Mock).mockResolvedValue({});
    await flagService.createFlag({ name: 'f', description: 'd', environment: 'prod', enabled: true });
    expect(apiPost).toHaveBeenCalledWith('/flags', expect.objectContaining({
      name: 'f', description: 'd', environment: 'prod', enabled: true, rolloutPercentage: 0
    }));
  });

  it('updateFlag calls apiPut with correct data', async () => {
    (apiPut as jest.Mock).mockResolvedValue({});
    await flagService.updateFlag('id1', { name: 'f', description: 'd', environment: 'prod', enabled: false, rolloutPercentage: 50 });
    expect(apiPut).toHaveBeenCalledWith('/flags/id1', expect.objectContaining({
      name: 'f', description: 'd', environment: 'prod', enabled: false, rolloutPercentage: 50
    }));
  });

  it('deleteFlag calls apiDelete with correct id', async () => {
    (apiDelete as jest.Mock).mockResolvedValue({});
    await flagService.deleteFlag('id2');
    expect(apiDelete).toHaveBeenCalledWith('/flags/id2');
  });
});
