import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import API from "../api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", status: "Pending" });
  const role = localStorage.getItem("role");

  // Fetch projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch projects.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form changes
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Create / Update project
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProject) {
        await API.put(`/projects/${editProject._id}`, formData);
        setEditProject(null);
      } else {
        await API.post("/projects", formData);
      }
      setFormData({ title: "", description: "", status: "Pending" });
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving project");
    }
  };

  // Edit project
  const handleEdit = (project) => {
    setEditProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      status: project.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete project
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await API.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting project");
    }
  };

  // Toggle status
  const toggleStatus = async (project) => {
    const newStatus = project.status === "Completed" ? "Pending" : "Completed";
    try {
      await API.put(`/projects/${project._id}`, { ...project, status: newStatus });
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-emerald-400 text-lg font-semibold">
        Loading projects...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-400 text-lg font-semibold">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-10">
      {/* Create / Edit Form */}
      {role === "teamleader" && (
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto mb-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col gap-4 relative"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-emerald-400 text-center">
            {editProject ? "Edit Project" : "Create Project"}
          </h2>

          {editProject && (
            <button
              type="button"
              onClick={() => {
                setEditProject(null);
                setFormData({ title: "", description: "", status: "Pending" });
              }}
              className="absolute top-4 right-4 text-red-400 hover:text-red-500"
            >
              <X size={24} />
            </button>
          )}

          <input
            type="text"
            name="title"
            placeholder="Project Title"
            value={formData.title}
            onChange={handleChange}
            className="p-3 sm:p-4 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="p-3 sm:p-4 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all resize-none"
            rows={4}
          ></textarea>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="p-3 sm:p-4 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <button
            type="submit"
            className="w-full py-3 sm:py-4 rounded-xl bg-emerald-400 text-black font-semibold hover:bg-emerald-500 transition-colors shadow-md"
          >
            {editProject ? "Update Project" : "Add Project"}
          </button>
        </form>
      )}

      {/* Project Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {projects.map((project) => (
          <div
            key={project._id}
            className="relative p-6 rounded-2xl bg-gray-800/40 backdrop-blur-lg border border-gray-700 shadow-lg hover:scale-[1.03] hover:shadow-emerald-400/50 transition-transform duration-300"
          >
            {/* Gradient glow */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-200 to-emerald-400 opacity-30 blur-xl animate-gradient-slow"></div>

            <div className="relative z-10 flex flex-col justify-between h-full">
              <h3 className="text-2xl font-bold text-white truncate">{project.title}</h3>
              <p className="text-gray-300 mt-2 line-clamp-3">{project.description}</p>

              <p className="mt-2 text-sm text-gray-300">
                Assigned To:{" "}
                <span className="font-medium text-white">
                  {project.assignedTo ? project.assignedTo.fullname : "Unassigned"}
                </span>
              </p>

              <p className="mt-1 text-sm">
                Status:{" "}
                <span
                  className={`font-medium ${
                    project.status === "Completed"
                      ? "text-green-400"
                      : project.status === "In Progress"
                      ? "text-yellow-400"
                      : "text-white"
                  }`}
                >
                  {project.status}
                </span>
              </p>

              {/* Actions */}
              {role === "teamleader" && (
                <div className="mt-4 flex justify-end gap-3 flex-wrap">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-emerald-400 hover:text-emerald-500 p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-colors"
                    title="Edit Project"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="text-red-400 hover:text-red-500 p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => toggleStatus(project)}
                    className="text-blue-400 hover:text-blue-500 p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-colors"
                    title="Toggle Status"
                  >
                    <Check size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
