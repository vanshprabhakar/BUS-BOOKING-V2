import React, { useState, useEffect } from 'react';
import '../styles/MyBookings.css';
import { bookingAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatPrice, formatTime } from '../utils/helpers';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await bookingAPI.getMyBookings();
      if (response.data.success) {
        // Transform round-trip bookings into separate departure and return items
        const transformedBookings = [];
        response.data.bookings.forEach(booking => {
          // Add departure booking
          transformedBookings.push({
            ...booking,
            _id: `${booking._id}`,
            originalId: booking._id,
            leg: 'departure',
            displayBus: booking.busId,
            displaySeats: booking.seatsBooked,
            displayDate: booking.travelDate,
            displayPrice: booking.bookingType === 'roundtrip' ? booking.totalPrice - (booking.returnTotalPrice || 0) : booking.totalPrice
          });

          // Add return booking if it's a round-trip
          if (booking.bookingType === 'roundtrip' && booking.returnBusId && booking.returnSeatsBooked?.length > 0) {
            transformedBookings.push({
              ...booking,
              _id: `${booking._id}`,
              originalId: booking._id,
              leg: 'return',
              displayBus: booking.returnBusId,
              displaySeats: booking.returnSeatsBooked,
              displayDate: booking.returnDate,
              displayPrice: booking.returnTotalPrice || 0
            });
          }
        });

        setBookings(transformedBookings);
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

  const getRetryTimeLeft = (booking) => {
    if (!booking.paymentRetryUntil) return null;

    const expiry = new Date(booking.paymentRetryUntil);
    const diff = expiry - now;
    if (diff <= 0) return 'Expired';

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const canRetryPayment = (booking) => {
    return (
      booking.status === 'payment_pending' &&
      booking.paymentRetryUntil &&
      new Date(booking.paymentRetryUntil) > now
    );
  };

  const handleRetryPayment = (booking) => {
    navigate(`/payment/${booking._id}`, {
      state: { booking }
    });
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
                <h3>
                  {booking.displayBus.operatorName}
                  {booking.leg === 'return' && ' (Return)'}
                </h3>
                <span className={`status ${getStatusColor(booking.status)}`}>
                  {booking.status.toUpperCase()}
                </span>
              </div>

              <div className="booking-details">
                <p className="route">
                  {booking.displayBus.source} → {booking.displayBus.destination}
                </p>
                <p className="time">
                  {formatTime(booking.displayBus.departureTime)} - {formatTime(booking.displayBus.arrivalTime)}
                </p>
                <p className="seats">Seats: {booking.displaySeats.join(', ')}</p>
                <p className="date">Travel Date: {formatDate(booking.displayDate)}</p>
                <p className="price">
                  Total: {formatPrice(booking.displayPrice)}
                </p>
                {booking.bookingType === 'roundtrip' && (
                  <p className="booking-type">Round-trip Booking #{booking.bookingId}</p>
                )}
              </div>

              <div className="booking-actions">
                <button
                  className="view-btn"
                  onClick={() => setSelectedBooking(booking)}
                >
                  View Details
                </button>

                {booking.leg === 'departure' && canRetryPayment(booking) && (
                  <button
                    className="retry-btn"
                    onClick={() => handleRetryPayment(booking)}
                  >
                    Retry Payment ({getRetryTimeLeft(booking)})
                  </button>
                )}

                {booking.leg === 'departure' && booking.status === 'payment_pending' && booking.paymentRetryUntil && new Date(booking.paymentRetryUntil) <= now && (
                  <span className="expired-note">Retry window expired</span>
                )}

                {booking.leg === 'departure' && booking.status !== 'cancelled' && booking.status !== 'confirmed' && booking.status !== 'payment_pending' && (
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancelBooking(booking.originalId)}
                  >
                    Cancel Booking
                  </button>
                )}

                {booking.leg === 'departure' && booking.status !== 'cancelled' && booking.status === 'confirmed' && (
                  <button className="cancel-btn" onClick={() => handleCancelBooking(booking.originalId)}>
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
              <p><strong>Leg:</strong> {selectedBooking.leg === 'departure' ? 'Departure' : 'Return'}</p>
              <p><strong>Passenger:</strong> {selectedBooking.passengerName}</p>
              <p><strong>Email:</strong> {selectedBooking.passengerEmail}</p>
              <p><strong>Phone:</strong> {selectedBooking.passengerPhone}</p>
              <p><strong>Bus:</strong> {selectedBooking.displayBus.operatorName}</p>
              <p><strong>Route:</strong> {selectedBooking.displayBus.source} → {selectedBooking.displayBus.destination}</p>
              <p><strong>Seats:</strong> {selectedBooking.displaySeats.join(', ')}</p>
              <p><strong>Travel Date:</strong> {formatDate(selectedBooking.displayDate)}</p>
              <p><strong>Price:</strong> {formatPrice(selectedBooking.displayPrice)}</p>
              <p><strong>Status:</strong> {selectedBooking.status}</p>
              {selectedBooking.bookingType === 'roundtrip' && (
                <p><strong>Booking Type:</strong> Round-trip</p>
              )}
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
