import React, { useState, useEffect } from 'react';
import PharmacySelector from './PharmacySelector';
import './OrderPlacement.css';

const OrderPlacement = () => {
  const [step, setStep] = useState(1); // 1: Select Pharmacy, 2: Enter Order Details, 3: Confirm
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [orderItems, setOrderItems] = useState([
    { medicine: '', quantity: 1, dosage: '', instructions: '' }
  ]);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [prescription, setPrescription] = useState({
    id: '',
    doctor: '',
    date: '',
  });
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    // Load user's default delivery address if available
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        // Pre-fill delivery address if available
        if (userData.location) {
          setDeliveryAddress({
            street: userData.location.address || '',
            city: userData.location.city || '',
            state: userData.location.state || '',
            zipCode: userData.location.zipCode || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handlePharmacySelect = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
  };

  const handleLocationUpdate = (location) => {
    // Location updated in PharmacySelector component
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { medicine: '', quantity: 1, dosage: '', instructions: '' }]);
  };

  const updateOrderItem = (index, field, value) => {
    const updatedItems = [...orderItems];
    updatedItems[index][field] = value;
    setOrderItems(updatedItems);
  };

  const removeOrderItem = (index) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const validateOrderDetails = () => {
    if (!selectedPharmacy) {
      alert('Please select a pharmacy first.');
      return false;
    }

    if (orderItems.some(item => !item.medicine.trim())) {
      alert('Please fill in all medicine names.');
      return false;
    }

    if (orderItems.some(item => item.quantity < 1)) {
      alert('Quantity must be at least 1.');
      return false;
    }

    if (!deliveryAddress.street.trim() || !deliveryAddress.city.trim()) {
      alert('Please provide a complete delivery address.');
      return false;
    }

    return true;
  };

  const placeOrder = async () => {
    if (!validateOrderDetails()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const orderData = {
        pharmacyId: selectedPharmacy.id,
        items: orderItems,
        deliveryAddress,
        prescription: prescription.id ? prescription : undefined,
        priority,
        notes: notes.trim() || undefined,
      };

      const response = await fetch('/api/patient/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        setOrderId(result.orderId);
        setOrderPlaced(true);
        setStep(4); // Success step
      } else {
        const error = await response.json();
        alert(`Failed to place order: ${error.message}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An error occurred while placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetOrder = () => {
    setStep(1);
    setSelectedPharmacy(null);
    setOrderItems([{ medicine: '', quantity: 1, dosage: '', instructions: '' }]);
    setDeliveryAddress({ street: '', city: '', state: '', zipCode: '' });
    setPrescription({ id: '', doctor: '', date: '' });
    setPriority('normal');
    setNotes('');
    setOrderPlaced(false);
    setOrderId('');
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      <div className={`step ${step >= 1 ? 'active' : ''}`}>
        <span className="step-number">1</span>
        <span className="step-label">Select Pharmacy</span>
      </div>
      <div className={`step ${step >= 2 ? 'active' : ''}`}>
        <span className="step-number">2</span>
        <span className="step-label">Order Details</span>
      </div>
      <div className={`step ${step >= 3 ? 'active' : ''}`}>
        <span className="step-number">3</span>
        <span className="step-label">Confirm</span>
      </div>
    </div>
  );

  if (step === 4 && orderPlaced) {
    return (
      <div className="order-placement">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Order Placed Successfully!</h2>
          <p>Your order has been sent to {selectedPharmacy?.name}.</p>
          <p><strong>Order ID:</strong> {orderId}</p>
          <p>You will receive updates on your order status.</p>
          <button onClick={resetOrder} className="btn-primary">
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-placement">
      <h1>Place New Order</h1>
      {renderStepIndicator()}

      {step === 1 && (
        <div className="step-content">
          <PharmacySelector
            onPharmacySelect={handlePharmacySelect}
            onLocationUpdate={handleLocationUpdate}
          />
          <div className="step-navigation">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedPharmacy}
              className="btn-primary"
            >
              Continue to Order Details
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step-content">
          <div className="order-details-form">
            <h3>Order Details</h3>

            <div className="selected-pharmacy-info">
              <h4>Selected Pharmacy</h4>
              <p><strong>{selectedPharmacy?.name}</strong></p>
              <p>{selectedPharmacy?.address}</p>
              <p>{selectedPharmacy?.distance} km away</p>
            </div>

            <div className="order-items">
              <h4>Medicines</h4>
              {orderItems.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-row">
                    <input
                      type="text"
                      placeholder="Medicine name"
                      value={item.medicine}
                      onChange={(e) => updateOrderItem(index, 'medicine', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      required
                    />
                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOrderItem(index)}
                        className="btn-remove"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="item-row">
                    <input
                      type="text"
                      placeholder="Dosage (e.g., 250mg twice daily)"
                      value={item.dosage}
                      onChange={(e) => updateOrderItem(index, 'dosage', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Special instructions"
                      value={item.instructions}
                      onChange={(e) => updateOrderItem(index, 'instructions', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addOrderItem} className="btn-add-item">
                + Add Another Medicine
              </button>
            </div>

            <div className="delivery-address">
              <h4>Delivery Address</h4>
              <input
                type="text"
                placeholder="Street address"
                value={deliveryAddress.street}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
                required
              />
              <div className="address-row">
                <input
                  type="text"
                  placeholder="City"
                  value={deliveryAddress.city}
                  onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={deliveryAddress.state}
                  onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={deliveryAddress.zipCode}
                  onChange={(e) => setDeliveryAddress({...deliveryAddress, zipCode: e.target.value})}
                />
              </div>
            </div>

            <div className="prescription-info">
              <h4>Prescription Information (Optional)</h4>
              <input
                type="text"
                placeholder="Prescription ID"
                value={prescription.id}
                onChange={(e) => setPrescription({...prescription, id: e.target.value})}
              />
              <div className="prescription-row">
                <input
                  type="text"
                  placeholder="Doctor name"
                  value={prescription.doctor}
                  onChange={(e) => setPrescription({...prescription, doctor: e.target.value})}
                />
                <input
                  type="date"
                  placeholder="Prescription date"
                  value={prescription.date}
                  onChange={(e) => setPrescription({...prescription, date: e.target.value})}
                />
              </div>
            </div>

            <div className="order-options">
              <div className="priority-select">
                <label>Priority:</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="notes">
                <label>Additional Notes:</label>
                <textarea
                  placeholder="Any special instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className="step-navigation">
            <button onClick={() => setStep(1)} className="btn-secondary">
              Back
            </button>
            <button onClick={() => setStep(3)} className="btn-primary">
              Review Order
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="step-content">
          <div className="order-summary">
            <h3>Order Summary</h3>

            <div className="summary-section">
              <h4>Pharmacy</h4>
              <p><strong>{selectedPharmacy?.name}</strong></p>
              <p>{selectedPharmacy?.address}</p>
            </div>

            <div className="summary-section">
              <h4>Medicines</h4>
              {orderItems.map((item, index) => (
                <div key={index} className="summary-item">
                  <p><strong>{item.medicine}</strong> - Quantity: {item.quantity}</p>
                  {item.dosage && <p>Dosage: {item.dosage}</p>}
                  {item.instructions && <p>Instructions: {item.instructions}</p>}
                </div>
              ))}
            </div>

            <div className="summary-section">
              <h4>Delivery Address</h4>
              <p>{deliveryAddress.street}</p>
              <p>{deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zipCode}</p>
            </div>

            {prescription.id && (
              <div className="summary-section">
                <h4>Prescription</h4>
                <p>ID: {prescription.id}</p>
                <p>Doctor: {prescription.doctor}</p>
                <p>Date: {prescription.date}</p>
              </div>
            )}

            <div className="summary-section">
              <h4>Priority</h4>
              <p className={`priority-${priority}`}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</p>
            </div>

            {notes && (
              <div className="summary-section">
                <h4>Notes</h4>
                <p>{notes}</p>
              </div>
            )}
          </div>

          <div className="step-navigation">
            <button onClick={() => setStep(2)} className="btn-secondary">
              Back
            </button>
            <button
              onClick={placeOrder}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPlacement;