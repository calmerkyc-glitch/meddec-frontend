import { Link } from 'react-router-dom';

export default function Storefront() {
  const medications = [
    { id: 1, name: 'Paracetamol', dosage: '500mg', price: '₦500' },
    { id: 2, name: 'Ibuprofen', dosage: '200mg', price: '₦800' },
    { id: 3, name: 'Amoxicillin', dosage: '250mg', price: '₦1,200' },
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <Link to="/" className="back-link">← Back Home</Link>
        <h1>Med-Dec Storefront</h1>
        <p>Browse and purchase medications with confidence</p>
      </header>

      <section className="storefront-section">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search medications..." 
            className="search-input"
          />
          <button className="search-btn">Search</button>
        </div>

        <div className="medication-grid">
          {medications.map(med => (
            <div key={med.id} className="medication-card">
              <h3>{med.name}</h3>
              <p className="dosage">{med.dosage}</p>
              <p className="price">{med.price}</p>
              <button className="btn primary">Add to Cart</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
