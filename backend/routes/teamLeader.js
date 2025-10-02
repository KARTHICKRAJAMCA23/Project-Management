// routes/teamLeader.js
import express from "express";
import TeamLeader from "../models/TeamLeader.js";

const router = express.Router();

// ✅ Get all team leaders
router.get("/", async (req, res) => {
  try {
    const leaders = await TeamLeader.find().populate("team");
    res.json(leaders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Add a new team leader
router.post("/", async (req, res) => {
  try {
    const { name, email, team } = req.body;
    const leader = new TeamLeader({ name, email, team });
    await leader.save();
    res.status(201).json(leader);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
