import React, { useEffect, useState } from "react";
import API from "../api";

export default function Home() {
  const [totalProjects, setTotalProjects] = useState(0);
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const name = localStorage.getItem("name");
  const token = localStorage.getItem("token");

  // Optional: Fetch real counts from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!token) return;

        const projectsRes = await API.get("/projects", { headers: { Authorization: `Bearer ${token}` } });
        setTotalProjects(projectsRes.data.projects?.length || 0);

        const employeesRes = await API.get("/employees", { headers: { Authorization: `Bearer ${token}` } });
        setActiveEmployees(employeesRes.data?.length || 0);

        // Example: pending tasks
        const tasksRes = await API.get("/tasks", { headers: { Authorization: `Bearer ${token}` } });
        setPendingTasks(tasksRes.data?.filter(task => task.status === "pending")?.length || 0);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchDashboardData();
  }, [token]);

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#0f172a] to-[#1e293b] min-h-screen text-gray-200">
      {/* Welcome message */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400 mb-6 sm:mb-8 text-center">
        Welcome, {name || "User"}!
      </h1>

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full max-w-6xl">
        {/* Total Projects */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 sm:p-8 shadow-xl text-center transition-transform hover:scale-105">
          <h3 className="text-lg sm:text-xl font-semibold text-emerald-300 mb-2 sm:mb-4">Total Projects</h3>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{totalProjects}</p>
        </div>

        {/* Active Employees */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 sm:p-8 shadow-xl text-center transition-transform hover:scale-105">
          <h3 className="text-lg sm:text-xl font-semibold text-emerald-300 mb-2 sm:mb-4">Active Employees</h3>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{activeEmployees}</p>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 sm:p-8 shadow-xl text-center transition-transform hover:scale-105">
          <h3 className="text-lg sm:text-xl font-semibold text-emerald-300 mb-2 sm:mb-4">Pending Tasks</h3>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{pendingTasks}</p>
        </div>
      </div>
    </div>
  );
}
