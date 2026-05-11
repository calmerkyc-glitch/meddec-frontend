import { useEffect, useState } from "react";
import { backendFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import EditUserModal from "./EditUserModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [form, setForm] = useState({ name: "", email: "", role: "pharmacy" });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Load admin data
  useEffect(() => {
    if (!token) return;

    const loadAdminData = async () => {
      try {
        const [usersRes, reportsRes] = await Promise.all([
          backendFetch('/api/admin/users', { token }),
          backendFetch('/api/admin/reports', { token }),
        ]);

        if (!usersRes.ok || !reportsRes.ok) {
          const data = await usersRes.json();
          throw new Error(data.error || 'Failed to load admin data');
        }

        const usersData = await usersRes.json();
        const reportsData = await reportsRes.json();
        setUsers(usersData.users || []);
        setReports(reportsData.reports || []);
      } catch (err) {
        setError(err.message || 'Unable to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [token]);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleInput = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return '—';
    const date = new Date(dateValue);
    return date.toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  };

  const recentActivity = users
    .flatMap((user) =>
      Array.isArray(user.activityLogs)
        ? user.activityLogs.map((entry) => ({
            ...entry,
            userName: user.name,
            userRole: user.role,
          }))
        : []
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 12);

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setSubmitLoading(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const response = await backendFetch('/api/admin/users', {
        token,
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setUsers((prev) => [data.user, ...prev]);
      setSuccessMessage('Pass key sent successfully. The new user can sign in immediately with their email and the pass key from their email.');
      setForm({ name: "", email: "", role: "pharmacy" });
    } catch (err) {
      setFormError(err.message || 'Unable to create user');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditUser = async (updatedData) => {
    setModalLoading(true);
    try {
      const userId = editingUser?.id || editingUser?._id;
      const response = await backendFetch(`/api/admin/users/${userId}`, {
        token,
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      setUsers((prev) =>
        prev.map((user) => (user._id === userId || user.id === userId ? data.user : user))
      );
      setModalMessage('User updated successfully!');
      setTimeout(() => {
        setEditingUser(null);
        setModalMessage("");
      }, 1500);
    } catch (err) {
      setModalMessage(err.message || 'Unable to update user');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setModalLoading(true);
    try {
      const userId = deletingUser?.id || deletingUser?._id;
      const response = await backendFetch(`/api/admin/users/${userId}`, {
        token,
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setUsers((prev) => prev.filter((user) => user._id !== userId && user.id !== userId));
      if (data.emailNotification && !data.emailNotification.success) {
        setModalMessage(
          `User deleted successfully, but notification email failed: ${data.emailNotification.error}`
        );
      } else {
        setModalMessage('User deleted successfully! Notification email sent.');
      }

      setTimeout(() => {
        setDeletingUser(null);
        setModalMessage("");
      }, 1800);
    } catch (err) {
      setModalMessage(err.message || 'Unable to delete user');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return <div className="dashboard-panel">Loading admin dashboard...</div>;
  if (error) return <div className="dashboard-panel error-message">{error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-panel">
        <div className="panel-header">
          <div className="panel-heading">
            <span className="panel-icon" role="img" aria-label="Admin">🛡️</span>
            <h2>Admin Dashboard</h2>
          </div>
        </div>
        <p className="small-text">Manage staff accounts, control roles, and maintain system operations.</p>
      </div>

      {/* System Metrics */}
      <section className="dashboard-grid metrics-cards">
        {reports.map((report) => (
          <div key={report.id} className="dashboard-panel metric-card">
            <h3>{report.title}</h3>
            <p className="metric-value">{report.value}</p>
          </div>
        ))}
      </section>

      <section className="dashboard-grid activity-panel">
        <div className="dashboard-panel activity-feed-panel">
          <div className="panel-header">
            <div>
              <h3>📈 Recent Staff Activity</h3>
              <p className="small-text">Track what pharmacy and logistics staff are doing in the system.</p>
            </div>
            <span className="activity-count">{recentActivity.length} recent events</span>
          </div>

          {recentActivity.length ? (
            <div className="activity-list">
              {recentActivity.map((entry, index) => (
                <div key={`${entry.orderId || entry.timestamp}-${index}`} className="activity-item">
                  <div className="activity-meta">
                    <span className={`activity-badge activity-${entry.eventType || 'general'}`}>
                      {entry.eventType ? entry.eventType.toUpperCase() : 'LOG'}
                    </span>
                    <strong>{entry.title}</strong>
                  </div>
                  <p className="activity-description">{entry.description}</p>
                  <div className="activity-footer">
                    <span>{entry.userName} · {entry.userRole}</span>
                    <span>{formatDateTime(entry.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent staff activity has been recorded yet.</p>
          )}
        </div>
      </section>

      {/* Create User Section */}
      <section className="dashboard-grid">
        <div className="dashboard-panel create-user-panel">
          <div className="panel-header">
            <h3>➕ Create Staff User</h3>
          </div>
          <form className="auth-form" onSubmit={handleCreateUser}>
            <label className="input-group">
              <span>Full Name</span>
              <input
                name="name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={handleInput}
                required
              />
            </label>
            <label className="input-group">
              <span>Email Address</span>
              <input
                name="email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleInput}
                required
              />
            </label>
            <label className="input-group">
              <span>Assign Role</span>
              <select name="role" value={form.role} onChange={handleInput} required>
                <option value="pharmacy">🏥 Pharmacy</option>
                <option value="logistics">🚚 Logistics</option>
                <option value="admin">🛡️ Admin</option>
              </select>
            </label>
            <button className="primary-btn" type="submit" disabled={submitLoading}>
              {submitLoading ? 'Creating...' : 'Create & Send Pass Key'}
            </button>
          </form>
          {formError && <p className="message error">{formError}</p>}
          {successMessage && <p className="message success">{successMessage}</p>}
        </div>
      </section>

      {/* User Management Table */}
      <div className="dashboard-panel table-panel">
        <div className="panel-header">
          <h3>👥 User Management</h3>
          <p className="user-count">{filteredUsers.length} user(s)</p>
        </div>

        {/* Search and Filters */}
        <div className="table-controls">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="logistics">Logistics</option>
            <option value="patient">Patient</option>
          </select>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Users Table */}
        {filteredUsers.length ? (
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>Session</th>
                  <th>Orders</th>
                  <th>Pickups</th>
                  <th>Deliveries</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id || user.id}>
                    <td>
                      <span className="user-name">{user.name}</span>
                    </td>
                    <td>
                      <span className="user-email">{user.email}</span>
                    </td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${user.status}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span>{formatDateTime(user.lastActiveAt)}</span>
                    </td>
                    <td>
                      <span>{formatDuration(user.totalSessionSeconds)}</span>
                    </td>
                    <td>
                      <span>
                        {user.role === 'pharmacy'
                          ? user.pharmacyMetrics?.ordersHandled || 0
                          : '-'}
                      </span>
                    </td>
                    <td>
                      <span>
                        {user.role === 'logistics'
                          ? user.logisticsMetrics?.pickupsCompleted || 0
                          : '-'}
                      </span>
                    </td>
                    <td>
                      <span>
                        {user.role === 'logistics'
                          ? user.logisticsMetrics?.deliveriesUpdated || 0
                          : '-'}
                      </span>
                    </td>
                    <td>
                      <span className="date">
                        {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => setEditingUser(user)}
                          title="Edit user"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => setDeletingUser(user)}
                          title="Delete user"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">
            {users.length === 0 ? "No users found yet." : "No users match your filters."}
          </p>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={handleEditUser}
          onClose={() => setEditingUser(null)}
          isLoading={modalLoading}
          message={modalMessage}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingUser && (
        <DeleteConfirmDialog
          user={deletingUser}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeletingUser(null)}
          isLoading={modalLoading}
          message={modalMessage}
        />
      )}
    </div>
  );
}
