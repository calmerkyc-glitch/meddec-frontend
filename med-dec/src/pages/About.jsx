import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="page-container">
      <header className="page-header">
        <Link to="/" className="back-link">← Back Home</Link>
        <h1>About Med-Dec</h1>
        <p>Your trusted digital pharmacy partner</p>
      </header>

      <section className="about-content">
        <div className="about-section">
          <h2>Our Mission</h2>
          <p>
            Med-Dec is revolutionizing pharmacy services by combining technology and healthcare expertise 
            to make medications accessible, affordable, and trustworthy for everyone. We believe that healthcare 
            should be convenient without compromising on quality.
          </p>
        </div>

        <div className="about-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>🏥 Quality</h3>
              <p>Only verified, approved medications</p>
            </div>
            <div className="value-card">
              <h3>🔒 Safety</h3>
              <p>Your health data is protected</p>
            </div>
            <div className="value-card">
              <h3>💡 Innovation</h3>
              <p>Technology meets healthcare</p>
            </div>
            <div className="value-card">
              <h3>🤝 Trust</h3>
              <p>Licensed professionals only</p>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>Why Choose Us?</h2>
          <ul className="about-list">
            <li>✓ Fast and reliable delivery nationwide</li>
            <li>✓ Consultation with licensed doctors</li>
            <li>✓ Transparent pricing with no hidden charges</li>
            <li>✓ 24/7 customer support</li>
            <li>✓ Secure and confidential transactions</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
