// backend/controllers/projectController.js
import Project from "../models/Project.js";

// ✅ Get all projects (Team Leader only)
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("assignedTo", "fullname email role")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error("❌ Error fetching projects:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get project by ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("assignedTo", "fullname email role");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    console.error("❌ Error fetching project by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Create project (Team Leader only)
export const createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error("❌ Error creating project:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update project (Team Leader only)
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    console.error("❌ Error updating project:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete project (Team Leader only)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting project:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get projects assigned to the logged-in employee
export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ assignedTo: req.user.id })
      .populate("assignedTo", "fullname email role")
      .sort({ createdAt: -1 });
    res.json({ projects });
  } catch (err) {
    console.error("❌ Error fetching my projects:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Existing CRUD functions remain the same...

// ✅ Share update (message/file) for a project
export const shareProjectUpdate = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { message } = req.body;
    const file = req.file ? req.file.filename : null;

    if (!message && !file)
      return res.status(400).json({ message: "Message or file required" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.updates.push({
      sender: req.user.id,
      message,
      file,
    });

    await project.save();
    res.status(201).json({ message: "Update shared successfully", updates: project.updates });
  } catch (err) {
    console.error("❌ Error sharing project update:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get updates for a project
export const getProjectUpdates = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("updates.sender", "fullname email role");
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json({ updates: project.updates });
  } catch (err) {
    console.error("❌ Error fetching updates:", err);
    res.status(500).json({ message: "Server error" });
  }
};
