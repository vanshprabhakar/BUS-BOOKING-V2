import React from 'react';
import '../styles/SeatSelector.css';

const SeatSelector = ({ seatLayout, onSeatSelect, selectedSeats = [], price }) => {
  console.log('SeatSelector render: seatLayout length:', seatLayout?.length, 'selectedSeats:', selectedSeats);
  const normalizeSeatId = (seatOrNumber) => {
    if (seatOrNumber == null) return null;
    let value = seatOrNumber;

    if (typeof seatOrNumber === 'object') {
      value = seatOrNumber.seatNumber ??
              seatOrNumber._doc?.seatNumber ??
              (typeof seatOrNumber.get === 'function' ? seatOrNumber.get('seatNumber') : undefined) ??
              seatOrNumber.id ??
              seatOrNumber.number ??
              seatOrNumber;
    }

    const id = Number(value);
    return Number.isInteger(id) ? id : null;
  };

  const resolveSelected = () => {
    if (!Array.isArray(selectedSeats)) return [];
    return Array.from(
      new Set(
        selectedSeats
          .map(normalizeSeatId)
          .filter((id) => id !== null)
      )
    ).sort((a, b) => a - b);
  };

  const handleSeatClick = (seat) => {
    const seatId = normalizeSeatId(seat);
    if (seatId === null) {
      console.warn('SeatSelector: invalid seatId, returning', seat);
      return;
    }

    const normalizedSelected = resolveSelected();
    const isSelected = normalizedSelected.includes(seatId);
    const updatedSelected = isSelected
      ? normalizedSelected.filter((s) => s !== seatId)
      : [...normalizedSelected, seatId];

    onSeatSelect(updatedSelected);
  };

  const getSeatClass = (seat) => {
    const seatId = normalizeSeatId(seat);
    const normalizedSelected = resolveSelected();
    if (seatId !== null && normalizedSelected.includes(seatId)) return 'seat selected';
    if (seat?.status === 'booked') {
      if (seat.gender === 'female') return 'seat booked-female';
      if (seat.gender === 'male') return 'seat booked-male';
      return 'seat booked';
    }
    if (seat?.status === 'blocked') {
      return 'seat blocked';
    }
    return 'seat available';
  };

  return (
    <div className="seat-selector">
      <div className="seat-layout">
        {seatLayout.map((row, rowIdx) => {
          const leftBlock = row.slice(0, 2);
          const rightBlock = row.slice(2, 4);

          return (
            <div key={rowIdx} className="seat-row">
              <div className="row-label">Row {rowIdx + 1}</div>

              <div className="seat-block">
                {rightBlock.filter(Boolean).map((seat) => (
                  <button
                    key={`seat-right-${rowIdx}-${seat?.seatNumber ?? Math.random()}`}
                    className={getSeatClass(seat)}
                    onClick={() => handleSeatClick(seat)}
                    disabled={seat?.status === 'booked' || seat?.status === 'blocked'}
                    title={`Seat ${seat?.seatNumber ?? ''}`}
                  >
                    {seat?.seatNumber ?? ''}
                  </button>
                ))}
              </div>

              <div className="aisle" />

              <div className="seat-block">
                {leftBlock.filter(Boolean).map((seat) => (
                  <button
                    key={`seat-left-${rowIdx}-${seat?.seatNumber ?? Math.random()}`}
                    className={getSeatClass(seat)}
                    onClick={() => handleSeatClick(seat)}
                    disabled={seat?.status === 'booked' || seat?.status === 'blocked'}
                    title={`Seat ${seat?.seatNumber ?? ''}`}
                  >
                    {seat?.seatNumber ?? ''}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
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
          <span className="legend-seat blocked"></span>
          <label>Reserved</label>
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
