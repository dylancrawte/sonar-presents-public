import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    bio: { type: String },
    website: { type: String },
    genre: { type: [String], default: [] },
    playlist: { type: [String], default: [] },
    familyFriendly: { type: Boolean, default: true },
    artwork: { type: String },   // URL to hosted image
    url: { type: String },       // URL to hosted MP3
  });

songSchema.index({ artist: 1, title: 1 }, { unique: true });

export default mongoose.model("Song", songSchema);