import express from "express";
import multer from "multer";
import path from "path";
import Project from "../models/Project.js";
import Employee from "../models/Employee.js";
import { authMiddleware, teamLeaderOnly, employeeOnly } from "../middleware/auth.js";

const router = express.Router();

// -------------------- Multer Setup --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});
const upload = multer({ storage });

// -------------------- Team Leader Routes --------------------

// Get all projects
router.get("/", authMiddleware, teamLeaderOnly, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("assignedTo", "fullname email")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching projects", error: err.message });
  }
});

// Create project
router.post("/", authMiddleware, teamLeaderOnly, async (req, res) => {
  try {
    const { title, description, assignedTo, status, deadline } = req.body;

    const project = new Project({ title, description, assignedTo: assignedTo || null, status, deadline });
    await project.save();

    const populatedProject = await Project.findById(project._id).populate("assignedTo", "fullname email");
    res.status(201).json(populatedProject);
  } catch (err) {
    res.status(400).json({ message: "Error creating project", error: err.message });
  }
});

// Update project
router.put("/:id", authMiddleware, teamLeaderOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assignedTo, status, deadline } = req.body;

    // Only update assignedTo if provided
    const updateData = { title, description, status, deadline };
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;

    const project = await Project.findByIdAndUpdate(id, updateData, { new: true }).populate(
      "assignedTo",
      "fullname email"
    );

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project);
  } catch (err) {
    res.status(400).json({ message: "Error updating project", error: err.message });
  }
});

// Toggle project status
router.patch("/:id/toggle-status", authMiddleware, teamLeaderOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.status = project.status === "completed" ? "pending" : "completed";
    await project.save();

    const populatedProject = await Project.findById(project._id).populate("assignedTo", "fullname email");
    res.json(populatedProject);
  } catch (err) {
    res.status(400).json({ message: "Error toggling status", error: err.message });
  }
});

// Delete project
router.delete("/:id", authMiddleware, teamLeaderOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting project", error: err.message });
  }
});

// -------------------- Employee Routes --------------------

// Get employee's assigned projects
router.get("/my-projects", authMiddleware, employeeOnly, async (req, res) => {
  try {
    const userId = req.user.userId;
    const projects = await Project.find({ assignedTo: userId }).populate("assignedTo", "fullname email").sort({ createdAt: -1 });
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: "Error fetching my projects", error: err.message });
  }
});

// Share update (employee only)
router.post("/:id/share", authMiddleware, employeeOnly, upload.single("file"), async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const update = {
      sender: userId,
      message: message || "",
      file: req.file ? req.file.filename : null,
      status: "pending",
      role: "employee",
    };

    project.updates.unshift(update);
    await project.save();
    await project.populate("updates.sender", "fullname email");

    project.updates.sort((a, b) => b.createdAt - a.createdAt);

    res.json({ updates: project.updates });
  } catch (err) {
    res.status(400).json({ message: "Error sharing update", error: err.message });
  }
});

// Get project updates
router.get("/:id/updates", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("updates.sender", "fullname email");
    if (!project) return res.status(404).json({ message: "Project not found" });

    const updates = project.updates.sort((a, b) => b.createdAt - a.createdAt);
    res.json({ updates });
  } catch (err) {
    res.status(500).json({ message: "Error fetching updates", error: err.message });
  }
});

// Approve / Reject an update (team leader only)
router.put("/:projectId/updates/:updateId", authMiddleware, teamLeaderOnly, async (req, res) => {
  try {
    const { projectId, updateId } = req.params;
    const { status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const update = project.updates.id(updateId);
    if (!update) return res.status(404).json({ message: "Update not found" });

    update.status = status;
    await project.save();
    await project.populate("updates.sender", "fullname email");

    res.json({ updates: project.updates });
  } catch (err) {
    res.status(400).json({ message: "Error updating update status", error: err.message });
  }
});

// Team Leader Reviews
router.post("/:id/review", authMiddleware, teamLeaderOnly, async (req, res) => {
  try {
    const { message } = req.body;
    const reviewer = req.user.userId;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.reviews.unshift({ reviewer, message });
    await project.save();
    await project.populate("reviews.reviewer", "fullname email");

    res.json({ reviews: project.reviews });
  } catch (err) {
    res.status(400).json({ message: "Error adding review", error: err.message });
  }
});

router.get("/:id/reviews", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("reviews.reviewer", "fullname email");
    if (!project) return res.status(404).json({ message: "Project not found" });

    const reviews = project.reviews.sort((a, b) => b.createdAt - a.createdAt);
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: "Error fetching reviews", error: err.message });
  }
});

export default router;
