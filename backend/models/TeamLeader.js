// models/TeamLeader.js
import mongoose from "mongoose";

const teamLeaderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }], // employees under them
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("TeamLeader", teamLeaderSchema);
