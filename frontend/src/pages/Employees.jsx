import React, { useEffect, useState } from "react";
import API from "../api";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    role: "employee",
    status: "Active",
    password: "", // added password field
  });

  const token = localStorage.getItem("token");

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await API.get("/employees", { headers: { Authorization: `Bearer ${token}` } });
      setEmployees(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle form changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Add or Update employee
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };

      // If creating a new employee, ensure password exists
      if (!editEmployee && !payload.password) {
        payload.password = "123456"; // default password
      }

      if (editEmployee) {
        await API.put(`/employees/${editEmployee._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Employee updated!");
      } else {
        await API.post("/employees", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Employee added!");
      }

      setModalOpen(false);
      setEditEmployee(null);
      setFormData({
        fullname: "",
        username: "",
        email: "",
        role: "employee",
        status: "Active",
        password: "",
      });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving employee");
    }
  };

  // Delete employee
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await API.delete(`/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Employee deleted!");
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting employee");
    }
  };

  // Open modal to edit
  const handleEdit = (emp) => {
    setEditEmployee(emp);
    setFormData({
      fullname: emp.fullname,
      username: emp.username,
      email: emp.email,
      role: emp.role,
      status: emp.status,
      password: "", // keep empty when editing
    });
    setModalOpen(true);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-emerald-400 text-lg">
        Loading employees...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400 text-lg">
        {error}
      </div>
    );

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#0f172a] to-[#1e293b] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-emerald-400">
          Employees
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-emerald-400 text-black font-semibold px-4 py-2 rounded-xl shadow-md hover:bg-emerald-500 transition-colors"
        >
          Add Employee
        </button>
      </div>

      {/* Table view for desktop */}
      <div className="overflow-x-auto rounded-2xl shadow-lg hidden sm:block">
        <table className="min-w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          <thead>
            <tr className="text-left text-gray-300 text-sm sm:text-base">
              <th className="px-4 sm:px-6 py-3">#</th>
              <th className="px-4 sm:px-6 py-3">Full Name</th>
              <th className="px-4 sm:px-6 py-3">Username</th>
              <th className="px-4 sm:px-6 py-3">Email</th>
              <th className="px-4 sm:px-6 py-3">Role</th>
              <th className="px-4 sm:px-6 py-3">Status</th>
              <th className="px-4 sm:px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, index) => (
              <tr
                key={emp._id}
                className="border-t border-white/20 hover:bg-white/5 transition-colors text-sm sm:text-base"
              >
                <td className="px-4 sm:px-6 py-3 text-gray-200">{index + 1}</td>
                <td className="px-4 sm:px-6 py-3 text-white">{emp.fullname}</td>
                <td className="px-4 sm:px-6 py-3 text-white">{emp.username}</td>
                <td className="px-4 sm:px-6 py-3 text-white">{emp.email}</td>
                <td className="px-4 sm:px-6 py-3 text-emerald-300 font-medium">{emp.role}</td>
                <td className="px-4 sm:px-6 py-3 text-gray-400">{emp.status || "Active"}</td>
                <td className="px-4 sm:px-6 py-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(emp)}
                    className="text-emerald-400 hover:text-emerald-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(emp._id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="sm:hidden mt-4 space-y-4">
        {employees.map((emp, index) => (
          <div
            key={emp._id}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-inner shadow-black/20"
          >
            <p className="text-gray-300 text-sm">#{index + 1}</p>
            <h2 className="text-white font-semibold text-lg">{emp.fullname}</h2>
            <p className="text-gray-300 text-sm">Username: {emp.username}</p>
            <p className="text-gray-300 text-sm">Email: {emp.email}</p>
            <p className="text-emerald-300 font-medium text-sm">Role: {emp.role}</p>
            <p className="text-gray-400 text-sm">Status: {emp.status || "Active"}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleEdit(emp)}
                className="text-emerald-400 hover:text-emerald-500 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(emp._id)}
                className="text-red-400 hover:text-red-500 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for add/edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">
              {editEmployee ? "Edit Employee" : "Add Employee"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Full Name"
                className="p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
              {!editEmployee && (
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              )}
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="employee">Employee</option>
                <option value="teamleader">Team Leader</option>
              </select>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditEmployee(null);
                    setFormData({
                      fullname: "",
                      username: "",
                      email: "",
                      role: "employee",
                      status: "Active",
                      password: "",
                    });
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-400 text-black font-semibold hover:bg-emerald-500 transition-colors"
                >
                  {editEmployee ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
