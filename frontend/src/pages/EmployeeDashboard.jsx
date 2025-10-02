import React, { useEffect, useState } from "react";
import API from "../api";

export default function EmployeeDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ fallback if backend doesn't send properly
        setProjects(res.data?.projects || []);
      } catch (err) {
        console.error("❌ Error fetching projects:", err);
        setError("Failed to load projects. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <p className="text-emerald-400">Loading your projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="text-3xl font-bold text-emerald-400 mb-6">
        Your Projects
      </h1>

      {projects.length === 0 ? (
        <p className="text-gray-400">No projects assigned yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p._id}
              className="glass card p-5 rounded-2xl shadow-lg backdrop-blur-md bg-white/10 border border-white/20"
            >
              <h3 className="text-xl font-semibold text-white">{p.title}</h3>
              <p className="text-gray-300 mt-2">{p.description}</p>
              <p className="mt-3 text-sm text-emerald-400">
                Status:{" "}
                <span className="font-medium text-white">{p.status}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
