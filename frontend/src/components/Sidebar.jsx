import React, { useContext } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Activity,
  LayoutDashboard,
  Pill,
  LogOut,
  FileText,
  Users,
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getLinks = () => {
    if (user?.role === "admin") {
      return [
        {
          name: "Dashboard",
          path: "/admin",
          icon: <LayoutDashboard size={20} />,
        },
        { name: "Users", path: "/admin/users", icon: <Users size={20} /> },
        { name: "Inventory", path: "/pharmacist", icon: <Pill size={20} /> },
        {
          name: "Point of Sale",
          path: "/cashier",
          icon: <Activity size={20} />,
        },
      ];
    }
    if (user?.role === "pharmacist") {
      return [
        { name: "Inventory", path: "/pharmacist", icon: <Pill size={20} /> },
      ];
    }
    if (user?.role === "cashier") {
      return [
        {
          name: "Point of Sale",
          path: "/cashier",
          icon: <Activity size={20} />,
        },
      ];
    }
    return [];
  };

  return (
    <aside className="sidebar glass">
      <div className="sidebar-logo">
        <Activity size={28} color="var(--primary)" />
        <span>Pharma-Assistant</span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {getLinks().map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={`nav-item ${location.pathname === link.path ? "active" : ""}`}
            end
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}
      </nav>

      <button className="btn-logout" onClick={handleLogout}>
        <LogOut size={20} />
        Log Out
      </button>
    </aside>
  );
};

export default Sidebar;
