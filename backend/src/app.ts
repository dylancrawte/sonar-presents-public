import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import clerkWebhookRoute from './api/webhooks/routes';
import likedSongsRoute from './features/liked-songs/routes';
import songsRoute from './features/songs/routes';
import { connectDB } from './lib/db';
import { logger } from './middlewares/logger';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use(logger);

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'sonar-presents-demo-api' });
});

app.use('/api/webhooks', clerkWebhookRoute);
app.use('/api/liked-songs', likedSongsRoute);
app.use('/api/songs', songsRoute);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});
