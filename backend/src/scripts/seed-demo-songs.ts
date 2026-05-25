import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Song from '../features/songs/Model';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesPath = path.join(__dirname, '../../fixtures/demo-songs.json');

type DemoSong = {
  title: string;
  artist?: string;
  url?: string;
  artwork?: string;
  genre?: string[];
  playlist?: string[];
  familyFriendly?: boolean;
};

function normalize(raw: DemoSong) {
  return {
    title: raw.title.trim(),
    artist: (raw.artist ?? 'Unknown Artist').trim(),
    url: raw.url?.trim(),
    artwork: raw.artwork?.trim(),
    genre: raw.genre ?? [],
    playlist: raw.playlist ?? [],
    familyFriendly: raw.familyFriendly ?? true,
  };
}

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is required');
    process.exit(1);
  }

  const raw = fs.readFileSync(fixturesPath, 'utf8');
  const songs = JSON.parse(raw) as DemoSong[];

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  let upserted = 0;
  for (const entry of songs) {
    const doc = normalize(entry);
    await Song.findOneAndUpdate(
      { artist: doc.artist, title: doc.title },
      doc,
      { upsert: true, new: true },
    );
    upserted += 1;
  }

  console.log(`Seeded ${upserted} demo songs from fixtures`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
