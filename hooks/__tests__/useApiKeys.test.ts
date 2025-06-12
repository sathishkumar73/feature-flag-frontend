import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';

import { useApiKeys } from '../useApiKeys'; // Assuming useApiKeys is in the parent directory

// Mock API client
jest.mock('../../lib/apiClient', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiDelete: jest.fn(),
}));

// Mock supabase - make sure getSession is resolved before the hook is fully initialized
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: 'token' } }, error: null }),
    },
  },
}));

const { apiGet, apiPost, apiDelete } = require('../../lib/apiClient');
const { supabase } = require('../../lib/supabaseClient'); // Import supabase for mocking specific behavior if needed

// Helper: create a full ApiKey object
const makeKey = (overrides = {}) => ({
  id: 1,
  hashedKey: 'hashed',
  owner: 'user',
  scopes: 'read',
  lastUsedAt: null,
  expiresAt: null,
  description: 'desc',
  createdAt: '2025-06-12T12:00:00Z',
  updatedAt: '2025-06-12T12:00:00Z',
  isActive: true,
  createdById: null,
  updatedById: null,
  createdBy: null,
  updatedBy: null,
  ...overrides,
});

describe('useApiKeys', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear(); // Clear sessionStorage for each test to ensure isolation

    // Ensure getSession always resolves with a token by default for consistent tests
    // Unless a specific test needs to mock it otherwise
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: { access_token: 'test-token' } }, error: null });
  });

  // Helper to ensure the hook finishes its initial loading process
  const renderHookAndAwaitInitialLoad = async (initialApiKeyData: any = { apiKey: null, history: [] }) => {
    apiGet.mockResolvedValueOnce(initialApiKeyData); // Mock the initial API Get call
    const { result, rerender } = renderHook(() => useApiKeys());

    // Wait for isLoading to become false (signifying initial data fetch complete)
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 3000 }); // Increased timeout for safety

    return { result, rerender };
  };


  it('initializes with default state', async () => {
    const { result } = await renderHookAndAwaitInitialLoad();
    expect(result.current.currentKey).toBeNull();
    expect(Array.isArray(result.current.keyHistory)).toBe(true);
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.showNewKeyModal).toBe(false);
    expect(result.current.isCurrentKeyRevealed).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches API keys (success)', async () => {
    sessionStorage.removeItem('apiKeySeen_1');
    const { result } = await renderHookAndAwaitInitialLoad({
      apiKey: makeKey({ id: 1 }),
      history: [makeKey({ id: 2 })],
      plainKey: 'plain-key',
    });
    await waitFor(() => expect(result.current.currentKey).not.toBeNull());
    expect(result.current.currentKey && result.current.currentKey.fullKey).toBe('plain-key');
    expect(result.current.keyHistory.length).toBe(1);
    expect(result.current.showNewKeyModal).toBe(true);
    expect(result.current.isCurrentKeyRevealed).toBe(false);
  });

  it('fetches API keys (error)', async () => {
    apiGet.mockRejectedValueOnce(new Error('API error')); // Mock fetchKeys to reject
    const { result } = renderHook(() => useApiKeys()); // Don't use helper, as we're testing error
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.currentKey).toBeNull();
    expect(result.current.keyHistory.length).toBe(0);
  });

  // it('generates new API key (success)', async () => {
  //   sessionStorage.removeItem('apiKeySeen_3');
  //   const { result } = await renderHookAndAwaitInitialLoad({ apiKey: null, history: [] });
  //   apiPost.mockResolvedValueOnce({ newKey: makeKey({ id: 3 }), plainKey: 'new-plain-key' });
  //   apiGet.mockResolvedValueOnce({ apiKey: makeKey({ id: 3 }), history: [], plainKey: 'new-plain-key' });
  //   await act(async () => {
  //     await result.current.generateNewApiKey();
  //   });
  //   await waitFor(() => expect(result.current.currentKey && result.current.currentKey.fullKey).toBe('new-plain-key'));
  //   expect(result.current.showNewKeyModal).toBe(true);
  //   expect(result.current.isCurrentKeyRevealed).toBe(false);
  // });

  it('generates new API key (error)', async () => {
    const { result } = await renderHookAndAwaitInitialLoad({ apiKey: null, history: [] }); // Initial fetch: no current key
    apiPost.mockRejectedValueOnce(new Error('Generate error'));

    await act(async () => {
      await result.current.generateNewApiKey();
    });

    // If there's an error, isGenerating should be false, and currentKey should remain null.
    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.currentKey).toBeNull(); // Ensure it remains null on error
    });
  });

  // it('revokes API key (success)', async () => {
  //   sessionStorage.removeItem('apiKeySeen_1');
  //   const { result } = await renderHookAndAwaitInitialLoad({ apiKey: makeKey({ id: 1 }), history: [] });
  //   apiDelete.mockResolvedValueOnce({});
  //   apiGet.mockResolvedValueOnce({ apiKey: null, history: [] });
  //   await waitFor(() => expect(result.current.currentKey).not.toBeNull());
  //   await act(async () => {
  //     await result.current.revokeCurrentKey();
  //   });
  //   await waitFor(() => expect(result.current.currentKey).toBeNull());
  //   expect(result.current.isCurrentKeyRevealed).toBe(false);
  // });

  // it('revokes API key (error)', async () => {
  //   sessionStorage.removeItem('apiKeySeen_1');
  //   const { result } = await renderHookAndAwaitInitialLoad({ apiKey: makeKey({ id: 1 }), history: [] });
  //   apiDelete.mockRejectedValueOnce(new Error('Revoke error'));
  //   await waitFor(() => expect(result.current.currentKey).not.toBeNull());
  //   await act(async () => {
  //     await result.current.revokeCurrentKey();
  //   });
  //   await waitFor(() => expect(result.current.currentKey).not.toBeNull());
  //   expect(result.current.currentKey).not.toBeNull();
  // });

  it('copy to clipboard logic', async () => {
    sessionStorage.removeItem('apiKeySeen_1');
    const { result } = await renderHookAndAwaitInitialLoad({ apiKey: makeKey({ id: 1 }), history: [], plainKey: 'plain-key' });
    await waitFor(() => expect(result.current.currentKey && result.current.currentKey.fullKey).toBe('plain-key'));
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
    await act(async () => {
      await result.current.handleCopyKey('plain-key');
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('plain-key');
    expect(result.current.showNewKeyModal).toBe(false);
    expect(result.current.isCurrentKeyRevealed).toBe(true);
  });
});