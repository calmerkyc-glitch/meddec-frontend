import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { backendFetch } from "../utils/api";

export default function DashboardOverview() {
  const { token } = useAuth();
  const { notifications, subscribeToOrder } = useSocket();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [callLoading, setCallLoading] = useState(false);

  const handleRequestRefill = async (medicine) => {
    if (!medicine) return;
    setActionLoading(true);
    setMessage('');
    try {
      console.log('[DashboardOverview] Requesting refill for:', medicine);
      
      const response = await backendFetch('/api/dashboard/refill-request', {
        token,
        method: 'POST',
        body: JSON.stringify({ medicine }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to submit refill');
      
      console.log('[DashboardOverview] Refill request submitted successfully');
      setMessage('Refill request submitted successfully.');
    } catch (err) {
      console.error('[DashboardOverview] Error requesting refill:', err);
      setMessage(err.message || 'Failed to request refill.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestCall = async (target) => {
    setCallLoading(true);
    setMessage('');
    try {
      const orderId = overview?.order?.id || overview?.order?.orderId;
      if (!orderId) {
        throw new Error('No active order available for call request');
      }

      console.log('[DashboardOverview] Requesting call to:', target, 'for order:', orderId);

      const response = await backendFetch(`/api/chat/orders/${orderId}/request-call`, {
        token,
        method: 'POST',
        body: JSON.stringify({ target })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('[DashboardOverview] Call request failed:', data);
        throw new Error(data.error || 'Unable to request call');
      }
      
      console.log('[DashboardOverview] Call request sent successfully');
      setMessage(`Call request sent to ${data.target}. They will call you shortly.`);
    } catch (err) {
      console.error('[DashboardOverview] Error requesting call:', err);
      setMessage(err.message || 'Failed to request call. Please try again.');
    } finally {
      setCallLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    const loadOverview = async () => {
      try {
        const response = await backendFetch('/api/dashboard/overview', { token });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to load dashboard overview');
        }
        const data = await response.json();
        setOverview(data);

        // Subscribe to active orders for real-time updates
        if (data.order?.id) {
          subscribeToOrder(data.order.id);
        }
      } catch (err) {
        setError(err.message || 'Unable to load overview');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [token, subscribeToOrder]);

  // Listen for order-related notifications and refresh overview
  useEffect(() => {
    const orderNotifications = notifications.filter(n =>
      ['order-placed', 'pharmacy-response', 'logistics-assigned', 'delivery-update', 'delivery-completed'].includes(n.type)
    );

    if (orderNotifications.length > 0) {
      // Refresh overview when we receive order notifications
      const refreshOverview = async () => {
        try {
          const response = await backendFetch('/api/dashboard/overview', { token });
          if (response.ok) {
            const data = await response.json();
            setOverview(data);
          }
        } catch (err) {
          console.error('Failed to refresh overview:', err);
        }
      };

      refreshOverview();
    }
  }, [notifications, token]);

  if (loading) {
    return <div className="dashboard-panel">Loading overview...</div>;
  }

  if (error) {
    return <div className="dashboard-panel">{error}</div>;
  }

  const quickStats = overview?.quickStats || [];
  const action = overview?.action || {};
  const consultation = overview?.consultation || {};
  const order = overview?.order || {};
  const activityFeed = overview?.activity || [];
  const records = overview?.records || [];
  const prescriptions = overview?.prescriptions || [];
  const refills = overview?.refills || [];

  return (
    <div className="dashboard-overview">
      <section className="dashboard-stats">
        {quickStats.map((item) => (
          <div key={item.label} className="stat-card">
            <div className="stat-header">
              <span>{item.label}</span>
            </div>
            <h2>{item.value}</h2>
            <p>{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="dashboard-grid overview-cards">
        <div className="dashboard-panel overview-card">
          <div className="panel-header">
            <h2>Active Prescriptions</h2>
            <Link to="/dashboard/prescriptions" className="link-text">View All</Link>
          </div>
          <ul className="overview-list">
            {prescriptions.slice(0, 3).map((item) => (
              <li key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.nextRefill ? `Refill in ${item.nextRefill}` : item.status}</span>
              </li>
            ))}
            {prescriptions.length === 0 && <li>No active prescriptions found.</li>}
          </ul>
        </div>

        <div className="dashboard-panel overview-card">
          <div className="panel-header">
            <h2>Refills Needed</h2>
            <Link to="/dashboard/refills" className="link-text">Review</Link>
          </div>
          <ul className="overview-list">
            {refills.slice(0, 3).map((item) => (
              <li key={item.medicine}>
                <strong>{item.medicine}</strong>
                <span>{item.status} • ETA {item.eta}</span>
              </li>
            ))}
            {refills.length === 0 && <li>No refills are currently pending.</li>}
          </ul>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel action-panel">
          <div className="panel-header">
            <h2>Action Required</h2>
            <span className="tag urgent">{action.status || 'Urgent'}</span>
          </div>
          <div className="action-card">
            <div>
              <strong>{action.medicine || 'Lisinopril 10mg'}</strong>
              <p>{action.description || 'Daily for hypertension'}</p>
              <p className="small-text">{action.note || 'Only 4 days remaining'}</p>
              {message && <p className="small-text">{message}</p>}
            </div>
            <button
              className="primary-btn"
              onClick={() => handleRequestRefill(action.medicine)}
              disabled={actionLoading}
            >
              {actionLoading ? 'Requesting...' : 'Request Refill'}
            </button>
          </div>
        </div>

        <div className="dashboard-panel consultation-panel">
          <div className="panel-header">
            <h2>Next Consultation</h2>
          </div>
          <div className="consultation-card">
            <p className="small-text">{consultation.time || 'Today at 2:30 PM'}</p>
            <h3>{consultation.doctor || 'Dr. Sarah Mitchell'}</h3>
            <span>{consultation.specialty || 'Cardiology Specialist'}</span>
            <button className="secondary-btn">Join Now</button>
          </div>
        </div>
      </section>

      <section className="dashboard-grid two-column">
        <div className="dashboard-panel orders-panel">
          <div className="panel-header">
            <h2>Active Orders</h2>
            <div className="panel-actions">
              {order.id && (
                <>
                  <button
                    className="chat-btn"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('openChat', {
                        detail: { orderId: order.id }
                      }));
                    }}
                    title="Chat with pharmacy/logistics"
                  >
                    <i className="fas fa-comments"></i>
                    Chat
                  </button>
                  <button
                    className="call-btn"
                    onClick={() => handleRequestCall('pharmacy')}
                    disabled={callLoading}
                    title="Request a callback from the pharmacy"
                  >
                    <i className="fas fa-phone"></i>
                    {callLoading ? 'Requesting...' : 'Pharmacy Call'}
                  </button>
                  <button
                    className="call-btn"
                    onClick={() => handleRequestCall('logistics')}
                    disabled={callLoading || !order.logistics?.id}
                    title={order.logistics?.id ? 'Request a callback from the rider' : 'Logistics not assigned yet'}
                  >
                    <i className="fas fa-truck"></i>
                    {callLoading ? 'Requesting...' : 'Rider Call'}
                  </button>
                </>
              )}
              <Link to="/dashboard/refills" className="link-text">Track All</Link>
            </div>
          </div>
          <div className="progress-line">
            {(order.progress || []).map((step, index) => (
              <div
                key={step}
                className={`progress-step ${index + 1 < (order.activeStep || 1) ? 'completed' : ''} ${index + 1 === (order.activeStep || 1) ? 'active' : ''}`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="order-summary">
            <p>{order.id ? `Order ${order.id} • Est. Arrival: ${order.eta}` : 'No active orders at this time.'}</p>
          </div>
        </div>

        <div className="dashboard-panel records-panel">
          <div className="panel-header">
            <h2>Health Records</h2>
            <Link to="/dashboard/records" className="link-text">Review</Link>
          </div>
          <div className="overview-list records-overview-list">
            {records.slice(0, 3).map((record) => (
              <li key={record.title}>
                <strong>{record.title}</strong>
                <span>{record.description || 'Review report details.'}</span>
              </li>
            ))}
            {records.length === 0 && <li>No health records discovered yet.</li>}
          </div>
        </div>
      </section>

      <section className="dashboard-grid activity-panel-grid">
        <div className="dashboard-panel activity-panel">
          <div className="panel-header">
            <h2>Recent Activity</h2>
            <span className="tag">Live</span>
          </div>
          <div className="activity-list">
            {activityFeed.map((item) => (
              <div key={item.title} className="activity-item">
                <strong>{item.title}</strong>
                <p>{item.subtitle}</p>
                <span>{item.time}</span>
              </div>
            ))}
          </div>
          <Link to="/dashboard/records" className="view-full">View Full History</Link>
        </div>
      </section>
    </div>
  );
}
