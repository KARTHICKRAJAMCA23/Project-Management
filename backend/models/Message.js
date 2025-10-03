import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // null for broadcast
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
