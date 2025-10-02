import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

export default function Register() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "employee", // default role
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword)
      return alert("Passwords do not match");
    try {
      await API.post("/auth/register", formData);
      alert("Registered successfully!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl p-10 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-emerald-400 mb-8 text-center tracking-wide">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {["fullname", "email", "username", "password", "confirmPassword"].map(
            (field) => (
              <div className="flex flex-col" key={field}>
                <label className="text-gray-300 mb-2 font-medium">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field.includes("password") ? "password" : "text"}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={
                    field.includes("password") ? "********" : `Enter ${field}`
                  }
                  className="p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                  required
                />
              </div>
            )
          )}

          <div className="flex flex-col">
            <label className="text-gray-300 mb-2 font-medium">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
            >
              <option value="employee">Employee</option>
              <option value="teamleader">Team Leader</option>
            </select>
          </div>

          <button
            type="submit"
            className="mt-4 py-3 rounded-xl bg-emerald-400 text-black font-semibold hover:bg-emerald-500 transition-colors shadow-md"
          >
            Register
          </button>
        </form>

        <p className="text-gray-300 mt-6 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-emerald-400 hover:text-emerald-500 font-semibold transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
