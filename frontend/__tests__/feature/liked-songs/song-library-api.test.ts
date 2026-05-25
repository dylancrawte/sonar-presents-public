import axios from 'axios';

jest.mock('axios');
jest.mock('react-native-track-player', () => ({}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

import {
  fetchLikedSongs,
  addLikedSong,
  deleteLikedSong,
} from '@/api/song-library-api';

const mockTrack = {
  id: '507f191e810c19729de860ea',
  url: 'http://song1.mp3',
  title: 'Song 1',
  artist: 'Artist 1',
  artwork: 'art1.png',
};

describe('fetchLikedSongs', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls GET /api/liked-songs/fetch with userID param', async () => {
    mockedAxios.get.mockResolvedValue({ data: { likedSongs: [] } });

    await fetchLikedSongs('user_123');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/liked-songs/fetch'),
      { params: { userID: 'user_123' } }
    );
  });

  it('maps legacy response items ({ track }) to Song array', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        likedSongs: [
          { track: { url: 'http://s1.mp3', title: 'A', artist: 'B', artwork: 'c.png' } },
          { track: { url: 'http://s2.mp3', title: 'D', artist: 'E', artwork: 'f.png' } },
        ],
      },
    });

    const result = await fetchLikedSongs('user_123');

    expect(result).toEqual([
      { url: 'http://s1.mp3', title: 'A', artist: 'B', artwork: 'c.png' },
      { url: 'http://s2.mp3', title: 'D', artist: 'E', artwork: 'f.png' },
    ]);
  });

  it('maps populated liked songs (plain Song objects) to Song array', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        likedSongs: [
          { id: '507f191e810c19729de860ea', url: 'http://s1.mp3', title: 'A', artist: 'B', artwork: 'c.png' },
        ],
      },
    });

    const result = await fetchLikedSongs('user_123');

    expect(result).toEqual([
      { id: '507f191e810c19729de860ea', url: 'http://s1.mp3', title: 'A', artist: 'B', artwork: 'c.png' },
    ]);
  });

  it('returns empty array when user has no liked songs', async () => {
    mockedAxios.get.mockResolvedValue({ data: { likedSongs: [] } });

    const result = await fetchLikedSongs('user_123');
    expect(result).toEqual([]);
  });

  it('rethrows on network error', async () => {
    const error = new Error('Network error');
    mockedAxios.get.mockRejectedValue(error);
    mockedAxios.isAxiosError.mockReturnValue(true);

    await expect(fetchLikedSongs('user_123')).rejects.toThrow('Network error');
  });
});

describe('addLikedSong', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls POST /api/liked-songs/like with userID and songId', async () => {
    mockedAxios.post.mockResolvedValue({
      status: 201,
      data: { message: 'Track liked successfully' },
    });

    await addLikedSong('user_123', mockTrack as any);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/liked-songs/like'),
      { userID: 'user_123', songId: mockTrack.id }
    );
  });

  it('throws when track has no id', async () => {
    await expect(
      addLikedSong('user_123', { ...mockTrack, id: undefined } as any)
    ).rejects.toThrow('Song id is required');
  });

  it('returns response data on 201', async () => {
    const responseData = { message: 'Track liked successfully', likedSong: {} };
    mockedAxios.post.mockResolvedValue({ status: 201, data: responseData });

    const result = await addLikedSong('user_123', mockTrack as any);
    expect(result).toEqual(responseData);
  });

  it('returns undefined on non-201 status', async () => {
    mockedAxios.post.mockResolvedValue({
      status: 400,
      data: { message: 'Song already exists' },
    });

    const result = await addLikedSong('user_123', mockTrack as any);
    expect(result).toBeUndefined();
  });

  it('catches errors without rethrowing', async () => {
    const error = new Error('Post failed');
    (error as any).response = { status: 500, data: { message: 'Internal error' } };
    mockedAxios.post.mockRejectedValue(error);
    mockedAxios.isAxiosError.mockReturnValue(true);

    const result = await addLikedSong('user_123', mockTrack as any);
    expect(result).toBeUndefined();
  });
});

describe('deleteLikedSong', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls DELETE /api/liked-songs/delete with userID and songId params', async () => {
    mockedAxios.delete.mockResolvedValue({
      status: 200,
      data: { message: 'Track deleted successfully' },
    });

    await deleteLikedSong('user_123', mockTrack.id);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/api/liked-songs/delete'),
      { params: { userID: 'user_123', songId: mockTrack.id } }
    );
  });

  it('returns response data on 200', async () => {
    const responseData = { message: 'Track deleted successfully' };
    mockedAxios.delete.mockResolvedValue({ status: 200, data: responseData });

    const result = await deleteLikedSong('user_123', mockTrack.id);
    expect(result).toEqual(responseData);
  });

  it('returns undefined on non-200 status', async () => {
    mockedAxios.delete.mockResolvedValue({
      status: 404,
      data: { message: 'Track not found' },
    });

    const result = await deleteLikedSong('user_123', mockTrack.id);
    expect(result).toBeUndefined();
  });

  it('catches errors without rethrowing', async () => {
    const error = new Error('Delete failed');
    (error as any).response = { status: 500, data: { message: 'Internal error' } };
    mockedAxios.delete.mockRejectedValue(error);
    mockedAxios.isAxiosError.mockReturnValue(true);

    const result = await deleteLikedSong('user_123', mockTrack.id);
    expect(result).toBeUndefined();
  });
});
