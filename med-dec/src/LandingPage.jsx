import { Link } from "react-router-dom";
import { useState } from "react";
import "./LandingPage.css";
import medlogo from "./assets/medlogo.png";
import heroIllustration from "./assets/hero.png";

function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const testimonials = [
    { name: "Aisha O.", role: "Lagos, NG", quote: "Got my prescription filled and delivered in under 3 hours. Game changer!", avatar: "https://i.pravatar.cc/100?img=47" },
    { name: "Daniel K.", role: "Nairobi, KE", quote: "The pharmacist chat made me feel safe. Clear answers, fast service.", avatar: "https://i.pravatar.cc/100?img=12" },
    { name: "Maya P.", role: "Accra, GH", quote: "Beautiful app. Refills on autopilot — never running out anymore.", avatar: "https://i.pravatar.cc/100?img=32" },
  ];

  const categories = [
    { icon: "💊", label: "Prescription Meds" },
    { icon: "🥗", label: "Wellness & Vitamins" },
    { icon: "🏥", label: "Medical Devices" },
    { icon: "🛏️", label: "Home Care Essentials" },
  ];

  const featuredProducts = [
    { id: 1, name: "Pain Relief Tablets", price: "$27.99", rating: 4.8, reviews: 128, badge: "Best Seller", badgeColor: "gold", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80", alt: "Pain relief tablets" },
    { id: 2, name: "Digital Thermometer", price: "$19.99", rating: 4.9, reviews: 89, badge: null, badgeColor: "", image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=500&q=80", alt: "Digital thermometer" },
    { id: 3, name: "Blood Pressure Monitor", price: "$119.99", rating: 4.7, reviews: 156, badge: "Top Rated", badgeColor: "orange", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=80", alt: "Blood pressure monitor" },
    { id: 4, name: "Immune Boosting Supplements", price: "$35.99", rating: 4.6, reviews: 203, badge: "Fast Delivery", badgeColor: "blue", image: "https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=500&q=80", alt: "Immune boosting supplements" },
    { id: 5, name: "Daily Wellness Pack", price: "$49.99", rating: 4.5, reviews: 77, badge: "New", badgeColor: "green", image: "https://images.unsplash.com/photo-1626716493137-b67fe9501e76?auto=format&fit=crop&w=500&q=80", alt: "Wellness pack" },
    { id: 6, name: "Home Care Essentials Kit", price: "$59.99", rating: 4.4, reviews: 64, badge: null, badgeColor: "", image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=500&q=80", alt: "Home care essentials kit" },
  ];

  const howItWorks = [
    { step: "Search Medicine", description: "Use the search bar to find verified medications, devices, and wellness products." },
    { step: "Upload Prescription", description: "Quickly upload your prescription and get pharmacist review in minutes." },
    { step: "Fast Delivery", description: "Receive orders at your doorstep with trusted logistics partners." },
  ];

  return (
    <div className="landing-container">
      <header className="header-nav">
        <div className="nav-container">
          <div className="logo">
            <img className="logo-icon" src={medlogo} alt="MedDec logo" />
            <span className="logo-text">MedDec</span>
          </div>
          <nav className={`nav-menu ${mobileOpen ? "nav-menu-open" : ""}`}>
            <Link to="/" className="nav-link active">Home</Link>
            <a href="#shop" className="nav-link">Shop Meds</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#for-pharmacies" className="nav-link">For Pharmacies</a>
            <div className="nav-dropdown">
              <button className="nav-dropbtn">Categories ▾</button>
              <div className="dropdown-content">
                <a href="#prescription">💊 Prescription Meds</a>
                <div className="sub-dropdown">
                  <a href="#antibiotics">Antibiotics</a>
                  <a href="#pain-relief">Pain Relief</a>
                  <a href="#chronic-care">Chronic Care</a>
                </div>
                <a href="#wellness">🥗 Wellness & Vitamins</a>
                <div className="sub-dropdown">
                  <a href="#immune-support">Immune Support</a>
                  <a href="#energy-boosters">Energy Boosters</a>
                  <a href="#weight-management">Weight Management</a>
                </div>
                <a href="#devices">🏥 Medical Devices</a>
                <div className="sub-dropdown">
                  <a href="#diagnostic-tools">Diagnostic Tools</a>
                  <a href="#monitoring-equipment">Monitoring Equipment</a>
                  <a href="#mobility-aids">Mobility Aids</a>
                </div>
                <a href="#homecare">🛏️ Home Care Essentials</a>
                <div className="sub-dropdown">
                  <a href="#first-aid">First Aid</a>
                  <a href="#sanitation">Sanitation & Hygiene</a>
                  <a href="#elderly-care">Elderly Care</a>
                </div>
              </div>
            </div>
          </nav>
          <div className="header-actions">
            <div className="account-menu">
              <button className="account-button">Account ▾</button>
              <div className="account-dropdown">
                <Link to="/signin" className="account-dropdown-link">Sign In</Link>
                <Link to="/signup" className="account-dropdown-link">Sign Up</Link>
              </div>
            </div>
            <a href="#track-order" className="btn-track-order">Track Order</a>
            <button className="btn-cart">🛒 Cart <span className="cart-count">0</span></button>
            <button
              className="mobile-toggle"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-copy">
            <p className="eyebrow">Digital Pharmacy Marketplace</p>
            <h1 className="hero-title">Your Pharmacy, Delivered to Your Doorstep.</h1>
            <p className="hero-subtitle">Shop verified medicines, upload prescriptions, and receive secure delivery from trusted pharmacy partners across Africa.</p>

            <div className="search-upload-group">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search for medications, health products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button className="search-button">🔍 Search</button>
              </div>
              <button className="upload-prescription-btn">📤 Upload Prescription</button>
            </div>

            <div className="hero-support-row">
              <div className="hero-support-item"><span>✓ Verified Pharmacies</span></div>
              <div className="hero-support-item"><span>✓ Licensed Doctors</span></div>
              <div className="hero-support-item"><span>✓ Reliable Logistics</span></div>
            </div>

            <div className="hero-stats-row">
              <div><strong>50K+</strong><span>Medications</span></div>
              <div><strong>15+</strong><span>Countries</span></div>
              <div><strong>24/7</strong><span>Support</span></div>
            </div>
          </div>

          <div className="hero-visual">
            <img
              src={heroIllustration}
              alt="Pharmacist presenting medication"
              className="hero-photo"
              width={1024}
              height={1024}
            />
            <div className="hero-badge-card">
              <p>Licensed & Verified Pharmacists</p>
            </div>
          </div>
        </div>
      </section>

      <section className="category-promo-section">
        <div className="category-banner-row">
          <div className="promo-chip">Free Delivery over $50</div>
          <div className="promo-chip promo-chip-yellow">20% OFF First Order</div>
          <div className="promo-chip">Fast Prescription Approval</div>
        </div>

        <div className="categories-section">
          <div className="categories-container">
            {categories.map((category, index) => (
              <Link key={index} to="/storefront" className="category-card animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="category-icon">{category.icon}</div>
                <p className="category-name">{category.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-products-section" id="shop">
        <div className="featured-header">
          <div>
            <p className="eyebrow">Trending now</p>
            <h2>Featured Products</h2>
          </div>
          <a href="#shop" className="view-all-link">View all products →</a>
        </div>

        <div className="products-grid">
          {featuredProducts.map((product, idx) => (
            <div key={product.id} className="product-card animate-fade-up" style={{ animationDelay: `${idx * 0.08}s` }}>
              {product.badge && (
                <div className={`product-badge badge-${product.badgeColor}`}>{product.badge}</div>
              )}
              <img src={product.image} alt={product.alt} className="product-photo" loading="lazy" />
              <h3 className="product-name">{product.name}</h3>
              <div className="product-rating">
                <span className="stars">⭐ {product.rating}</span>
                <span className="reviews">({product.reviews})</span>
              </div>
              <div className="product-price">{product.price}</div>
              <div className="product-actions">
                <button className="btn-add-cart">Add to Cart</button>
                <button className="btn-view-details">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="top-picks-section">
        <div className="top-picks-grid">
          <div className="top-pick-card">
            <h3>Top rated pharmacy products</h3>
            <p>Discover the most trusted items ordered by customers across the region.</p>
          </div>
          <div className="top-pick-card top-pick-image-card">
            <img src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=900&q=80" alt="Healthcare products" loading="lazy" />
          </div>
          <div className="top-pick-card">
            <h3>Prescriptions handled with care</h3>
            <p>Upload once and let our licensed pharmacists verify and fulfill your order.</p>
          </div>
        </div>
      </section>

      <section className="why-choose-section">
        <h2>Why Choose MedDec?</h2>
        <div className="why-choose-grid">
          <div className="why-choose-card"><div className="why-choose-icon">🏥</div><h3>Verified Pharmacy Network</h3><p>Only licensed suppliers with full quality checks.</p></div>
          <div className="why-choose-card"><div className="why-choose-icon">📋</div><h3>Prescription Management</h3><p>Secure upload and fast pharmacist review.</p></div>
          <div className="why-choose-card"><div className="why-choose-icon">⚡</div><h3>Fast, Reliable Delivery</h3><p>Track every order with real-time updates.</p></div>
          <div className="why-choose-card"><div className="why-choose-icon">💬</div><h3>24/7 Customer Care</h3><p>Support teams available to answer all questions.</p></div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="section-heading">
          <p className="eyebrow">Loved by patients</p>
          <h2>Real stories from real customers</h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-person">
                <img src={t.avatar} alt={t.name} loading="lazy" />
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="how-it-works-section" id="how-it-works">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2>Three steps to your medication at home</h2>
        </div>
        <div className="steps-grid">
          {howItWorks.map((item, index) => (
            <div key={index} className="step-card">
              <div className="step-number">{index + 1}</div>
              <h3>{item.step}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="trusted-section" id="for-pharmacies">
        <div className="section-heading">
          <p className="eyebrow">Trusted by healthcare leaders</p>
          <h2>Powered by pharmacy networks and care providers</h2>
        </div>
        <div className="trusted-grid">
          <div className="trusted-card"><img src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=200&q=80" alt="Trusted pharmacy" loading="lazy" /><p>MedChain Pharmacy</p></div>
          <div className="trusted-card"><img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=200&q=80" alt="Healthcare provider" loading="lazy" /><p>WellnessHub Clinics</p></div>
          <div className="trusted-card"><img src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=200&q=80" alt="Medical logistics" loading="lazy" /><p>CareLogistics</p></div>
          <div className="trusted-card"><img src="https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=200&q=80" alt="Health marketplace" loading="lazy" /><p>HealthyMarket</p></div>
        </div>
      </section>

      <section className="newsletter-section" id="support">
        <div className="newsletter-card">
          <div>
            <p className="eyebrow">Stay updated</p>
            <h2>Get health offers and delivery updates</h2>
          </div>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email address" />
            <button>Subscribe</button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Us</a>
          </div>
          <p>&copy; 2026 MedDec. Bringing quality healthcare closer to you.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
