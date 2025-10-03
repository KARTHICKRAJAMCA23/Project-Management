import express from "express";
import { authMiddleware, teamLeaderOnly, employeeOnly } from "../middleware/auth.js";
import {
  getEmployees,
  getEmployeeById,
  getMyProfile,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeesController.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Employee-only route: get logged-in employee profile
router.get("/me", employeeOnly, getMyProfile);

// Team Leader can get all employees
router.get("/", teamLeaderOnly, getEmployees);

// Get employee by ID (Team Leader only)
router.get("/:id", teamLeaderOnly, getEmployeeById);

// Create, update, delete employee (Team Leader only)
router.post("/", teamLeaderOnly, createEmployee);
router.put("/:id", teamLeaderOnly, updateEmployee);
router.delete("/:id", teamLeaderOnly, deleteEmployee);

export default router;
