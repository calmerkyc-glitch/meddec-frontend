import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { backendFetch } from "../utils/api";

export default function DashboardConsultations() {
  const { token } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    const loadConsultations = async () => {
      try {
        const response = await backendFetch('/api/dashboard/consultations', { token });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Unable to load consultations');
        }
        const data = await response.json();
        setConsultations(data.consultations || []);
      } catch (err) {
        setError(err.message || 'Failed to load consultations');
      } finally {
        setLoading(false);
      }
    };

    loadConsultations();
  }, [token]);

  const handleJoinConsultation = async (time) => {
    if (!time) return;
    setMessage('');
    setJoining(time);

    try {
      const response = await backendFetch('/api/dashboard/consultations/join', {
        token,
        method: 'POST',
        body: JSON.stringify({ time }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to join consultation');
      setConsultations(data.consultations || consultations);
      setMessage('Consultation joined successfully.');
    } catch (err) {
      setMessage(err.message || 'Failed to join consultation');
    } finally {
      setJoining(null);
    }
  };

  if (loading) {
    return <div className="dashboard-panel">Loading consultations...</div>;
  }

  if (error) {
    return <div className="dashboard-panel">{error}</div>;
  }

  return (
    <div className="dashboard-panel consultations-panel">
      <div className="panel-header">
        <h2>Consultations</h2>
        <span className="tag">Scheduled</span>
      </div>

      <div className="dashboard-grid consultations-grid">
        {message && <p className="small-text">{message}</p>}
        {consultations.map((item) => (
          <div key={item.time} className="dashboard-card">
            <p className="small-text">{item.time}</p>
            <h3>{item.doctor}</h3>
            <p>{item.specialty}</p>
            <span className={`stat-tag ${item.status.toLowerCase()}`}>{item.status}</span>
            <button
              className="primary-btn"
              onClick={() => handleJoinConsultation(item.time)}
              disabled={joining === item.time}
            >
              {joining === item.time ? 'Joining...' : 'Join Consultation'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
