import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import API from "../api";
import Sidebar from "../components/Sidebar";

export default function TeamLeaderDashboard() {
  const token = localStorage.getItem("token");
  const [collapsed, setCollapsed] = useState(false);

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", assignedTo: "", status: "Pending" });

  // Fetch projects & employees
  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects", { headers: { Authorization: `Bearer ${token}` } });
      setProjects(res.data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get("/employees", { headers: { Authorization: `Bearer ${token}` } });
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // Handle form change
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Create / Update project
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProject) {
        await API.put(`/projects/${editProject._id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
        setEditProject(null);
      } else {
        await API.post("/projects", formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setFormData({ title: "", description: "", assignedTo: "", status: "Pending" });
      setModalOpen(false);
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
      assignedTo: project.assignedTo?._id || "",
      status: project.status,
    });
    setModalOpen(true);
  };

  // Delete project
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await API.delete(`/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting project");
    }
  };

  // Toggle project status
  const toggleStatus = async (project) => {
    const newStatus = project.status === "Completed" ? "Pending" : "Completed";
    try {
      await API.put(`/projects/${project._id}`, { ...project, status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0f172a] text-gray-200">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className={`flex-1 p-4 sm:p-6 md:p-10 transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-64"}`}>
        {/* Create / Edit Project Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md relative">
              <h2 className="text-2xl font-semibold text-emerald-400 mb-4">{editProject ? "Edit Project" : "Create Project"}</h2>
              {editProject && (
                <button
                  type="button"
                  onClick={() => {
                    setEditProject(null);
                    setFormData({ title: "", description: "", assignedTo: "", status: "Pending" });
                    setModalOpen(false);
                  }}
                  className="absolute top-4 right-4 text-red-400 hover:text-red-500"
                >
                  <X size={24} />
                </button>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400" required />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" rows={4} className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"></textarea>
                <select name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="">Select Employee</option>
                  {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.fullname}</option>)}
                </select>
                <select name="status" value={formData.status} onChange={handleChange} className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <button type="submit" className="py-3 rounded-xl bg-emerald-400 text-black font-semibold hover:bg-emerald-500 transition-colors">
                  {editProject ? "Update Project" : "Create Project"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-emerald-400">Projects</h1>
          <button onClick={() => setModalOpen(true)} className="bg-emerald-400 text-black font-semibold px-4 py-2 rounded-xl hover:bg-emerald-500 transition-colors">
            {editProject ? "Edit Project" : "Add Project"}
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project._id} className="relative p-6 rounded-2xl bg-gray-800/40 backdrop-blur-lg border border-gray-700 shadow-lg hover:scale-[1.03] transition-transform duration-300">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-200 to-emerald-400 opacity-30 blur-xl animate-gradient-slow"></div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <h3 className="text-2xl font-bold text-white truncate">{project.title}</h3>
                <p className="text-gray-300 mt-2 line-clamp-3">{project.description}</p>
                <p className="mt-2 text-sm text-gray-300">Assigned To: <span className="font-medium text-white">{project.assignedTo?.fullname || "Unassigned"}</span></p>
                <p className="mt-1 text-sm">Status: <span className={`font-medium ${project.status === "Completed" ? "text-green-400" : project.status === "In Progress" ? "text-yellow-400" : "text-white"}`}>{project.status}</span></p>
                <div className="mt-4 flex justify-end gap-3 flex-wrap">
                  <button onClick={() => handleEdit(project)} className="text-emerald-400 hover:text-emerald-500 p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-colors" title="Edit Project"><Pencil size={18} /></button>
                  <button onClick={() => handleDelete(project._id)} className="text-red-400 hover:text-red-500 p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-colors" title="Delete Project"><Trash2 size={18} /></button>
                  <button onClick={() => toggleStatus(project)} className="text-blue-400 hover:text-blue-500 p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-colors" title="Toggle Status"><Check size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
