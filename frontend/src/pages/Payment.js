import React, { useState, useCallback } from 'react';
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

  const [bookingInfo, setBookingInfo] = useState(booking || null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const isRetryExpired = bookingInfo?.paymentRetryUntil
    ? new Date(bookingInfo.paymentRetryUntil) < new Date()
    : false;

  const fetchBookingDetails = useCallback(async () => {
    try {
      const response = await bookingAPI.getBookingDetails(bookingId);
      if (response.data.success) {
        setBookingInfo(response.data.booking);
      }
    } catch (error) {
      toast.error('Failed to load booking details');
      navigate('/my-bookings');
    }
  }, [bookingId, navigate]);

  React.useEffect(() => {
    if (!bookingInfo) {
      fetchBookingDetails();
    }
  }, [bookingInfo, fetchBookingDetails]);

  React.useEffect(() => {
    if (!bookingInfo?.paymentRetryUntil || bookingInfo.status !== 'payment_pending') {
      setTimeLeft('');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(bookingInfo.paymentRetryUntil);
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [bookingInfo]);

  const handlePaymentSuccess = async () => {
    if (isRetryExpired) {
      toast.error('Retry window has expired. Please start a new booking.');
      navigate('/my-bookings');
      return;
    }

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
    if (isRetryExpired) {
      toast.error('Retry window has expired, payment cannot be retried.');
      navigate('/my-bookings');
      return;
    }

    try {
      await bookingAPI.confirmBooking(bookingId, {
        paymentStatus: 'failed'
      });
      await fetchBookingDetails();
      toast.error('Payment failed. You can retry payment or cancel this booking.');
    } catch (error) {
      toast.error('Error processing payment failure');
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingInfo || bookingInfo.status !== 'payment_pending') return;

    setIsProcessing(true);
    try {
      const response = await bookingAPI.cancelBooking(bookingId, {
        cancellationReason: 'User cancelled during payment flow'
      });

      if (response.data.success) {
        toast.success('Booking cancelled successfully');
        navigate('/my-bookings');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to cancel booking');
    } finally {
      setIsProcessing(false);
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

  if (!bookingInfo) {
    return <div className="payment-container"><p>Loading booking details...</p></div>;
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>Secure Payment</h2>

        <p className="payment-status">
          Status: <strong>{bookingInfo.status}</strong>
          {bookingInfo.status === 'payment_pending' && timeLeft && (
            <> • Retry window: {timeLeft}</>
          )}
        </p>

        <div className="booking-summary">
          <p><strong>Booking ID:</strong> {bookingInfo.bookingId}</p>
          <p><strong>Passenger:</strong> {bookingInfo.passengerName}</p>
          <p><strong>Departure Seats:</strong> {bookingInfo.seatsBooked.join(', ')}</p>
          {bookingInfo.returnSeatsBooked?.length > 0 && (
            <p><strong>Return Seats:</strong> {bookingInfo.returnSeatsBooked.join(', ')}</p>
          )}
          {bookingInfo.returnBusId && (
            <p><strong>Return Bus:</strong> {bookingInfo.returnBusId.operatorName || bookingInfo.returnBusId}</p>
          )}
          <p className="total-amount">
            <strong>Total Amount:</strong> {formatPrice(bookingInfo.totalPrice)}
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
            disabled={isProcessing || bookingInfo.status !== 'payment_pending' || isRetryExpired}
          >
            {isProcessing ? 'Processing...' : `Pay ${formatPrice(bookingInfo.totalPrice)}`}
          </button>

          <button
            className="fail-btn"
            onClick={handlePaymentFailure}
            disabled={isProcessing || bookingInfo.status !== 'payment_pending' || isRetryExpired}
          >
            Simulate Failure
          </button>

          {bookingInfo.status === 'payment_pending' && (
            <button
              className="cancel-btn"
              onClick={handleCancelBooking}
              disabled={isProcessing}
            >
              Cancel Booking
            </button>
          )}

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

        {isRetryExpired && (
          <p className="payment-error">
            ⚠️ Payment retry window has expired. Please create a new booking.
          </p>
        )}

        <p className="payment-note">
          ℹ️ This is a demo payment. Click "Pay" to confirm your booking.
        </p>
      </div>
    </div>
  );
};

export default Payment;
