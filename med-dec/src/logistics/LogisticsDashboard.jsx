import { useEffect, useState } from "react";
import { backendFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "./LogisticsDashboard.css";

export default function LogisticsDashboard() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!token) return;
    loadLogisticsData();
  }, [token]);

  const loadLogisticsData = async () => {
    try {
      setLoading(true);
      const [ordersRes, statusRes, statsRes] = await Promise.all([
        backendFetch('/api/logistics/orders', { token }),
        backendFetch('/api/logistics/status', { token }),
        backendFetch('/api/logistics/stats', { token }),
      ]);

      if (!ordersRes.ok || !statusRes.ok || !statsRes.ok) {
        const data = await ordersRes.json();
        throw new Error(data.error || 'Failed to load logistics data');
      }

      const ordersData = await ordersRes.json();
      const statusData = await statusRes.json();
      const statsData = await statsRes.json();
      setOrders(ordersData.assignedOrders || []);
      setStatus(statusData.deliveryStatus || []);
      setStats(statsData.stats || {});
    } catch (err) {
      setError(err.message || 'Unable to load logistics dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (orderId, action) => {
    try {
      const response = await backendFetch(`/api/logistics/orders/${orderId}/${action}`, {
        token,
        method: 'POST'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} order`);
      }

      // Refresh data after action
      await loadLogisticsData();
      setSelectedOrder(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase().replace(' ', '-') === filterStatus;
    const matchesSearch = !searchQuery ||
      order.medicine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.driver.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'assigned': return '#ffc107';
      case 'picked up': return '#17a2b8';
      case 'in transit': return '#3b82f6';
      case 'delivered': return '#10b981';
      default: return '#6c757d';
    }
  };

  const getDeliveryStatus = (orderId) => {
    return status.find(s => s.orderId === orderId);
  };

  if (loading) return (
    <div className="dashboard-panel">
      <div className="loading-spinner">Loading logistics dashboard...</div>
    </div>
  );

  if (error) return (
    <div className="dashboard-panel error-panel">
      <h3>Error</h3>
      <p>{error}</p>
      <button onClick={loadLogisticsData} className="retry-btn">Retry</button>
    </div>
  );

  return (
    <div className="logistics-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-icon">🚚</div>
          <div className="header-text">
            <h1>Logistics Management Panel</h1>
            <p>Track deliveries, manage pickups, and optimize routes</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.pendingPickups || 0}</span>
            <span className="stat-label">Pending Pickups</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.delivered || 0}</span>
            <span className="stat-label">Completed Today</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.activeDeliveries || 0}</span>
            <span className="stat-label">Active Deliveries</span>
          </div>
        </div>
      </div>

      <div className="dashboard-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search orders by medicine, location, or driver..."
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
            <option value="assigned">Assigned</option>
            <option value="picked-up">Picked Up</option>
            <option value="in-transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="orders-section">
          <div className="section-header">
            <h2>Delivery Assignments</h2>
            <span className="order-count">{filteredOrders.length} orders</span>
          </div>

          <div className="orders-grid">
            {filteredOrders.map((order) => {
              const deliveryInfo = getDeliveryStatus(order.id);
              return (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <div className="order-title-row">
                        <h3>{order.medicine}</h3>
                        {order.priority === 'Urgent' && <span className="priority-badge urgent">URGENT</span>}
                        {order.priority === 'High' && <span className="priority-badge high">HIGH</span>}
                      </div>
                      <p className="pickup-location">📍 {order.pickup}</p>
                      <p className="patient-info">Patient: {order.patient}</p>
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
                      <span className="label">Order ID:</span>
                      <span className="value">{order.id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Driver:</span>
                      <span className="value">{order.driver}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Address:</span>
                      <span className="value">{order.address}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone:</span>
                      <span className="value">{order.phone}</span>
                    </div>
                    {deliveryInfo && (
                      <>
                        <div className="detail-item">
                          <span className="label">Current Location:</span>
                          <span className="value">{deliveryInfo.location}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">ETA:</span>
                          <span className="value eta-value">{deliveryInfo.eta}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="order-actions">
                    {order.status === 'Assigned' && (
                      <button
                        onClick={() => handleOrderAction(order.id, 'pickup')}
                        className="action-btn pickup-btn"
                      >
                        📦 Pickup
                      </button>
                    )}
                    {(order.status === 'Picked Up' || order.status === 'In Transit') && (
                      <button
                        onClick={() => handleOrderAction(order.id, 'deliver')}
                        className="action-btn deliver-btn"
                      >
                        ✅ Deliver
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="action-btn details-btn"
                    >
                      📋 Details
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🚛</div>
                <h3>No orders found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>

        <div className="status-section">
          <div className="section-header">
            <h2>Delivery Status</h2>
            <span className="status-count">{status.length} active</span>
          </div>

          <div className="status-grid">
            {status.map((item) => (
              <div key={item.orderId} className="status-card">
                <div className="status-header">
                  <h4>{item.orderId}</h4>
                  <div className="eta-badge">
                    {item.eta}
                  </div>
                </div>
                <div className="status-details">
                  <div className="location-info">
                    📍 {item.location}
                  </div>
                  <div className="progress-indicator">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: item.eta.includes('min') ? '75%' :
                                 item.eta.includes('arrived') ? '100%' : '25%'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {status.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>No active deliveries</h3>
                <p>All deliveries are completed</p>
              </div>
            )}
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
                  <span className="detail-label">Pickup Location:</span>
                  <span className="detail-value">{selectedOrder.pickup}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Patient:</span>
                  <span className="detail-value">{selectedOrder.patient}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Delivery Address:</span>
                  <span className="detail-value">{selectedOrder.address}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{selectedOrder.phone}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Driver:</span>
                  <span className="detail-value">{selectedOrder.driver}</span>
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
                  <span className="detail-label">Pickup Time:</span>
                  <span className="detail-value">{selectedOrder.estimatedPickupTime}</span>
                </div>
                {getDeliveryStatus(selectedOrder.id) && (
                  <>
                    <div className="detail-row">
                      <span className="detail-label">Current Location:</span>
                      <span className="detail-value">{getDeliveryStatus(selectedOrder.id).location}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">ETA:</span>
                      <span className="detail-value">{getDeliveryStatus(selectedOrder.id).eta}</span>
                    </div>
                  </>
                )}
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
