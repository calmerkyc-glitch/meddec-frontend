import { useEffect, useState } from "react";
import { backendFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "./PharmacyDashboard.css";

export default function PharmacyDashboard() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!token) return;
    loadPharmacyData();
  }, [token]);

  const loadPharmacyData = async () => {
    try {
      setLoading(true);
      const [ordersRes, inventoryRes, statsRes] = await Promise.all([
        backendFetch('/api/pharmacy/orders', { token }),
        backendFetch('/api/pharmacy/inventory', { token }),
        backendFetch('/api/pharmacy/stats', { token }),
      ]);

      if (!ordersRes.ok || !inventoryRes.ok || !statsRes.ok) {
        const data = await ordersRes.json();
        throw new Error(data.error || 'Failed to load pharmacy data');
      }

      const ordersData = await ordersRes.json();
      const inventoryData = await inventoryRes.json();
      const statsData = await statsRes.json();
      setOrders(ordersData.orders || []);
      setInventory(inventoryData.inventory || []);
      setStats(statsData.stats || {});
    } catch (err) {
      setError(err.message || 'Unable to load pharmacy dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (orderId, action) => {
    try {
      const response = await backendFetch(`/api/pharmacy/orders/${orderId}/${action}`, {
        token,
        method: 'POST'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} order`);
      }

      // Refresh data after action
      await loadPharmacyData();
      setSelectedOrder(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus;
    const matchesSearch = !searchQuery ||
      order.medicine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patient.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ffc107';
      case 'accepted': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'completed': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  if (loading) return (
    <div className="dashboard-panel">
      <div className="loading-spinner">Loading pharmacy dashboard...</div>
    </div>
  );

  if (error) return (
    <div className="dashboard-panel error-panel">
      <h3>Error</h3>
      <p>{error}</p>
      <button onClick={loadPharmacyData} className="retry-btn">Retry</button>
    </div>
  );

  return (
    <div className="pharmacy-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-icon">💊</div>
          <div className="header-text">
            <h1>Pharmacy Management Panel</h1>
            <p>Manage medication orders, inventory, and fulfill prescriptions</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.pendingOrders || 0}</span>
            <span className="stat-label">Pending Orders</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.lowStockItems || 0}</span>
            <span className="stat-label">Low Stock Items</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.totalInventory || 0}</span>
            <span className="stat-label">Total Inventory</span>
          </div>
        </div>
      </div>

      <div className="dashboard-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search orders by medicine or patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="orders-section">
          <div className="section-header">
            <h2>Medication Orders</h2>
            <span className="order-count">{filteredOrders.length} orders</span>
          </div>

          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <div className="order-title-row">
                      <h3>{order.medicine}</h3>
                      {order.priority === 'Urgent' && <span className="priority-badge urgent">URGENT</span>}
                      {order.priority === 'High' && <span className="priority-badge high">HIGH</span>}
                    </div>
                    <p className="patient-name">Patient: {order.patient}</p>
                    <p className="prescription-id">Rx: {order.prescriptionId}</p>
                  </div>
                  <div
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </div>
                </div>

                <div className="order-details">
                  <div className="detail-item">
                    <span className="label">Quantity:</span>
                    <span className="value">{order.quantity} units</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Dosage:</span>
                    <span className="value">{order.dosage}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Doctor:</span>
                    <span className="value">{order.doctor}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">ETA:</span>
                    <span className="value">{order.eta}</span>
                  </div>
                </div>

                <div className="order-actions">
                  {order.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleOrderAction(order.id, 'accept')}
                        className="action-btn accept-btn"
                      >
                        ✅ Accept
                      </button>
                      <button
                        onClick={() => handleOrderAction(order.id, 'reject')}
                        className="action-btn reject-btn"
                      >
                        ❌ Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="action-btn details-btn"
                  >
                    📋 Details
                  </button>
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No orders found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>

        <div className="inventory-section">
          <div className="section-header">
            <h2>Inventory Status</h2>
            <span className="inventory-count">{inventory.length} items</span>
          </div>

          <div className="inventory-grid">
            {inventory.map((item) => (
              <div key={item.id} className={`inventory-item ${item.available < 10 ? 'low-stock' : ''}`}>
                <div className="item-header">
                  <h4>{item.name}</h4>
                  <span className="item-id">{item.id}</span>
                </div>
                <div className="item-details">
                  <div className="stock-info">
                    <span className="stock-count">{item.available}</span>
                    <span className="stock-label">in stock</span>
                  </div>
                  <div className="location">
                    📍 {item.location}
                  </div>
                  <div className="category">
                    🏷️ {item.category}
                  </div>
                </div>
                {item.available < 10 && (
                  <div className="low-stock-alert">
                    ⚠️ Low Stock Alert
                  </div>
                )}
                {new Date(item.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
                  <div className="expiry-alert">
                    ⏰ Expires: {new Date(item.expiryDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="order-detail-grid">
                <div className="detail-row">
                  <span className="detail-label">Order ID:</span>
                  <span className="detail-value">{selectedOrder.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Medicine:</span>
                  <span className="detail-value">{selectedOrder.medicine}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Patient:</span>
                  <span className="detail-value">{selectedOrder.patient}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Prescription ID:</span>
                  <span className="detail-value">{selectedOrder.prescriptionId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Quantity:</span>
                  <span className="detail-value">{selectedOrder.quantity} units</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Dosage:</span>
                  <span className="detail-value">{selectedOrder.dosage}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Doctor:</span>
                  <span className="detail-value">{selectedOrder.doctor}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Priority:</span>
                  <span className="detail-value">
                    <span className={`priority-badge ${selectedOrder.priority.toLowerCase()}`}>
                      {selectedOrder.priority}
                    </span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value status-badge" style={{ backgroundColor: getStatusColor(selectedOrder.status) }}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">ETA:</span>
                  <span className="detail-value">{selectedOrder.eta}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
