import { renderHook, act, waitFor } from '@testing-library/react';
import { useFeatureFlags } from '../useFeatureFlags';

// Mock API client
jest.mock('../../lib/apiClient', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
}));

// Mock supabase
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: 'token' } }, error: null }),
    },
  },
}));

const { apiGet, apiPost, apiPut } = require('../../lib/apiClient');

// Helper: create a full FeatureFlag object
const makeFlag = (overrides = {}) => ({
  id: '1',
  name: 'Flag 1',
  enabled: false,
  environment: 'Production' as 'Production',
  createdAt: '',
  updatedAt: '',
  createdById: '',
  updatedById: '',
  rolloutPercentage: 100,
  description: '',
  ...overrides,
});

describe('useFeatureFlags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', async () => {
    const { result } = renderHook(() => useFeatureFlags(5, 'http://localhost'));
    expect(result.current.searchTerm).toBe('');
    expect(result.current.environmentFilter).toBe('');
    expect(result.current.statusFilter).toBe('');
    expect(result.current.currentPage).toBe(1);
    expect(result.current.isLoadingFlags).toBe(true);
    expect(Array.isArray(result.current.paginatedFlags)).toBe(true);
  });

  it('fetches flags (success)', async () => {
    apiGet.mockResolvedValueOnce([
      makeFlag({ id: '1', name: 'Flag 1', enabled: true }),
      makeFlag({ id: '2', name: 'Flag 2', enabled: false, environment: 'Development' }),
    ]);
    const { result } = renderHook(() => useFeatureFlags(5, 'http://localhost'));
    await waitFor(() => expect(result.current.isLoadingFlags).toBe(false));
    expect(result.current.paginatedFlags.length).toBe(2);
  });

  it('fetches flags (error)', async () => {
    apiGet.mockRejectedValueOnce(new Error('API error'));
    const { result } = renderHook(() => useFeatureFlags(5, 'http://localhost'));
    await waitFor(() => expect(result.current.isLoadingFlags).toBe(false));
    expect(result.current.error).toBe('API error');
    expect(result.current.paginatedFlags.length).toBe(0);
  });

  it('filters, sorts, and paginates flags', async () => {
    apiGet.mockResolvedValueOnce([
      makeFlag({ id: '1', name: 'Alpha', environment: 'Production', createdAt: '2024-01-01' }),
      makeFlag({ id: '2', name: 'Beta', environment: 'Development', createdAt: '2024-01-02' }),
      makeFlag({ id: '3', name: 'Gamma', environment: 'Production', createdAt: '2024-01-03' }),
    ]);
    const { result } = renderHook(() => useFeatureFlags(2, 'http://localhost'));
    await waitFor(() => expect(result.current.isLoadingFlags).toBe(false));
    act(() => {
      result.current.setSearchTerm('Alpha');
    });
    expect(result.current.filteredAndSortedFlags.length).toBe(1);
    act(() => {
      result.current.setSearchTerm('');
      result.current.setEnvironmentFilter('Production');
    });
    expect(result.current.filteredAndSortedFlags.length).toBe(2);
    act(() => {
      result.current.handleSort('createdAt');
    });
    expect(result.current.currentPage).toBe(1);
    expect(result.current.paginatedFlags.length).toBe(2);
  });

  it('creates a flag (success)', async () => {
    apiGet.mockResolvedValueOnce([]); // Initial fetch
    apiPost.mockResolvedValueOnce(makeFlag({ id: '3', name: 'New Flag', environment: 'Development' }));
    const { result } = renderHook(() => useFeatureFlags(5, 'http://localhost'));
    await waitFor(() => expect(result.current.isLoadingFlags).toBe(false));
    await act(async () => {
      const flag = await result.current.handleCreateFlag({ name: 'New Flag', environment: 'Development' });
      expect(flag).toBeTruthy();
    });
  });

  it('creates a flag (error)', async () => {
    apiGet.mockResolvedValueOnce([]); // Initial fetch
    apiPost.mockRejectedValueOnce(new Error('Create error'));
    const { result } = renderHook(() => useFeatureFlags(5, 'http://localhost'));
    await waitFor(() => expect(result.current.isLoadingFlags).toBe(false));
    await act(async () => {
      const flag = await result.current.handleCreateFlag({ name: 'Fail Flag', environment: 'Development' });
      expect(flag).toBeNull();
      expect(result.current.isCreatingFlag).toBe(false);
    });
  });

  it('toggles a flag (success)', async () => {
    apiGet.mockResolvedValueOnce([
      makeFlag({ id: '1', name: 'Flag 1', enabled: false, environment: 'Production' }),
    ]);
    apiPut.mockResolvedValueOnce({});
    const { result } = renderHook(() => useFeatureFlags(5, 'http://localhost'));
    await waitFor(() => expect(result.current.isLoadingFlags).toBe(false));
    await act(async () => {
      await result.current.handleToggleFlag(makeFlag({ id: '1', name: 'Flag 1', enabled: false, environment: 'Production' }));
    });
    expect(result.current.isTogglingFlagId).toBe(null);
  });

  it('toggles a flag (error)', async () => {
    apiGet.mockResolvedValueOnce([
      makeFlag({ id: '1', name: 'Flag 1', enabled: false, environment: 'Production' }),
    ]);
    apiPut.mockRejectedValueOnce(new Error('Toggle error'));
    const { result } = renderHook(() => useFeatureFlags(5, 'http://localhost'));
    await waitFor(() => expect(result.current.isLoadingFlags).toBe(false));
    await act(async () => {
      await result.current.handleToggleFlag(makeFlag({ id: '1', name: 'Flag 1', enabled: false, environment: 'Production' }));
    });
    expect(result.current.isTogglingFlagId).toBe(null);
  });
});
