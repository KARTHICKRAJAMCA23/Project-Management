import React, { useEffect, useState } from "react";
import API from "../api";

const API_URL = "https://project-management-1-2rgk.onrender.com";

export default function MyTasks() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [updates, setUpdates] = useState({});
  const [reviews, setReviews] = useState({});
  const [now, setNow] = useState(new Date());

  // Live countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not logged in. Please login again.");
          setLoading(false);
          return;
        }

        const res = await API.get("/projects/my-projects", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const projectsData = res.data?.projects || [];
        setProjects(projectsData);

        // Fetch updates & team leader reviews for each project
        for (let project of projectsData) {
          const [updatesRes, reviewsRes] = await Promise.all([
            API.get(`/projects/${project._id}/updates`, { headers: { Authorization: `Bearer ${token}` } }),
            API.get(`/projects/${project._id}/reviews`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          setUpdates((prev) => ({ ...prev, [project._id]: updatesRes.data.updates }));
          setReviews((prev) => ({ ...prev, [project._id]: reviewsRes.data.reviews }));
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load your tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleMessageChange = (e) => setMessage(e.target.value);

  const handleSubmit = async (projectId) => {
    if (!file && !message) return alert("Please attach a file or write a message");

    const formData = new FormData();
    if (file) formData.append("file", file);
    if (message) formData.append("message", message);

    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await API.post(`/projects/${projectId}/share`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setUpdates((prev) => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), res.data.updates[res.data.updates.length - 1]],
      }));

      setFile(null);
      setMessage("");
      setSelectedProject(null);
      alert("Shared successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to share project. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getCountdownDays = (deadline) => {
    if (!deadline) return "-";
    const endDate = new Date(deadline);
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline).getTime() < now.getTime();
  };

  if (loading) return <p className="text-emerald-400 text-lg font-semibold text-center mt-20">Loading tasks...</p>;
  if (error) return <p className="text-red-400 text-lg font-semibold text-center mt-20">{error}</p>;

  return (
    <div className="flex justify-center w-full p-6 bg-gradient-to-br from-[#0f172a] to-[#1e293b] min-h-screen">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-8 text-center">My Tasks</h1>

        {projects.length === 0 ? (
          <p className="text-gray-400 text-center">No tasks assigned to you yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((task) => {
              const countdown = getCountdownDays(task.deadline);
              const overdue = isOverdue(task.deadline);

              return (
                <div
                  key={task._id}
                  className={`relative p-6 rounded-2xl border border-gray-700 shadow-lg hover:scale-[1.03] transition-transform duration-300 ${
                    overdue ? "bg-red-900/70 backdrop-blur-lg hover:shadow-red-500/50" : "bg-gray-800/40 backdrop-blur-lg hover:shadow-emerald-400/50"
                  }`}
                >
                  <h2 className="text-xl font-semibold text-white truncate">{task.title}</h2>
                  <p className="text-gray-300 mt-2 line-clamp-3">{task.description}</p>

                  <p className="mt-3 text-sm text-gray-400">
                    Status:{" "}
                    <span
                      className={`font-medium ${
                        task.status === "completed"
                          ? "text-green-400"
                          : task.status === "in-progress"
                          ? "text-yellow-400"
                          : "text-white"
                      }`}
                    >
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </p>

                  {task.deadline && (
                    <>
                      <p className="mt-1 text-sm text-gray-400">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                      <p className={`mt-1 text-sm font-semibold ${overdue ? "text-red-400" : "text-emerald-400"}`}>
                        Days Remaining: {countdown >= 0 ? countdown : 0}
                      </p>
                    </>
                  )}

                  {/* Share / Upload */}
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <h3 className="text-sm font-semibold text-emerald-400 mb-2">Share Update / File</h3>
                    <textarea
                      placeholder="Write a message..."
                      value={selectedProject === task._id ? message : ""}
                      onChange={handleMessageChange}
                      onFocus={() => setSelectedProject(task._id)}
                      className="w-full p-2 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 mb-2"
                      rows={3}
                    ></textarea>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-gray-300 mb-2" />
                    <button
                      onClick={() => handleSubmit(task._id)}
                      disabled={uploading}
                      className="w-full py-2 rounded-lg bg-emerald-400 text-black font-semibold hover:bg-emerald-500 transition-colors shadow-md"
                    >
                      {uploading ? "Sharing..." : "Share with Team"}
                    </button>
                  </div>

                  {/* Display Employee Updates */}
                  {updates[task._id]?.length > 0 && (
                    <div className="mt-4 border-t border-gray-700 pt-4">
                      <h3 className="text-sm font-semibold text-emerald-400 mb-2">Updates</h3>
                      <ul className="space-y-2 max-h-40 overflow-y-auto">
                        {updates[task._id].map((update, idx) => (
                          <li key={idx} className="bg-gray-900/50 p-2 rounded-lg text-gray-200 text-sm">
                            <p>
                              <span className="font-semibold text-emerald-400">{update.sender?.fullname || "You"}</span>: {update.message}
                            </p>
                            {update.file && (
                              <a href={`${API_URL}/uploads/${update.file}`} target="_blank" rel="noopener noreferrer" className="text-sm text-yellow-400 hover:underline">
                                {update.file}
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Display Team Leader Reviews */}
                  {reviews[task._id]?.length > 0 && (
                    <div className="mt-4 border-t border-gray-700 pt-4">
                      <h3 className="text-sm font-semibold text-blue-400 mb-2">Team Leader Reviews</h3>
                      <ul className="space-y-2 max-h-40 overflow-y-auto">
                        {reviews[task._id].map((r, idx) => (
                          <li key={idx} className="bg-gray-900/50 p-2 rounded-lg text-gray-200 text-sm">
                            <span className="font-semibold text-blue-400">{r.reviewer?.fullname || "Team Leader"}</span>: {r.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
