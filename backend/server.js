import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";


import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import employeesRoutes from "./routes/employees.js";
import teamLeaderRoutes from "./routes/teamLeader.js";
import messageRoutes from "./routes/messages.js";

dotenv.config();

const app = express();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------- Middleware --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------- Routes --------------------
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/team-leaders", teamLeaderRoutes);
app.use("/api/messages", messageRoutes);

// Health check / root route
app.get("/", (req, res) => res.json({ message: "✅ Backend API is running" }));

// -------------------- Global Error Handler --------------------
app.use((err, req, res, next) => {
  console.error("🔥 Global Error Handler:", err.stack || err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// -------------------- MongoDB Connection --------------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

connectDB();

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
