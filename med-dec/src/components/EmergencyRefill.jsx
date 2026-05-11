import React, { useState, useEffect } from 'react';
import './EmergencyRefill.css';

const EmergencyRefill = ({ onClose }) => {
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', quantity: 1, urgency: 'high' }
  ]);
  const [symptoms, setSymptoms] = useState('');
  const [doctorContact, setDoctorContact] = useState('');
  const [loading, setLoading] = useState(false);

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', quantity: 1, urgency: 'high' }]);
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const submitEmergencyRefill = async () => {
    setLoading(true);
    // Implementation for emergency refill submission
    setLoading(false);
    onClose();
  };

  return (
    <div className="emergency-modal">
      <div className="emergency-content">
        <div className="emergency-header">
          <h2>🚨 Emergency Refill Request</h2>
          <p>For urgent medication needs outside normal hours</p>
        </div>

        <div className="emergency-form">
          <div className="medicine-list">
            <h3>Medications Needed</h3>
            {medicines.map((med, index) => (
              <div key={index} className="medicine-item">
                <input
                  type="text"
                  placeholder="Medicine name"
                  value={med.name}
                  onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Dosage"
                  value={med.dosage}
                  onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                />
                <select
                  value={med.urgency}
                  onChange={(e) => updateMedicine(index, 'urgency', e.target.value)}
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>
              </div>
            ))}
            <button onClick={addMedicine} className="add-med-btn">+ Add Medicine</button>
          </div>

          <div className="symptoms-section">
            <h3>Current Symptoms</h3>
            <textarea
              placeholder="Describe your symptoms and why this is urgent..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows="4"
            />
          </div>

          <div className="contact-section">
            <h3>Doctor Contact (Optional)</h3>
            <input
              type="text"
              placeholder="Doctor's name and contact"
              value={doctorContact}
              onChange={(e) => setDoctorContact(e.target.value)}
            />
          </div>

          <div className="emergency-notice">
            <div className="notice-icon">⚠️</div>
            <p>Emergency refills are reviewed by pharmacists and may require doctor approval. Response time: 30 minutes during business hours.</p>
          </div>
        </div>

        <div className="emergency-actions">
          <button onClick={onClose} className="cancel-btn">Cancel</button>
          <button onClick={submitEmergencyRefill} disabled={loading} className="submit-btn">
            {loading ? 'Submitting...' : 'Request Emergency Refill'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyRefill;