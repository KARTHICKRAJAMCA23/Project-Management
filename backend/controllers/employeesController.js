// controllers/employeesController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Get all employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ message: "Server error while fetching employees" });
  }
};

// Get employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select("-password");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.status(200).json(employee);
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).json({ message: "Server error while fetching employee" });
  }
};

// Create employee (teamleader only)
export const createEmployee = async (req, res) => {
  try {
    console.log("Received body:", req.body);
    const { fullname, username, email, password, role, status } = req.body;

    if (!fullname || !username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: "Email or username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullname,
      username,
      email,
      password: hashedPassword,
      role: role || "employee",
      status: status || "Active",
    });

    await user.save();
    res.status(201).json({ message: "Employee created successfully", user });
  } catch (err) {
    console.error("Error creating employee:", err);
    res.status(500).json({ message: "Server error while creating employee" });
  }
};

// Update employee (teamleader only)
export const updateEmployee = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    // If password is being updated, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");

    if (!updated) return res.status(404).json({ message: "Employee not found" });

    res.status(200).json({ message: "Employee updated successfully", updated });
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({ message: "Server error while updating employee" });
  }
};

// Delete employee (teamleader only)
export const deleteEmployee = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Employee not found" });
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ message: "Server error while deleting employee" });
  }
};
