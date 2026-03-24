import React, { useState, useEffect } from 'react';
import '../styles/MyBookings.css';
import { bookingAPI } from '../services/api';
import { toast } from 'react-toastify';
import { formatDate, formatPrice, formatTime } from '../utils/helpers';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await bookingAPI.getMyBookings();
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await bookingAPI.cancelBooking(bookingId, {
        cancellationReason: 'User requested cancellation'
      });

      if (response.data.success) {
        toast.success('Booking cancelled successfully');
        fetchBookings();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancellation failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'payment_pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  if (isLoading) {
    return <div className="my-bookings-container"><p>Loading bookings...</p></div>;
  }

  return (
    <div className="my-bookings-container">
      <h2>My Bookings</h2>

      {bookings.length > 0 ? (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-item">
              <div className="booking-header">
                <h3>{booking.busId.operatorName}</h3>
                <span className={`status ${getStatusColor(booking.status)}`}>
                  {booking.status.toUpperCase()}
                </span>
              </div>

              <div className="booking-details">
                <p className="route">
                  {booking.busId.source} → {booking.busId.destination}
                </p>
                <p className="time">
                  {formatTime(booking.busId.departureTime)} - {formatTime(booking.busId.arrivalTime)}
                </p>
                <p className="seats">Seats: {booking.seatsBooked.join(', ')}</p>
                <p className="date">Travel Date: {formatDate(booking.travelDate)}</p>
                <p className="price">
                  Total: {formatPrice(booking.totalPrice)}
                </p>
              </div>

              <div className="booking-actions">
                <button
                  className="view-btn"
                  onClick={() => setSelectedBooking(booking)}
                >
                  View Details
                </button>
                {booking.status !== 'cancelled' && (
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancelBooking(booking._id)}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-bookings">No bookings found. Start booking your journey!</p>
      )}

      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Booking Details</h3>
            <div className="modal-content">
              <p><strong>Booking ID:</strong> {selectedBooking.bookingId}</p>
              <p><strong>Passenger:</strong> {selectedBooking.passengerName}</p>
              <p><strong>Email:</strong> {selectedBooking.passengerEmail}</p>
              <p><strong>Phone:</strong> {selectedBooking.passengerPhone}</p>
              <p><strong>Bus:</strong> {selectedBooking.busId.operatorName}</p>
              <p><strong>Route:</strong> {selectedBooking.busId.source} → {selectedBooking.busId.destination}</p>
              <p><strong>Seats:</strong> {selectedBooking.seatsBooked.join(', ')}</p>
              <p><strong>Travel Date:</strong> {formatDate(selectedBooking.travelDate)}</p>
              <p><strong>Total Price:</strong> {formatPrice(selectedBooking.totalPrice)}</p>
              <p><strong>Status:</strong> {selectedBooking.status}</p>
            </div>
            <button className="close-btn" onClick={() => setSelectedBooking(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
