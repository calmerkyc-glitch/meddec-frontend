import { Link } from 'react-router-dom';

export default function Fulfillment() {
  const orders = [
    { id: 1, status: 'Processing', date: 'May 2, 2026', items: 'Paracetamol x2' },
    { id: 2, status: 'In Transit', date: 'May 1, 2026', items: 'Ibuprofen x1' },
    { id: 3, status: 'Delivered', date: 'Apr 30, 2026', items: 'Vitamins x3' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Processing': return '#ffc107';
      case 'In Transit': return '#0d6efd';
      case 'Delivered': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <Link to="/" className="back-link">← Back Home</Link>
        <h1>Order Fulfillment</h1>
        <p>Track your medication deliveries in real-time</p>
      </header>

      <section className="fulfillment-section">
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>Order #{order.id}</h3>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </span>
              </div>
              <p className="order-date">{order.date}</p>
              <p className="order-items">{order.items}</p>
              <button className="btn secondary">View Details</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
