import axios from 'axios';
import { Track } from 'react-native-track-player';


// Song type extends Track, but overrides genre to be an array of strings
export interface Song extends Omit<Track, 'genre'> {
    genre?: string[];
    playlist?: string[];
    bio?: string;
    website?: string;
}

const baseUrl = process.env.EXPO_PUBLIC_API_URL;

type SongDocument = {
    _id: string;
    url?: string;
    title: string;
    artist: string;
    artwork?: string;
    genre?: string[];
    playlist?: string[];
    bio?: string;
    website?: string;
};

function mapDocumentToSong(doc: SongDocument): Song {
    return {
        id: String(doc._id),
        url: doc.url ?? '',
        title: doc.title,
        artist: doc.artist,
        artwork: doc.artwork,
        genre: doc.genre,
        playlist: doc.playlist,
        bio: doc.bio,
        website: doc.website,
    };
}

export const fetchSongs = async (): Promise<Song[]> => {
    if (!baseUrl) {
        console.warn('fetchSongs: EXPO_PUBLIC_API_URL is not set');
        return [];
    }

    try {
        const response = await axios.get<SongDocument[]>(`${baseUrl}/api/songs/fetch`);
        const rows = Array.isArray(response.data) ? response.data : [];
        return rows.filter((doc) => doc.url).map(mapDocumentToSong);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.error(
                    'Error fetching songs:',
                    error.response.status,
                    error.response.data
                );
            } else {
                console.error(
                    'Error fetching songs (no response — check API URL / network):',
                    error.message,
                    error.code
                );
            }
        } else {
            console.error('Error fetching songs:', error);
        }
        throw error;
    }
}

// TODO: Implement proper type for responses
export const fetchLikedSongs = async (userID: string) => {

    try {
        const response = await axios.get(`${baseUrl}/api/liked-songs/fetch`, {
            params: { userID }
        });

        const raw = response.data.likedSongs ?? [];
        const tracks: Song[] = raw.map(
            (item: Song | { track: Song }) =>
                item != null && typeof item === 'object' && 'track' in item && item.track
                    ? item.track
                    : (item as Song)
        );

        return tracks;
        
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching liked songs:', error.response?.data?.message);
        }
        throw error;
    }
}

export const addLikedSong = async (userID: string, track: Song) => {
    if (!track.id) {
        console.error('addLikedSong: track.id is required to reference the songs collection');
        throw new Error('Song id is required');
    }

    return axios.post(`${baseUrl}/api/liked-songs/like`, { userID, songId: track.id })
    .then(response => {
        if (response.status === 201) {
            console.log("api response: ", response.data);
            return response.data;
        }
        else {
            console.error('Error adding liked song:', response.data.message);
        }
    })
    .catch(error => {
        if (axios.isAxiosError(error)) {
            console.error(
              'Error adding liked song:',
              error.response?.status,
              error.response?.data?.message
            );
          } else {
            console.error('Error adding liked song:', error);
          }
    });
}

/** `songId` is the Song document id (same as `track.id` on the client). */
export const deleteLikedSong = async (userID: string, songId: string) => {
    return axios.delete(`${baseUrl}/api/liked-songs/delete`, { params: { userID, songId }})
    .then(response => {
        if (response.status === 200) {
            console.log("api response: ", response.data);
            return response.data;
        }
        else {
            console.error('Error deleting liked song:', response.data.message);
        }
    })
    .catch(error => {
        if (axios.isAxiosError(error)) {
            console.error('Error deleting liked song:', error.response?.status, error.response?.data?.message);
        } else {
            console.error('Error deleting liked song:', error);
        }
    });
}

export const fetchPlaylist = async (playlist: string): Promise<Song[]> => {
    if (!baseUrl) {
        console.warn('fetchPlaylist: EXPO_PUBLIC_API_URL is not set');
        return [];
    }

    const trimmed = playlist.trim();
    if (!trimmed) {
        return [];
    }

    try {
        const response = await axios.get<SongDocument[]>(
            `${baseUrl}/api/songs/by-playlist`,
            { params: { playlist: trimmed } }
        );
        const rows = Array.isArray(response.data) ? response.data : [];
        return rows.filter((doc) => doc.url).map(mapDocumentToSong);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.error(
                    'Error fetching playlist songs:',
                    error.response.status,
                    error.response.data
                );
            } else {
                console.error(
                    'Error fetching playlist songs (no response — check API URL / network):',
                    error.message,
                    error.code
                );
            }
        } else {
            console.error('Error fetching playlist songs:', error);
        }
        throw error;
    }
};