import { Link } from 'react-router-dom';

export default function Consultation() {
  const doctors = [
    { id: 1, name: 'Dr. Amara Okafor', specialty: 'General Medicine', available: true },
    { id: 2, name: 'Dr. Chisom Eze', specialty: 'Pharmacy', available: true },
    { id: 3, name: 'Dr. Tunde Adebayo', specialty: 'Pediatrics', available: false },
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <Link to="/" className="back-link">← Back Home</Link>
        <h1>Doctor Consultation</h1>
        <p>Connect with licensed doctors for professional medical advice</p>
      </header>

      <section className="consultation-section">
        <div className="doctors-grid">
          {doctors.map(doctor => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-avatar">👨‍⚕️</div>
              <h3>{doctor.name}</h3>
              <p className="specialty">{doctor.specialty}</p>
              <p className={`status ${doctor.available ? 'available' : 'unavailable'}`}>
                {doctor.available ? '🟢 Available Now' : '🔴 Unavailable'}
              </p>
              <button 
                className={`btn ${doctor.available ? 'primary' : 'disabled'}`}
                disabled={!doctor.available}
              >
                {doctor.available ? 'Start Consultation' : 'Book Later'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
