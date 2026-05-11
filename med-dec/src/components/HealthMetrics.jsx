import React, { useState, useEffect } from 'react';
import './HealthMetrics.css';

const HealthMetrics = () => {
  const [metrics, setMetrics] = useState({
    bloodPressure: { systolic: '', diastolic: '', date: '' },
    weight: { value: '', unit: 'kg', date: '' },
    heartRate: { value: '', date: '' },
    bloodSugar: { value: '', type: 'fasting', date: '' },
  });
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('input');

  const saveMetric = (type, data) => {
    const newEntry = {
      id: Date.now(),
      type,
      ...data,
      timestamp: new Date().toISOString(),
    };
    setHistory(prev => [newEntry, ...prev.slice(0, 49)]); // Keep last 50 entries
  };

  const getHealthStatus = () => {
    const latest = history[0];
    if (!latest) return { status: 'unknown', color: '#6b7280' };

    // Simple health status logic
    if (latest.type === 'bloodPressure') {
      const sys = parseInt(latest.systolic);
      if (sys < 120) return { status: 'normal', color: '#10b981' };
      if (sys < 140) return { status: 'elevated', color: '#f59e0b' };
      return { status: 'high', color: '#ef4444' };
    }

    return { status: 'normal', color: '#10b981' };
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="health-metrics">
      <div className="metrics-header">
        <h2>Health Metrics Tracker</h2>
        <div className={`health-status status-${healthStatus.status}`}>
          <div className="status-dot" style={{ backgroundColor: healthStatus.color }}></div>
          <span>Current Status: {healthStatus.status.charAt(0).toUpperCase() + healthStatus.status.slice(1)}</span>
        </div>
      </div>

      <div className="metrics-tabs">
        <button
          className={activeTab === 'input' ? 'active' : ''}
          onClick={() => setActiveTab('input')}
        >
          Log Metrics
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button
          className={activeTab === 'trends' ? 'active' : ''}
          onClick={() => setActiveTab('trends')}
        >
          Trends
        </button>
      </div>

      {activeTab === 'input' && (
        <div className="metrics-input">
          <div className="metric-card">
            <h3>🩸 Blood Pressure</h3>
            <div className="input-group">
              <input
                type="number"
                placeholder="Systolic"
                value={metrics.bloodPressure.systolic}
                onChange={(e) => setMetrics(prev => ({
                  ...prev,
                  bloodPressure: { ...prev.bloodPressure, systolic: e.target.value }
                }))}
              />
              <span>/</span>
              <input
                type="number"
                placeholder="Diastolic"
                value={metrics.bloodPressure.diastolic}
                onChange={(e) => setMetrics(prev => ({
                  ...prev,
                  bloodPressure: { ...prev.bloodPressure, diastolic: e.target.value }
                }))}
              />
              <span>mmHg</span>
            </div>
            <button onClick={() => saveMetric('bloodPressure', metrics.bloodPressure)}>
              Save Reading
            </button>
          </div>

          <div className="metric-card">
            <h3>⚖️ Weight</h3>
            <div className="input-group">
              <input
                type="number"
                step="0.1"
                placeholder="Weight"
                value={metrics.weight.value}
                onChange={(e) => setMetrics(prev => ({
                  ...prev,
                  weight: { ...prev.weight, value: e.target.value }
                }))}
              />
              <select
                value={metrics.weight.unit}
                onChange={(e) => setMetrics(prev => ({
                  ...prev,
                  weight: { ...prev.weight, unit: e.target.value }
                }))}
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
            <button onClick={() => saveMetric('weight', metrics.weight)}>
              Save Weight
            </button>
          </div>

          <div className="metric-card">
            <h3>❤️ Heart Rate</h3>
            <div className="input-group">
              <input
                type="number"
                placeholder="BPM"
                value={metrics.heartRate.value}
                onChange={(e) => setMetrics(prev => ({
                  ...prev,
                  heartRate: { ...prev.heartRate, value: e.target.value }
                }))}
              />
              <span>BPM</span>
            </div>
            <button onClick={() => saveMetric('heartRate', metrics.heartRate)}>
              Save Heart Rate
            </button>
          </div>

          <div className="metric-card">
            <h3>🩸 Blood Sugar</h3>
            <div className="input-group">
              <input
                type="number"
                step="0.1"
                placeholder="mg/dL"
                value={metrics.bloodSugar.value}
                onChange={(e) => setMetrics(prev => ({
                  ...prev,
                  bloodSugar: { ...prev.bloodSugar, value: e.target.value }
                }))}
              />
              <select
                value={metrics.bloodSugar.type}
                onChange={(e) => setMetrics(prev => ({
                  ...prev,
                  bloodSugar: { ...prev.bloodSugar, type: e.target.value }
                }))}
              >
                <option value="fasting">Fasting</option>
                <option value="postprandial">Post-Meal</option>
                <option value="random">Random</option>
              </select>
            </div>
            <button onClick={() => saveMetric('bloodSugar', metrics.bloodSugar)}>
              Save Reading
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="metrics-history">
          <h3>Recent Readings</h3>
          <div className="history-list">
            {history.length === 0 ? (
              <p className="no-data">No health metrics recorded yet.</p>
            ) : (
              history.map(entry => (
                <div key={entry.id} className="history-item">
                  <div className="history-icon">
                    {entry.type === 'bloodPressure' && '🩸'}
                    {entry.type === 'weight' && '⚖️'}
                    {entry.type === 'heartRate' && '❤️'}
                    {entry.type === 'bloodSugar' && '🩸'}
                  </div>
                  <div className="history-content">
                    <h4>{entry.type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                    <p className="history-value">
                      {entry.type === 'bloodPressure' && `${entry.systolic}/${entry.diastolic} mmHg`}
                      {entry.type === 'weight' && `${entry.value} ${entry.unit}`}
                      {entry.type === 'heartRate' && `${entry.value} BPM`}
                      {entry.type === 'bloodSugar' && `${entry.value} mg/dL (${entry.type})`}
                    </p>
                    <p className="history-date">{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="metrics-trends">
          <h3>Health Trends</h3>
          <div className="trend-charts">
            {/* Placeholder for charts - would integrate with a charting library */}
            <div className="chart-placeholder">
              <p>📊 Trend charts would be displayed here</p>
              <small>Integrate with Chart.js or Recharts for visualizations</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthMetrics;