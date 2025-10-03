import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import TeamLeaderDashboard from "./pages/TeamLeaderDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Employees from "./pages/Employees";
import Projects from "./pages/Projects";
import Home from "./pages/Home";
import Profile from "./pages/Profile"; // 👈 Profile page for employees
import MyTasks from "./pages/MyTasks";
import Sidebar from "./components/Sidebar";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  // Listen for localStorage changes (after login)
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Layout for all protected pages
  const ProtectedLayout = ({ children }) => {
    if (!token) return <Navigate to="/login" replace />;
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
          {children}
        </main>
      </div>
    );
  };

  // Role-protected route
  const RoleProtectedRoute = ({ allowedRoles, children }) => {
    if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login setToken={setToken} setRole={setRole} />} />
        <Route path="/register" element={<Register />} />

        {/* Home */}
        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Home />
            </ProtectedLayout>
          }
        />

        {/* Team Leader Routes */}
        <Route
          path="/teamleader-dashboard"
          element={
            <ProtectedLayout>
              <RoleProtectedRoute allowedRoles={["teamleader"]}>
                <TeamLeaderDashboard />
              </RoleProtectedRoute>
            </ProtectedLayout>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedLayout>
              <RoleProtectedRoute allowedRoles={["teamleader"]}>
                <Projects />
              </RoleProtectedRoute>
            </ProtectedLayout>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedLayout>
              <RoleProtectedRoute allowedRoles={["teamleader"]}>
                <Employees />
              </RoleProtectedRoute>
            </ProtectedLayout>
          }
        />

        {/* Employee Routes */}
        <Route
          path="/employee-dashboard"
          element={
            <ProtectedLayout>
              <RoleProtectedRoute allowedRoles={["employee"]}>
                <EmployeeDashboard />
              </RoleProtectedRoute>
            </ProtectedLayout>
          }
        />

        <Route
          path="/my-tasks"
          element={
            <ProtectedLayout>
              <RoleProtectedRoute allowedRoles={["employee"]}>
                <MyTasks />
              </RoleProtectedRoute>
            </ProtectedLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedLayout>
              <RoleProtectedRoute allowedRoles={["employee"]}>
                <Profile />
              </RoleProtectedRoute>
            </ProtectedLayout>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
