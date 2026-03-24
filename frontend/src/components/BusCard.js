import React from 'react';
import '../styles/BusCard.css';
import { formatPrice, formatTime, calculateDuration } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

const BusCard = ({ bus }) => {
  const navigate = useNavigate();

  const handleSelectSeats = () => {
    navigate(`/booking/${bus._id}`, { state: { bus } });
  };

  return (
    <div className="bus-card">
      <div className="bus-header">
        <h3>{bus.operatorName}</h3>
        <div className="bus-rating">
          <span className="rating-stars">★ {bus.rating.toFixed(1)}</span>
          <span className="review-count">({bus.reviews} reviews)</span>
        </div>
      </div>

      <div className="bus-details">
        <div className="time-section">
          <div className="departure">
            <p className="time">{formatTime(bus.departureTime)}</p>
            <p className="label">Departure</p>
          </div>
          <div className="duration">
            <p className="duration-text">{calculateDuration(bus.departureTime, bus.arrivalTime)}</p>
          </div>
          <div className="arrival">
            <p className="time">{formatTime(bus.arrivalTime)}</p>
            <p className="label">Arrival</p>
          </div>
        </div>

        <div className="route-section">
          <p className="route">{bus.source} → {bus.destination}</p>
        </div>
      </div>

      <div className="bus-amenities">
        {bus.amenities.slice(0, 3).map((amenity, idx) => (
          <span key={idx} className="amenity-badge">{amenity}</span>
        ))}
      </div>

      <div className="bus-footer">
        <div className="bus-info">
          <p className="bus-type">{bus.busType}</p>
          <p className="seats-available">{bus.availableSeats} seats available</p>
        </div>

        <div className="booking-info">
          <p className="price">{formatPrice(bus.price)}</p>
          <button className="select-btn" onClick={handleSelectSeats}>
            Select Seats
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusCard;
