import { useState } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../app/hooks";
import { logoutThunk } from "../../features/auth/authSlice";
import CommonModal from "../common/CommonModal";
import Sidebar from "./sidebar";
import Topbar from "./Topbar";

const MainLayout = () => {
  const dispatch = useAppDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      setMobileOpen((prev) => !prev);
    } else {
      setDesktopCollapsed((prev) => !prev);
    }
  };

  const handleClose = () => {
    setMobileOpen(false);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await dispatch(logoutThunk()).unwrap();
      toast.success("Logged out successfully");
    } catch {
      toast.info("Logged out successfully");
    }
  };

  return (
    <div className={`app-layout ${desktopCollapsed ? "desktop-collapsed" : ""}`}>
      <Sidebar
        isOpen={mobileOpen}
        onClose={handleClose}
        onLogout={() => setShowLogoutModal(true)}
      />

      <div className="app-content">
        <Topbar
          onToggleSidebar={handleToggle}
          onLogout={() => setShowLogoutModal(true)}
        />

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <CommonModal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="Logout Confirmation"
        confirmText="Logout"
        confirmVariant="danger"
      >
        <p className="mb-0 text-secondary">
          Are you sure you want to log out of your account?
        </p>
      </CommonModal>
    </div>
  );
};

export default MainLayout;
