import mongoose from 'mongoose';

/**
 * References Song by id — no duplicated track payload.
 * `strict: false` allows legacy documents that still have embedded `track` to load until migrated.
 */
const likedSongsSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
    },
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song',
      required: false,
    },
  },
  { strict: false }
);

/** Sparse so legacy rows without `song` don’t collide on null. */
likedSongsSchema.index({ userID: 1, song: 1 }, { unique: true, sparse: true });

const LikedSong = mongoose.model('LikedSong', likedSongsSchema);

export default LikedSong;
