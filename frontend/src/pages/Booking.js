import React, { useState, useEffect, useContext } from 'react';
import '../styles/Booking.css';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { busAPI, bookingAPI } from '../services/api';
import SeatSelector from '../components/SeatSelector';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { formatPrice } from '../utils/helpers';

const Booking = () => {
  const { id: busId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const bus = location.state?.bus;

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatLayout, setSeatLayout] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    passengerName: user?.name || '',
    passengerEmail: user?.email || '',
    passengerPhone: user?.phone || '',
    travelDate: '',
    pickupPoint: '',
    dropPoint: ''
  });

  useEffect(() => {
    if (bus && formData.travelDate) {
      fetchSeatLayout();
    }
  }, [formData.travelDate]);

  const fetchSeatLayout = async () => {
    try {
      const response = await busAPI.getBusSeats(busId, formData.travelDate);
      if (response.data.success) {
        setSeatLayout(response.data.seatLayout);
      }
    } catch (error) {
      toast.error('Failed to fetch seat layout');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSeatSelect = (seats) => {
    setSelectedSeats(seats);
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    setIsLoading(true);

    try {
      const response = await bookingAPI.createBooking({
        busId,
        seatsBooked: selectedSeats,
        passengerName: formData.passengerName,
        passengerEmail: formData.passengerEmail,
        passengerPhone: formData.passengerPhone,
        travelDate: formData.travelDate,
        pickupPoint: formData.pickupPoint,
        dropPoint: formData.dropPoint
      });

      if (response.data.success) {
        toast.success('Booking created! Proceeding to payment...');
        navigate(`/payment/${response.data.booking._id}`, {
          state: { booking: response.data.booking }
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!bus) {
    return <div className="booking-container"><p>Bus not found</p></div>;
  }

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h2>{bus.operatorName} - Select Seats</h2>
        <p>{bus.source} → {bus.destination}</p>
      </div>

      <div className="booking-content">
        <div className="seat-section">
          {seatLayout.length > 0 && (
            <SeatSelector
              seatLayout={seatLayout}
              onSeatSelect={handleSeatSelect}
              selectedSeats={selectedSeats}
              price={bus.price}
            />
          )}
        </div>

        <div className="booking-form-section">
          <form onSubmit={handleBooking} className="booking-form">
            <h3>Passenger & Travel Details</h3>

            <div className="form-group">
              <label>Travel Date *</label>
              <input
                type="date"
                name="travelDate"
                value={formData.travelDate}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Passenger Name *</label>
              <input
                type="text"
                name="passengerName"
                value={formData.passengerName}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="passengerEmail"
                value={formData.passengerEmail}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="passengerPhone"
                value={formData.passengerPhone}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Pickup Point</label>
              <input
                type="text"
                name="pickupPoint"
                value={formData.pickupPoint}
                onChange={handleFormChange}
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label>Drop Point</label>
              <input
                type="text"
                name="dropPoint"
                value={formData.dropPoint}
                onChange={handleFormChange}
                placeholder="Optional"
              />
            </div>

            <div className="booking-summary">
              <p className="summary-item">
                <span>Seats Selected:</span>
                <span>{selectedSeats.join(', ') || 'None'}</span>
              </p>
              <p className="summary-item">
                <span>Price per Seat:</span>
                <span>{formatPrice(bus.price)}</span>
              </p>
              <p className="summary-item total">
                <span>Total Price:</span>
                <span>{formatPrice(selectedSeats.length * bus.price)}</span>
              </p>
            </div>

            <button type="submit" disabled={isLoading} className="proceed-btn">
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
