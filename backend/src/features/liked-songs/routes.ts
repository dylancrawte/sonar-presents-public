import express from 'express';
import mongoose from 'mongoose';
import LikedSong from './Model';
import Song from '../songs/Model';

const router = express.Router();

type SongLean = {
  _id: mongoose.Types.ObjectId;
  url?: string;
  title: string;
  artist: string;
  artwork?: string;
  genre?: string[];
  playlist?: string[];
  bio?: string;
  website?: string;
};

function mapSongToClient(doc: SongLean | null | undefined) {
  if (!doc) return null;
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

/** Legacy embedded track shape (from older liked-songs documents). */
function mapLegacyTrackToClient(track: {
  url?: string;
  title?: string;
  artist?: string;
  artwork?: string;
  genre?: string[];
  playlist?: string[];
  bio?: string;
  website?: string;
}) {
  if (!track?.url) return null;
  return {
    id: track.url,
    url: track.url,
    title: track.title ?? '',
    artist: track.artist ?? '',
    artwork: track.artwork,
    genre: track.genre,
    playlist: track.playlist,
    bio: track.bio,
    website: track.website,
  };
}

router.get('/fetch', async (req, res) => {
  try {
    const { userID } = req.query;

    if (!userID || typeof userID !== 'string') {
      return res.status(400).json({ message: 'userID is required' });
    }

    const entries = await LikedSong.find({ userID }).populate('song').lean();

    const likedSongs: ReturnType<typeof mapSongToClient>[] = [];

    for (const entry of entries) {
      const populated = entry.song as SongLean | null | undefined;
      if (populated && populated._id) {
        const mapped = mapSongToClient(populated);
        if (mapped) likedSongs.push(mapped);
        continue;
      }

      // Legacy: embedded `track` only (no ObjectId ref)
      const legacy = (entry as { track?: Parameters<typeof mapLegacyTrackToClient>[0] }).track;
      if (legacy) {
        const byUrl = await Song.findOne({ url: legacy.url }).lean();
        if (byUrl) {
          const mapped = mapSongToClient(byUrl as SongLean);
          if (mapped) likedSongs.push(mapped);
        } else {
          const fallback = mapLegacyTrackToClient(legacy);
          if (fallback) likedSongs.push(fallback);
        }
      }
    }

    return res.status(200).json({ message: 'Songs found!', likedSongs });
  } catch (error) {
    console.error('Error fetching liked song:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/like', async (req, res) => {
  try {
    const { userID, songId } = req.body;

    if (!userID || !songId) {
      return res.status(400).json({ message: 'User ID and songId are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(songId)) {
      return res.status(400).json({ message: 'Invalid songId' });
    }

    const songExists = await Song.findById(songId).lean();
    if (!songExists) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const existing = await LikedSong.findOne({ userID, song: songId });
    if (existing) {
      return res.status(400).json({ message: 'Song already exists' });
    }

    const likedSong = new LikedSong({ userID, song: songId });
    await likedSong.save();

    console.log('Track liked successfully:', likedSong);

    return res.status(201).json({ message: 'Track liked successfully', likedSong });
  } catch (error) {
    console.error('Error liking track:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/delete', async (req, res) => {
  try {
    const { userID, songId } = req.query;

    if (!userID || !songId || typeof userID !== 'string' || typeof songId !== 'string') {
      return res.status(400).json({ message: 'User ID and songId are required' });
    }

    let deletedSong = null;

    if (mongoose.Types.ObjectId.isValid(songId)) {
      deletedSong = await LikedSong.findOneAndDelete({ userID, song: songId });
    }

    // Legacy liked rows keyed by embedded track.url (or client used url as id)
    if (!deletedSong) {
      deletedSong = await LikedSong.findOneAndDelete({ userID, 'track.url': songId });
    }

    // Fetch maps legacy embedded `track` to the canonical Song._id when a Song exists
    // for that URL — but the LikedSong row still has no `song` ref. Delete must resolve
    // ObjectId → song.url to match `track.url` in the DB.
    if (!deletedSong && mongoose.Types.ObjectId.isValid(songId)) {
      const songDoc = await Song.findById(songId).lean();
      if (songDoc?.url) {
        deletedSong = await LikedSong.findOneAndDelete({ userID, 'track.url': songDoc.url });
      }
    }

    if (deletedSong) {
      return res.status(200).json({ message: 'Track deleted successfully', deletedSong });
    }

    return res.status(404).json({ message: 'Track not found' });
  } catch (error) {
    console.error('Error deleting track:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
