import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiRepeat,
  FiLayers,
  FiTarget,
  FiUsers,
  FiUser,
  FiSettings,
  FiLogOut,
  FiCreditCard,
  FiX,
} from "react-icons/fi";

import "../../style/sidebar.css";

const menuItems = [
  { title: "Dashboard", path: "/dashboard", icon: FiGrid },
  { title: "Transactions", path: "/transactions", icon: FiRepeat },
  { title: "Categories", path: "/categories", icon: FiLayers },
  { title: "Budgets", path: "/budgets", icon: FiTarget },
  { title: "Parties", path: "/parties", icon: FiUsers },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

const Sidebar = ({ isOpen, onClose, onLogout }: SidebarProps) => {
  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? "show" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`app-sidebar ${isOpen ? "show" : ""}`}>
        <div className="sidebar-brand">
          <div
            className="brand-icon"
            style={{
              width: "42px",
              height: "42px",
              minWidth: "42px",
              minHeight: "42px",
              maxWidth: "42px",
              maxHeight: "42px",
              aspectRatio: "1 / 1",
              borderRadius: "12px",
              flexShrink: 0,
            }}
          >
            <FiCreditCard size={21} />
          </div>
          <h4>
            Expense<span>Hub</span>
          </h4>

          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">MAIN MENU</p>

          <nav className="sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={19} />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <NavLink to="/profile" onClick={onClose} className="sidebar-link">
            <FiUser size={19} />
            <span>Profile</span>
          </NavLink>

          <NavLink to="/settings" onClick={onClose} className="sidebar-link">
            <FiSettings size={19} />
            <span>Settings</span>
          </NavLink>

          <button
            type="button"
            className="sidebar-link logout-link"
            onClick={() => {
              onClose?.();
              onLogout?.();
            }}
          >
            <FiLogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
