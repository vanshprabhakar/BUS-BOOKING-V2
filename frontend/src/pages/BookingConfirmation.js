import React, { useEffect, useState } from 'react';
import '../styles/Booking.css';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { toast } from 'react-toastify';
import { formatDate, formatPrice } from '../utils/helpers';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBooking = async () => {
      setIsLoading(true);
      try {
        const response = await bookingAPI.getBookingDetails(bookingId);
        if (response.data.success) {
          setBooking(response.data.booking);
        }
      } catch (error) {
        toast.error('Could not load booking details');
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  if (isLoading || !booking) {
    return <div className="booking-confirmation"><p>Loading booking details...</p></div>;
  }

  return (
    <div className="booking-confirmation">
      <div className="confirmation-card">
        <h2>Booking Confirmed</h2>
        <p>Your booking is now confirmed. Thank you for booking with us!</p>

        <div className="booking-details">
          <p><strong>Booking ID:</strong> {booking.bookingId}</p>
          <p><strong>Status:</strong> {booking.status.toUpperCase()}</p>
          <p><strong>Travel Date:</strong> {formatDate(booking.travelDate)}</p>
          {booking.returnDate && <p><strong>Return Date:</strong> {formatDate(booking.returnDate)}</p>}
          <p><strong>Seats:</strong> {booking.seatsBooked.join(', ')}</p>
          <p><strong>Total:</strong> {formatPrice(booking.totalPrice)}</p>
          <p><strong>Passenger:</strong> {booking.passengerName}</p>
        </div>

        <button onClick={() => navigate('/my-bookings')}>Go to My Bookings</button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
