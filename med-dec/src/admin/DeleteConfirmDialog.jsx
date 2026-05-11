export default function DeleteConfirmDialog({
  user,
  onConfirm,
  onCancel,
  isLoading,
  message,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-dialog">
        <div className="modal-header">
          <h2>⚠️ Delete User</h2>
          <button className="modal-close" onClick={onCancel} disabled={isLoading}>
            ✕
          </button>
        </div>

        {message && (
          <div className={`modal-message ${message.includes("success") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <div className="dialog-content">
          <p>
            Are you sure you want to <strong>permanently delete</strong> this user?
          </p>
          <div className="user-info">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
          <p className="warning-text">
            ⚠️ This action cannot be undone. All associated data will be removed.
          </p>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
}
