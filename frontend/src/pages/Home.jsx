import React, { useEffect, useState } from "react";
import API from "../api";

export default function Home() {
  const [totalProjects, setTotalProjects] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  const [pendingProjects, setPendingProjects] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Messaging state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(""); // "" = broadcast
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState({}); // { employeeId: [messages], "all": [...] }

  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  // Fetch dashboard & employees
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (role === "employee") {
          const res = await API.get("/projects/my-projects");
          const projects = res.data?.projects || [];
          const completed = projects.filter(p => p.status?.toLowerCase() === "completed").length;
          const pending = projects.filter(p => p.status?.toLowerCase() !== "completed").length;

          setCompletedProjects(completed);
          setPendingProjects(pending);
        } else if (role === "teamleader") {
          const [projectsRes, employeesRes] = await Promise.all([
            API.get("/projects"),
            API.get("/employees"),
          ]);

          const projects = projectsRes.data || [];
          const completed = projects.filter(p => p.status?.toLowerCase() === "completed").length;
          const pending = projects.filter(p => p.status?.toLowerCase() !== "completed").length;

          setTotalProjects(projects.length);
          setCompletedProjects(completed);
          setPendingProjects(pending);
          setTotalEmployees(employeesRes.data?.length || 0);
          setEmployees(employeesRes.data || []);
        }

        // Fetch initial broadcast messages
        const messagesRes = await API.get("/messages/broadcast");
        setChatHistory(prev => ({ ...prev, all: messagesRes.data.messages }));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [role]);

  // Fetch messages for selected employee
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedEmployee) return; // broadcast already loaded

      try {
        const res = await API.get(`/messages/employee/${selectedEmployee}`);
        setChatHistory(prev => ({ ...prev, [selectedEmployee]: res.data.messages }));
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [selectedEmployee]);

  // Send message handler
  const handleSendMessage = async () => {
    if (!message) return alert("Please type a message");

    try {
      const payload = {
        recipientId: selectedEmployee || null, // null = broadcast
        message,
      };

      const res = await API.post("/messages/send", payload);

      const key = selectedEmployee || "all";

      setChatHistory(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), res.data.message],
      }));

      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message.");
    }
  };

  if (loading)
    return (
      <p className="flex justify-center items-center min-h-screen text-emerald-400 text-lg font-semibold">
        Loading dashboard...
      </p>
    );

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#0f172a] to-[#1e293b] min-h-screen text-gray-200">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400 mb-6 sm:mb-8 text-center">
        Welcome, {name || "User"}!
      </h1>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full max-w-6xl">
        {role === "employee" ? (
          <>
            <Card title="Completed Tasks" value={completedProjects} />
            <Card title="Pending Tasks" value={pendingProjects} />
          </>
        ) : (
          <>
            <Card title="Total Projects" value={totalProjects} />
            <Card title="Completed Projects" value={completedProjects} />
            <Card title="Pending Projects" value={pendingProjects} />
            <Card title="Active Employees" value={totalEmployees} />
          </>
        )}
      </div>

      {/* Floating Messages Button */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 bg-emerald-400 text-black p-4 rounded-full shadow-xl hover:bg-emerald-500 transition-colors z-50"
        title="Messages"
      >
        💬
      </button>

      {/* Messages Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-xl p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-red-400 font-bold text-lg"
            >
              X
            </button>
            <h2 className="text-xl font-semibold text-emerald-400 mb-4">Messages</h2>

            {/* Select Employee / All */}
            <select
              className="w-full p-2 rounded-lg mb-4 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              onChange={(e) => setSelectedEmployee(e.target.value)}
              value={selectedEmployee}
            >
              <option value="">-- Broadcast to All --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.fullname} ({emp.role})
                </option>
              ))}
            </select>

            {/* Chat History */}
            <div className="h-64 overflow-y-auto bg-gray-800 p-2 rounded-lg mb-4">
              {(selectedEmployee || "all") &&
              chatHistory[selectedEmployee || "all"]?.length > 0 ? (
                chatHistory[selectedEmployee || "all"].map((m, idx) => (
                  <div key={idx} className="mb-2">
                    <span className="font-semibold text-emerald-400">
                      {m.senderName || "You"} ({m.senderRole || "Unknown"}):
                    </span>{" "}
                    {m.message}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No messages yet.</p>
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 p-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-emerald-400 text-black font-semibold rounded-lg hover:bg-emerald-500 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Dashboard card component
function Card({ title, value }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 sm:p-8 shadow-xl text-center transition-transform hover:scale-105">
      <h3 className="text-lg sm:text-xl font-semibold text-emerald-300 mb-2 sm:mb-4">{title}</h3>
      <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{value}</p>
    </div>
  );
}
