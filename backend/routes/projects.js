import express from "express";
import { authMiddleware, teamLeaderOnly } from "../middleware/auth.js";
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from "../controllers/projectController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/", teamLeaderOnly, createProject);
router.put("/:id", teamLeaderOnly, updateProject);
router.delete("/:id", teamLeaderOnly, deleteProject);

export default router;
