import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });

      // Save token and user info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("email", res.data.email);

      // Navigate based on role
      if (res.data.role === "teamleader") navigate("/teamleader-dashboard");
      else if (res.data.role === "employee") navigate("/employee-dashboard");
      else navigate("/login");

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] px-4 sm:px-6 lg:px-8">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl p-8 sm:p-10 w-full max-w-md">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-8 text-center tracking-wide">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="text-gray-300 mb-2 font-medium text-sm sm:text-base">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="p-3 sm:p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-300 mb-2 font-medium text-sm sm:text-base">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="p-3 sm:p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 py-3 sm:py-4 rounded-xl bg-emerald-400 text-black font-semibold hover:bg-emerald-500 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-gray-300 mt-6 text-center text-sm sm:text-base">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-emerald-400 hover:text-emerald-500 font-semibold transition-colors"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
