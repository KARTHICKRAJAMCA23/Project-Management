import express from "express";
import { authMiddleware, teamLeaderOnly } from "../middleware/auth.js";
import { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from "../controllers/employeesController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.post("/", teamLeaderOnly, createEmployee);
router.put("/:id", teamLeaderOnly, updateEmployee);
router.delete("/:id", teamLeaderOnly, deleteEmployee);

export default router;
