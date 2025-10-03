// src/pages/EmployeeDashboard.jsx
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
        const res = await API.get("/projects/my-projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      <div className="flex justify-center items-center min-h-screen text-emerald-400 text-lg font-semibold">
        Loading your projects...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-400 text-lg font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#0f172a] to-[#1e293b] min-h-screen text-gray-200">
      <h1 className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-8 text-center">
        Your Projects
      </h1>

      {projects.length === 0 ? (
        <p className="text-gray-400 text-center">No projects assigned yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 shadow-lg hover:scale-105 transition-transform"
            >
              <h3 className="text-xl sm:text-2xl font-semibold text-white truncate">{project.title}</h3>
              <p className="text-gray-300 mt-2 line-clamp-3">{project.description}</p>
              <p className="mt-4 text-sm text-emerald-400">
                Status:{" "}
                <span className="font-medium text-white">
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </p>
              {project.deadline && (
                <p className="mt-1 text-sm text-gray-400">
                  Deadline: {new Date(project.deadline).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
