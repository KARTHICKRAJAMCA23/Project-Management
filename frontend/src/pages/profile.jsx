// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import API from "../api";

export default function Profile() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not logged in. Please login first.");
          setLoading(false);
          return;
        }

        // Fetch logged-in employee profile
        const res = await API.get("/employees/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If backend provides assigned projects, populate it
        const projectsRes = await API.get("/projects/my-projects", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEmployee({
          ...res.data,
          projects: projectsRes.data.projects || [],
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
        <p className="text-emerald-400 text-lg font-semibold">Loading profile...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
        <p className="text-red-400 text-lg font-semibold">{error}</p>
      </div>
    );

  if (!employee) return null;

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      <div className="w-full max-w-md p-6 sm:p-8 md:p-12 bg-gray-900/30 backdrop-blur-lg border border-gray-700/20 rounded-2xl shadow-lg text-white">
        <h1 className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-8 text-center">My Profile</h1>

        <div className="space-y-5">
          {/* Employee Details Card */}
          <div className="p-5 rounded-2xl bg-gray-900/50 backdrop-blur-md border border-gray-700/20 shadow-md">
            <p className="mb-2">
              <span className="font-semibold text-emerald-400">Employee ID:</span> {employee._id}
            </p>
            <p className="mb-2">
              <span className="font-semibold text-emerald-400">Full Name:</span> {employee.fullname}
            </p>
            <p className="mb-2">
              <span className="font-semibold text-emerald-400">Email:</span> {employee.email}
            </p>
            <p className="mb-2">
              <span className="font-semibold text-emerald-400">Role:</span> {employee.role}
            </p>
            <p>
              <span className="font-semibold text-emerald-400">Assigned Projects:</span>{" "}
              {employee.projects?.length || 0}
            </p>
          </div>

         
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>Only you can view this data.</p>
        </div>
      </div>
    </div>
  );
}
