import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { backendFetch } from "../utils/api";

export default function DashboardRecords() {
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recordDetails, setRecordDetails] = useState(null);
  const [loadingRecord, setLoadingRecord] = useState(null);

  useEffect(() => {
    if (!token) return;

    const loadRecords = async () => {
      try {
        const response = await backendFetch('/api/dashboard/records', { token });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Unable to load records');
        }
        const data = await response.json();
        setRecords(data.records || []);
      } catch (err) {
        setError(err.message || 'Failed to load records');
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [token]);

  const handleOpenRecord = async (title) => {
    if (!title) return;
    setLoadingRecord(title);
    setRecordDetails(null);
    setError(null);

    try {
      const response = await backendFetch(`/api/dashboard/records/${encodeURIComponent(title)}`, { token });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to open record');
      setRecordDetails(data.record);
    } catch (err) {
      setError(err.message || 'Failed to open record');
    } finally {
      setLoadingRecord(null);
    }
  };

  if (loading) {
    return <div className="dashboard-panel">Loading records...</div>;
  }

  if (error) {
    return <div className="dashboard-panel">{error}</div>;
  }

  return (
    <div className="dashboard-panel records-panel">
      <div className="panel-header">
        <h2>Health Records</h2>
        <span className="tag">Secure</span>
      </div>

      <div className="dashboard-grid records-grid">
        {error && <p className="small-text">{error}</p>}
        {records.map((item) => (
          <div key={item.title} className="dashboard-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <button
              className="secondary-btn"
              onClick={() => handleOpenRecord(item.title)}
              disabled={loadingRecord === item.title}
            >
              {loadingRecord === item.title ? 'Opening...' : 'Open'}
            </button>
          </div>
        ))}
      </div>
      {recordDetails && (
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2>{recordDetails.title}</h2>
          </div>
          <p>{recordDetails.description}</p>
          <p className="small-text">Record loaded successfully.</p>
        </div>
      )}
    </div>
  );
}
