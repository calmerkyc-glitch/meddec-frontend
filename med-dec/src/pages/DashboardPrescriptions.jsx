import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { backendFetch } from "../utils/api";

export default function DashboardPrescriptions() {
  const { token, user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requesting, setRequesting] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    const loadPrescriptions = async () => {
      try {
        const response = await backendFetch('/api/dashboard/prescriptions', { token });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Unable to load prescriptions');
        }
        const data = await response.json();
        setPrescriptions(data.prescriptions || []);
      } catch (err) {
        setError(err.message || 'Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };

    loadPrescriptions();
  }, [token]);

  const handleRequestRefill = async (medicine) => {
    if (!medicine) return;
    setRequesting(medicine);
    setMessage('');

    try {
      const response = await backendFetch('/api/dashboard/refill-request', {
        token,
        method: 'POST',
        body: JSON.stringify({ medicine }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to request refill');
      setPrescriptions((current) =>
        current.map((item) =>
          item.name === medicine ? { ...item, status: 'Processing' } : item
        )
      );
      setMessage(`Refill requested for ${medicine}.`);
    } catch (err) {
      setMessage(err.message || 'Failed to request refill');
    } finally {
      setRequesting(null);
    }
  };

  if (loading) {
    return <div className="dashboard-panel">Loading prescriptions...</div>;
  }

  if (error) {
    return <div className="dashboard-panel">{error}</div>;
  }

  return (
    <div className="dashboard-panel prescriptions-panel">
      <div className="panel-header">
        <h2>Prescriptions</h2>
        <span className="tag">{user?.patientId || 'Patient ID'}</span>
      </div>

      <div className="dashboard-grid prescriptions-grid">
        {message && <p className="small-text">{message}</p>}
        {prescriptions.map((item) => (
          <div key={item.name} className="dashboard-card">
            <div className="prescription-header">
              <h3>{item.name}</h3>
              <span className={`stat-tag ${item.status.toLowerCase()}`}>{item.status}</span>
            </div>
            <p>Next refill: <strong>{item.nextRefill}</strong></p>
            <p>Prescribed by: {item.doctor}</p>
            <button
              className="primary-btn"
              onClick={() => handleRequestRefill(item.name)}
              disabled={requesting === item.name}
            >
              {requesting === item.name ? 'Requesting...' : 'Request Refill'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
