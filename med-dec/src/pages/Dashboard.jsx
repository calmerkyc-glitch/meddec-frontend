import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { backendFetch } from "../utils/api";
import { useState } from "react";
import NotificationBell from "../components/NotificationBell";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, logout, token } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = async () => {
    try {
      await backendFetch('/api/auth/logout', { token, method: 'POST' });
    } catch (err) {
      console.warn('Logout endpoint failed:', err);
    } finally {
      logout();
      navigate('/signin', { replace: true });
    }
  };

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">med-dec</span>
          <p>Secure & encrypted</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
          >
            Overview
          </NavLink>
          <NavLink
            to="/dashboard/orders"
            className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
          >
            Place Order
          </NavLink>
          <NavLink
            to="/dashboard/prescriptions"
            className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
          >
            Prescriptions
          </NavLink>
          <NavLink
            to="/dashboard/refills"
            className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
          >
            Refills
          </NavLink>
          <NavLink
            to="/dashboard/consultations"
            className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
          >
            Consultations
          </NavLink>
          <NavLink
            to="/dashboard/records"
            className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
          >
            Health Records
          </NavLink>
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
          >
            Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-action" onClick={() => navigate('/dashboard/refills')}>
            Refill Now
          </button>
          <button className="sidebar-signout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <p className="dashboard-welcome">Welcome back, {user?.name || "Patient"}</p>
            <h1 className="dashboard-title">Patient Dashboard</h1>
            <p className="dashboard-subtitle">
              A single place to manage prescriptions, orders, consultations, and health records.
            </p>
          </div>

          <div className="dashboard-topbar-right">
            <label className="search-input-wrapper">
              <span>🔎</span>
              <input
                className="search-input"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search medications, orders, records..."
              />
            </label>
            <div className="topbar-actions">
              <NotificationBell />
              <span className={`dashboard-pill sync-pill ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '🟢 Live' : '🔴 Offline'}
              </span>
            </div>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
