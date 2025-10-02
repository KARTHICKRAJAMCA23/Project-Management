import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TeamLeaderDashboard from "./pages/TeamLeaderDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Employees from "./pages/Employees";
import Projects from "./pages/Projects";
import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";

function App() {
  const token = localStorage.getItem("token");

  const ProtectedLayout = ({ children }) => {
    if (!token) return <Navigate to="/login" />;
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
          {children}
        </main>
      </div>
    );
  };

  const RoleProtectedRoute = ({ allowedRoles, children }) => {
    const role = localStorage.getItem("role");
    if (!allowedRoles.includes(role)) return <Navigate to="/" />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Home />
            </ProtectedLayout>
          }
        />

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
          path="/employees"
          element={
            <ProtectedLayout>
              <RoleProtectedRoute allowedRoles={["teamleader"]}>
                <Employees />
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
