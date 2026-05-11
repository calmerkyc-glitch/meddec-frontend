import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { backendFetch } from "../utils/api";

export default function DashboardRefills() {
  const { token } = useAuth();
  const [refills, setRefills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);
  const [requesting, setRequesting] = useState(null);

  useEffect(() => {
    if (!token) return;

    const loadRefills = async () => {
      try {
        const response = await backendFetch('/api/dashboard/refills', { token });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Unable to load refill requests');
        }
        const data = await response.json();
        setRefills(data.refills || []);
      } catch (err) {
        setError(err.message || 'Failed to load refills');
      } finally {
        setLoading(false);
      }
    };

    loadRefills();
  }, [token]);

  const handleViewDetails = async (medicine) => {
    if (!medicine) return;
    setRequesting(medicine);
    setDetails(null);
    setError(null);

    try {
      const response = await backendFetch(`/api/dashboard/refills/${encodeURIComponent(medicine)}`, { token });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load refill detail');
      setDetails(data.refill);
    } catch (err) {
      setError(err.message || 'Failed to load refill details');
    } finally {
      setRequesting(null);
    }
  };

  if (loading) {
    return <div className="dashboard-panel">Loading refill requests...</div>;
  }

  if (error) {
    return <div className="dashboard-panel">{error}</div>;
  }

  return (
    <div className="dashboard-panel refills-panel">
      <div className="panel-header">
        <h2>Refill Requests</h2>
        <span className="tag">Pending</span>
      </div>

      <div className="dashboard-grid refills-grid">
        {error && <p className="small-text">{error}</p>}
        {refills.map((item) => (
          <div key={item.medicine} className="dashboard-card">
            <h3>{item.medicine}</h3>
            <p>Status: <strong>{item.status}</strong></p>
            <p>ETA: <strong>{item.eta}</strong></p>
            <button
              className="secondary-btn"
              onClick={() => handleViewDetails(item.medicine)}
              disabled={requesting === item.medicine}
            >
              {requesting === item.medicine ? 'Loading...' : 'View Details'}
            </button>
          </div>
        ))}
      </div>
      {details && (
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2>Refill Detail</h2>
          </div>
          <p><strong>Medicine:</strong> {details.medicine}</p>
          <p><strong>Status:</strong> {details.status}</p>
          <p><strong>ETA:</strong> {details.eta}</p>
        </div>
      )}
    </div>
  );
}
