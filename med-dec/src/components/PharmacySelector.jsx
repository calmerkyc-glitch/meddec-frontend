import React, { useState, useEffect } from 'react';
import './PharmacySelector.css';

const PharmacySelector = ({ onPharmacySelect, onLocationUpdate }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [locationPermission, setLocationPermission] = useState('unknown');

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setLocationPermission('granted');

        // Update location on backend
        updateLocationOnBackend(latitude, longitude);

        // Fetch nearby pharmacies
        fetchNearbyPharmacies(latitude, longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        setLoading(false);

        // Fallback: allow manual location entry
        alert('Location access denied. Please enter your location manually.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const updateLocationOnBackend = async (latitude, longitude) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/patient/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude,
          longitude,
          address: 'Current Location', // Could be enhanced with reverse geocoding
        }),
      });

      if (!response.ok) {
        console.error('Failed to update location on backend');
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const fetchNearbyPharmacies = async (latitude, longitude, radius = 10) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/patient/pharmacies/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPharmacies(data);
      } else {
        console.error('Failed to fetch pharmacies');
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePharmacySelect = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    onPharmacySelect(pharmacy);
  };

  const handleManualLocation = () => {
    // For now, use a default location or prompt for manual entry
    const defaultLat = 40.7128; // New York City coordinates as example
    const defaultLng = -74.0060;

    setUserLocation({ latitude: defaultLat, longitude: defaultLng });
    setLocationPermission('manual');
    fetchNearbyPharmacies(defaultLat, defaultLng);
  };

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const isPharmacyOpen = (operatingHours) => {
    if (!operatingHours) return false;
    const today = getCurrentDay();
    const todayHours = operatingHours[today];
    return todayHours && todayHours.isOpen;
  };

  return (
    <div className="pharmacy-selector">
      <div className="location-section">
        <h3>Select Pharmacy Location</h3>

        {locationPermission === 'unknown' && (
          <div className="location-prompt">
            <p>We need your location to show nearby pharmacies.</p>
            <button onClick={getUserLocation} className="btn-primary">
              Allow Location Access
            </button>
          </div>
        )}

        {locationPermission === 'denied' && (
          <div className="location-prompt">
            <p>Location access was denied. You can enter your location manually or use default location.</p>
            <button onClick={handleManualLocation} className="btn-secondary">
              Use Default Location
            </button>
          </div>
        )}

        {userLocation && (
          <div className="location-info">
            <p>📍 Location detected: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</p>
            <button onClick={getUserLocation} className="btn-link">
              Update Location
            </button>
          </div>
        )}
      </div>

      <div className="pharmacies-section">
        <h3>Nearby Pharmacies</h3>

        {loading && <div className="loading">Finding nearby pharmacies...</div>}

        {!loading && pharmacies.length === 0 && userLocation && (
          <div className="no-pharmacies">
            <p>No pharmacies found within 10km. Try increasing the search radius.</p>
          </div>
        )}

        <div className="pharmacies-list">
          {pharmacies.map((pharmacy) => (
            <div
              key={pharmacy.id}
              className={`pharmacy-card ${selectedPharmacy?.id === pharmacy.id ? 'selected' : ''}`}
              onClick={() => handlePharmacySelect(pharmacy)}
            >
              <div className="pharmacy-header">
                <h4>{pharmacy.name}</h4>
                <span className={`status ${isPharmacyOpen(pharmacy.operatingHours) ? 'open' : 'closed'}`}>
                  {isPharmacyOpen(pharmacy.operatingHours) ? 'Open' : 'Closed'}
                </span>
              </div>

              <div className="pharmacy-details">
                <p className="address">📍 {pharmacy.address}</p>
                <p className="distance">📏 {pharmacy.distance} km away</p>
                {pharmacy.phone && <p className="phone">📞 {pharmacy.phone}</p>}

                {pharmacy.services && pharmacy.services.length > 0 && (
                  <div className="services">
                    {pharmacy.services.map((service, index) => (
                      <span key={index} className="service-tag">{service}</span>
                    ))}
                  </div>
                )}
              </div>

              {selectedPharmacy?.id === pharmacy.id && (
                <div className="selected-indicator">✓ Selected</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedPharmacy && (
        <div className="selected-pharmacy-summary">
          <h4>Selected Pharmacy</h4>
          <div className="summary-card">
            <h5>{selectedPharmacy.name}</h5>
            <p>{selectedPharmacy.address}</p>
            <p>{selectedPharmacy.distance} km away</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacySelector;