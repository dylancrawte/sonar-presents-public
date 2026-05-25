import express from "express";
import Song from "./Model";

const router = express.Router();

router.get("/fetch", async (_req, res) => {
  try {
    const songs = await Song.find().lean();
    return res.status(200).json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/by-playlist", async (req, res) => {
  const playlist =
    typeof req.query.playlist === "string" ? req.query.playlist.trim() : "";
  if (!playlist) {
    return res.status(400).json({ message: "Missing playlist query parameter" });
  }
  try {
    const songs = await Song.find({ playlist }).lean();
    return res.status(200).json(songs);
  } catch (error) {
    console.error("Error fetching songs by playlist:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
