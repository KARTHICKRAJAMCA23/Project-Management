import express from "express";
import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js"; 
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Helper: format message for frontend
const formatMessage = (m) => ({
  _id: m._id,
  senderId: m.sender?._id || null,
  senderName: m.sender?.fullname || "Unknown",
  senderRole: m.sender?.role || "Unknown",
  recipient: m.recipient,
  message: m.message,
  createdAt: m.createdAt,
});

// ================================
// Send a message (to specific user or broadcast)
// ================================
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { message, recipientId } = req.body;
    const senderId = req.user.userId || req.user._id;

    if (!message) return res.status(400).json({ error: "Message is required" });

    if (recipientId) {
      if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        return res.status(400).json({ error: "Invalid recipient ID" });
      }
      const recipientExists = await User.findById(recipientId);
      if (!recipientExists) return res.status(404).json({ error: "Recipient not found" });
    }

    const newMessage = await Message.create({
      sender: senderId,
      recipient: recipientId || null,
      message,
    });

    await newMessage.populate("sender", "fullname role");

    res.status(201).json({ message: formatMessage(newMessage) });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ================================
// Get broadcast messages
// ================================
router.get("/broadcast", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ recipient: null })
      .sort({ createdAt: 1 })
      .populate("sender", "fullname role");

    res.status(200).json({ messages: messages.map(formatMessage) });
  } catch (err) {
    console.error("Error fetching broadcast messages:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ================================
// Get messages with specific employee
// ================================
router.get("/employee/:employeeId", authMiddleware, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const userId = req.user.userId || req.user._id;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ error: "Invalid employee ID" });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: employeeId },
        { sender: employeeId, recipient: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "fullname role");

    res.status(200).json({ messages: messages.map(formatMessage) });
  } catch (err) {
    console.error("Error fetching employee messages:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
