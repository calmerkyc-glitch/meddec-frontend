import { useAuth } from "../context/AuthContext";

export default function DashboardSettings() {
  const { user } = useAuth();

  return (
    <div className="dashboard-overview">
      <div className="dashboard-panel settings-panel">
        <div className="panel-header">
          <h2>Account Settings</h2>
        </div>
        <div className="settings-grid">
          <div className="dashboard-card">
            <h3>Profile</h3>
            <p>Name: {user?.name || 'Patient'}</p>
            <p>Email: {user?.email || 'Not available'}</p>
          </div>
          <div className="dashboard-card">
            <h3>Preferences</h3>
            <p>Manage notifications, security, and data preferences here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
