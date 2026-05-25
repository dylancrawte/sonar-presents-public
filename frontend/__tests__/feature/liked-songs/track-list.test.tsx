import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockDeleteLikedSongMutation = jest.fn();
const mockHandleTrackSelect = jest.fn();

const mockSongs = [
  { id: '507f191e810c19729de860ea', url: 'http://s1.mp3', title: 'Song 1', artist: 'Artist 1', artwork: 'a1.png' },
  { id: '507f191e810c19729de860eb', url: 'http://s2.mp3', title: 'Song 2', artist: 'Artist 2', artwork: 'a2.png' },
];

jest.mock('@/hooks/cache/use-liked-songs', () => ({
  useLikedSongs: () => ({
    likedSongs: mockSongs,
    deleteLikedSongMutation: mockDeleteLikedSongMutation,
  }),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({ user: { id: 'user_123' } }),
}));

jest.mock('@/controllers/track-player-controller', () => ({
  handleQueueTrackSelect: (...args: any[]) => mockHandleTrackSelect(...args),
}));

jest.mock('react-native-track-player', () => ({}));

jest.mock('@/components/songs/track-list-item', () => {
  const { View, Text, Pressable } = require('react-native');
  return {
    TrackListItem: ({ track, onTrackSelect, onRemove }: any) => (
      <View testID={`track-${track.url}`}>
        <Text>{track.artist}</Text>
        <Text>{track.title}</Text>
        <Pressable testID={`play-${track.url}`} onPress={() => onTrackSelect(track)} />
        {onRemove ? (
          <Pressable testID={`remove-${track.url}`} onPress={() => onRemove(track)} />
        ) : null}
      </View>
    ),
  };
});

jest.mock('@/styles', () => ({
  utilStyles: { itemSeperator: {} },
}));

import { TrackList } from '@/components/songs/track-list';

describe('TrackList', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders all liked songs', () => {
    const { getByText } = render(<TrackList />);
    expect(getByText('Artist 1')).toBeTruthy();
    expect(getByText('Song 1')).toBeTruthy();
    expect(getByText('Artist 2')).toBeTruthy();
    expect(getByText('Song 2')).toBeTruthy();
  });

  it('calls handleQueueTrackSelect when a track is played', () => {
    const { getByTestId } = render(<TrackList />);
    fireEvent.press(getByTestId('play-http://s1.mp3'));

    expect(mockHandleTrackSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        queueId: 'liked-songs',
        queueSongs: mockSongs,
        selectedTrack: expect.objectContaining({
          url: 'http://s1.mp3',
          title: 'Song 1',
        }),
      })
    );
  });

  it('calls deleteLikedSongMutation with correct args when remove is pressed', async () => {
    mockDeleteLikedSongMutation.mockResolvedValue({ message: 'Deleted' });

    const { getByTestId } = render(<TrackList />);
    fireEvent.press(getByTestId('remove-http://s1.mp3'));

    await waitFor(() => {
      expect(mockDeleteLikedSongMutation).toHaveBeenCalledWith({
        userID: 'user_123',
        songId: mockSongs[0].id,
      });
    });
  });

  it('passes each track to its own list item', () => {
    const { getByTestId } = render(<TrackList />);
    expect(getByTestId('track-http://s1.mp3')).toBeTruthy();
    expect(getByTestId('track-http://s2.mp3')).toBeTruthy();
  });

  it('uses passed songs and queueId for queue handling', () => {
    const playlistSongs = [
      {
        id: 'p1',
        url: 'http://p1.mp3',
        title: 'P1',
        artist: 'PA1',
        artwork: 'x.png',
      },
    ];
    const { getByTestId } = render(
      <TrackList songs={playlistSongs} queueId="playlist:1" />
    );
    fireEvent.press(getByTestId('play-http://p1.mp3'));

    expect(mockHandleTrackSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        queueSongs: playlistSongs,
        queueId: 'playlist:1',
        selectedTrack: expect.objectContaining({ url: 'http://p1.mp3' }),
      })
    );
  });

  it('does not render remove control when songs prop is provided', () => {
    const { queryByTestId } = render(
      <TrackList songs={[mockSongs[0]]} queueId="playlist:1" />
    );
    expect(queryByTestId('remove-http://s1.mp3')).toBeNull();
  });
});
