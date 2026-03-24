import React, { useState } from 'react';
import '../styles/SeatSelector.css';

const SeatSelector = ({ seatLayout, onSeatSelect, selectedSeats = [], price }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);

  const handleSeatClick = (seatNumber) => {
    const isSelected = selectedSeats.includes(seatNumber);
    if (isSelected) {
      onSeatSelect(selectedSeats.filter(s => s !== seatNumber));
    } else {
      onSeatSelect([...selectedSeats, seatNumber]);
    }
  };

  const getSeatClass = (seat) => {
    if (selectedSeats.includes(seat.seatNumber)) return 'seat selected';
    if (seat.status === 'booked') return 'seat booked';
    return 'seat available';
  };

  return (
    <div className="seat-selector">
      <div className="seat-layout">
        {seatLayout.map((row, rowIdx) => (
          <div key={rowIdx} className="seat-row">
            {row.map((seat) => (
              <button
                key={seat.seatNumber}
                className={getSeatClass(seat)}
                onClick={() => handleSeatClick(seat.seatNumber)}
                disabled={seat.status === 'booked'}
                title={`Seat ${seat.seatNumber}`}
                onMouseEnter={() => setHoveredSeat(seat.seatNumber)}
                onMouseLeave={() => setHoveredSeat(null)}
              >
                {seat.seatNumber}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="seat-legend">
        <div className="legend-item">
          <span className="legend-seat available"></span>
          <label>Available</label>
        </div>
        <div className="legend-item">
          <span className="legend-seat booked"></span>
          <label>Booked</label>
        </div>
        <div className="legend-item">
          <span className="legend-seat selected"></span>
          <label>Selected</label>
        </div>
      </div>

      <div className="seat-summary">
        <p>Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</p>
        <p>Total Price: ₹{(selectedSeats.length * price).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default SeatSelector;
