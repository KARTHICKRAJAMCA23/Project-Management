import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  Menu,
  Home,
  LayoutDashboard,
  Users,
  FolderKanban,
  ClipboardList,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Define menu items based on role
  const menuItems = {
    teamleader: [
      { name: "Home", path: "/", icon: <Home size={20} /> },
      { name: "Add Projects", path: "/teamleader-dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "View Projects", path: "/projects", icon: <FolderKanban size={20} /> },
      { name: "Employees List", path: "/employees", icon: <Users size={20} /> },
    ],
    employee: [
      { name: "Home", path: "/", icon: <Home size={20} /> },
      { name: "Dashboard", path: "/employee-dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "My Tasks", path: "/my-tasks", icon: <ClipboardList size={20} /> },
      { name: "Profile", path: "/profile", icon: <User size={20} /> },
    ],
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          bg-[rgba(30,42,56,0.85)] backdrop-blur-md border-r border-gray-700/30 text-gray-200 shadow-xl
          transition-all duration-300
          ${collapsed ? "w-20" : "w-64"} 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
          {!collapsed && !mobileOpen && (
            <h1 className="text-lg font-semibold text-emerald-400 truncate">
              {role === "teamleader" ? "Team Leader" : "Employee"}
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white transition-colors hidden md:block"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-emerald-400/50 scrollbar-track-transparent">
          {menuItems[role]?.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  group relative flex items-center gap-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive ? "bg-emerald-600/30 text-emerald-300 border-l-4 border-emerald-500 animate-pulse" : "text-gray-300 hover:bg-emerald-600/10 hover:text-emerald-300"}
                `}
              >
                <span className="transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
                {!collapsed && <span className="truncate hidden md:inline">{item.name}</span>}
                {mobileOpen && <span className="truncate md:hidden">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-700/30">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={20} className="transition-transform duration-200 group-hover:scale-110" />
            {!collapsed && !mobileOpen && <span>Logout</span>}
            {mobileOpen && <span className="md:hidden">Logout</span>}
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="fixed top-4 left-4 z-50 md:hidden text-emerald-400 bg-gray-800/50 p-2 rounded-lg shadow-lg"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu size={24} />
        </button>
      </aside>
    </>
  );
}
