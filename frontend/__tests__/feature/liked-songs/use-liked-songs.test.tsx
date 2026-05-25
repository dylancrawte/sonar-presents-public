import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockFetchLikedSongs = jest.fn();
const mockAddLikedSong = jest.fn();
const mockDeleteLikedSong = jest.fn();

jest.mock('@/api/song-library-api', () => ({
  fetchLikedSongs: (...args: any[]) => mockFetchLikedSongs(...args),
  addLikedSong: (...args: any[]) => mockAddLikedSong(...args),
  deleteLikedSong: (...args: any[]) => mockDeleteLikedSong(...args),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({ user: { id: 'user_123' } }),
}));

jest.mock('react-native-track-player', () => ({}));

import { useLikedSongs } from '@/hooks/cache/use-liked-songs';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const mockTrack = {
  id: '507f191e810c19729de860ea',
  url: 'http://song1.mp3',
  title: 'Song 1',
  artist: 'Artist 1',
  artwork: 'art1.png',
};

describe('useLikedSongs', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches liked songs for the current user on mount', async () => {
    const songs = [mockTrack];
    mockFetchLikedSongs.mockResolvedValue(songs);

    const { result } = renderHook(() => useLikedSongs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.likedSongs).toEqual(songs);
    });

    expect(mockFetchLikedSongs).toHaveBeenCalledWith('user_123');
  });

  it('returns undefined for likedSongs while loading', () => {
    mockFetchLikedSongs.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useLikedSongs(), {
      wrapper: createWrapper(),
    });

    expect(result.current.likedSongs).toBeUndefined();
  });

  it('addLikedSongMutation calls addLikedSong with correct args', async () => {
    mockFetchLikedSongs.mockResolvedValue([]);
    mockAddLikedSong.mockResolvedValue({ message: 'Track liked' });

    const { result } = renderHook(() => useLikedSongs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.likedSongs).toBeDefined());

    await act(async () => {
      await result.current.addLikedSongMutation({
        userID: 'user_123',
        track: mockTrack as any,
      });
    });

    expect(mockAddLikedSong).toHaveBeenCalledWith('user_123', mockTrack);
  });

  it('refetches liked songs after adding a song (cache invalidation)', async () => {
    mockFetchLikedSongs.mockResolvedValue([]);
    mockAddLikedSong.mockResolvedValue({ message: 'Track liked' });

    const { result } = renderHook(() => useLikedSongs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.likedSongs).toBeDefined());
    const fetchCountBefore = mockFetchLikedSongs.mock.calls.length;

    await act(async () => {
      await result.current.addLikedSongMutation({
        userID: 'user_123',
        track: mockTrack as any,
      });
    });

    await waitFor(() => {
      expect(mockFetchLikedSongs.mock.calls.length).toBeGreaterThan(
        fetchCountBefore
      );
    });
  });

  it('deleteLikedSongMutation calls deleteLikedSong with correct args', async () => {
    mockFetchLikedSongs.mockResolvedValue([]);
    mockDeleteLikedSong.mockResolvedValue({ message: 'Track deleted' });

    const { result } = renderHook(() => useLikedSongs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.likedSongs).toBeDefined());

    await act(async () => {
      await result.current.deleteLikedSongMutation({
        userID: 'user_123',
        songId: mockTrack.id,
      });
    });

    expect(mockDeleteLikedSong).toHaveBeenCalledWith(
      'user_123',
      mockTrack.id
    );
  });

  it('refetches liked songs after deleting a song (cache invalidation)', async () => {
    mockFetchLikedSongs.mockResolvedValue([mockTrack]);
    mockDeleteLikedSong.mockResolvedValue({ message: 'Track deleted' });

    const { result } = renderHook(() => useLikedSongs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.likedSongs).toBeDefined());
    const fetchCountBefore = mockFetchLikedSongs.mock.calls.length;

    await act(async () => {
      await result.current.deleteLikedSongMutation({
        userID: 'user_123',
        songId: mockTrack.id,
      });
    });

    await waitFor(() => {
      expect(mockFetchLikedSongs.mock.calls.length).toBeGreaterThan(
        fetchCountBefore
      );
    });
  });
});
