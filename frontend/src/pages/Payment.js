import React, { useState, useContext } from 'react';
import '../styles/Payment.css';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { toast } from 'react-toastify';
import { formatPrice } from '../utils/helpers';

const Payment = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const bypassEnabled = queryParams.get('bypass') === 'true';
  const booking = location.state?.booking;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);

    try {
      const response = await bookingAPI.confirmBooking(bookingId, {
        paymentStatus: 'completed',
        transactionId: `TXN${Date.now()}`
      });

      if (response.data.success) {
        toast.success('Payment successful! Your booking is confirmed.');
        navigate(`/booking-confirmation/${bookingId}`);
      }
    } catch (error) {
      toast.error('Payment confirmation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentFailure = async () => {
    try {
      await bookingAPI.confirmBooking(bookingId, {
        paymentStatus: 'failed'
      });
      toast.error('Payment failed. Please try again.');
      navigate('/my-bookings');
    } catch (error) {
      toast.error('Error processing payment failure');
    }
  };

  const handleBypassPayment = async () => {
    try {
      const response = await bookingAPI.bypassBooking(bookingId);
      if (response.data.success) {
        toast.success('Bypass successful. Booking confirmed');
        navigate(`/booking-confirmation/${bookingId}`);
      }
    } catch (error) {
      toast.error('Bypass failed');
    }
  };

  if (!booking) {
    return <div className="payment-container"><p>Booking not found</p></div>;
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>Secure Payment</h2>

        <div className="booking-summary">
          <p><strong>Booking ID:</strong> {booking.bookingId}</p>
          <p><strong>Passenger:</strong> {booking.passengerName}</p>
          <p><strong>Seats:</strong> {booking.seatsBooked.join(', ')}</p>
          <p className="total-amount">
            <strong>Total Amount:</strong> {formatPrice(booking.totalPrice)}
          </p>
        </div>

        <div className="payment-methods">
          <h3>Select Payment Method</h3>

          <div className="method-options">
            <label className="method-option">
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>💳 Credit/Debit Card</span>
            </label>

            <label className="method-option">
              <input
                type="radio"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>📱 UPI</span>
            </label>

            <label className="method-option">
              <input
                type="radio"
                value="netbanking"
                checked={paymentMethod === 'netbanking'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>🏦 Net Banking</span>
            </label>
          </div>
        </div>

        <div className="payment-actions">
          <button
            className="pay-btn"
            onClick={handlePaymentSuccess}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay ${formatPrice(booking.totalPrice)}`}
          </button>

          <button
            className="fail-btn"
            onClick={handlePaymentFailure}
            disabled={isProcessing}
          >
            Simulate Failure
          </button>

          <button
            className="cancel-btn"
            onClick={() => navigate('/my-bookings')}
            disabled={isProcessing}
          >
            Cancel
          </button>

          {bypassEnabled && (
            <button
              className="bypass-btn"
              onClick={handleBypassPayment}
              disabled={isProcessing}
            >
              Bypass Payment (Demo)
            </button>
          )}
        </div>

        <p className="payment-note">
          ℹ️ This is a demo payment. Click "Pay" to confirm your booking.
        </p>
      </div>
    </div>
  );
};

export default Payment;
