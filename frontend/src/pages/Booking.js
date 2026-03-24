import React, { useState, useEffect, useContext, useCallback } from 'react';
import '../styles/Booking.css';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { busAPI, bookingAPI } from '../services/api';
import SeatSelector from '../components/SeatSelector';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import { toast } from 'react-toastify';
import { formatPrice } from '../utils/helpers';

const Booking = () => {
  const { id: busId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { searchParams } = useContext(SearchContext);
  const bus = location.state?.bus;

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatLayout, setSeatLayout] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [passengerRegistry, setPassengerRegistry] = useState({}); // Persistent storage by seat number
  const [formData, setFormData] = useState({
    passengerName: user?.name || '',
    passengerEmail: user?.email || '',
    passengerPhone: user?.phone || '',
    travelDate: searchParams.date || '',
    returnDate: searchParams.returnDate || '',
    bookingType: searchParams.bookingType || 'oneway',
    iAmTravelling: true,
    pickupPoint: '',
    dropPoint: ''
  });
  const [passengerDetails, setPassengerDetails] = useState([]);

  const fetchSeatLayout = useCallback(async () => {
    try {
      const response = await busAPI.getBusSeats(busId, formData.travelDate);
      if (response.data.success) {
        setSeatLayout(response.data.seatLayout);
      }
    } catch (error) {
      toast.error('Failed to fetch seat layout');
    }
  }, [busId, formData.travelDate]);

  useEffect(() => {
    if (bus && formData.travelDate) {
      fetchSeatLayout();
    }
  }, [bus, formData.travelDate, fetchSeatLayout]);


  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedData = { ...formData, [name]: type === 'checkbox' ? checked : value };
    setFormData(updatedData);

    // When checking "I am travelling", populate first passenger with user details
    if (name === 'iAmTravelling' && checked && passengerDetails.length > 0) {
      const [firstName = '', lastName = ''] = user?.name?.split(' ') || [''];
      const updated = [...passengerDetails];
      updated[0] = {
        ...updated[0],
        firstName,
        lastName,
        gender: 'other'
      };
      
      // Update registry for seat 1
      setPassengerRegistry(prev => ({
        ...prev,
        [updated[0].seatNumber]: updated[0]
      }));
      
      setPassengerDetails(updated);
    }

    // Clear first passenger details if unchecking "I am travelling"
    if (name === 'iAmTravelling' && !checked && passengerDetails.length > 0) {
      const updated = [...passengerDetails];
      updated[0] = {
        seatNumber: updated[0].seatNumber,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: ''
      };
      
      // Update registry for seat 1
      setPassengerRegistry(prev => ({
        ...prev,
        [updated[0].seatNumber]: updated[0]
      }));
      
      setPassengerDetails(updated);
    }
  };

  const handlePassengerDetailChange = (index, field, value) => {
    const updated = [...passengerDetails];
    const seatNumber = updated[index].seatNumber;
    
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    
    // Also update in persistent registry
    setPassengerRegistry(prev => ({
      ...prev,
      [seatNumber]: updated[index]
    }));
    
    setPassengerDetails(updated);
  };

  const handleSeatSelect = (seats) => {
    const [firstName = '', lastName = ''] = user?.name?.split(' ') || [''];

    const newDetails = seats.map((seat, index) => {
      // Check if this seat has previously entered details in the registry
      if (passengerRegistry[seat]) {
        return passengerRegistry[seat];
      }

      // Create new details for newly selected seat
      return {
        seatNumber: seat,
        firstName: index === 0 && formData.iAmTravelling ? firstName : '',
        lastName: index === 0 && formData.iAmTravelling ? lastName : '',
        email: '',
        phone: '',
        gender: index === 0 && formData.iAmTravelling ? 'other' : ''
      };
    });

    setSelectedSeats(seats);
    setPassengerDetails(newDetails);
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    if (passengerDetails.length !== selectedSeats.length) {
      toast.error('Passenger count must match selected seats');
      return;
    }

    const invalid = passengerDetails.some((p) => !p.firstName || !p.lastName || !p.gender);
    if (invalid) {
      toast.error('Fill in all passenger details');
      return;
    }

    // Add email and phone from form to passenger details
    const passengerDetailsWithContact = passengerDetails.map(p => ({
      ...p,
      email: formData.passengerEmail,
      phone: formData.passengerPhone
    }));

    setIsLoading(true);

    try {
      const response = await bookingAPI.createBooking({
        busId,
        seatsBooked: selectedSeats,
        passengerName: formData.passengerName,
        passengerEmail: formData.passengerEmail,
        passengerPhone: formData.passengerPhone,
        travelDate: formData.travelDate,
        returnDate: formData.returnDate,
        bookingType: formData.bookingType,
        pickupPoint: formData.pickupPoint,
        dropPoint: formData.dropPoint,
        passengerDetails: passengerDetailsWithContact
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
          {seatLayout.length > 0 ? (
            <SeatSelector
              seatLayout={seatLayout}
              onSeatSelect={handleSeatSelect}
              selectedSeats={selectedSeats}
              price={bus.price}
            />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
              <p>Loading seat layout...</p>
              <small>Departure Date: {formData.travelDate || 'Not selected'}</small>
            </div>
          )}
        </div>

        <div className="booking-form-section">
          <form onSubmit={handleBooking} className="booking-form">
            <h3>Passenger & Travel Details</h3>

            <div className="form-group">
              <label>Travel Date</label>
              <input
                type="date"
                name="travelDate"
                value={formData.travelDate}
                readOnly
                disabled
              />
            </div>

            {formData.bookingType === 'roundtrip' && (
              <div className="form-group">
                <label>Return Date</label>
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  readOnly
                  disabled
                />
              </div>
            )}

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="iAmTravelling"
                  checked={formData.iAmTravelling}
                  onChange={handleFormChange}
                />
                <span>I am travelling (fill my details for seat 1)</span>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>User Name *</label>
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
            </div>

            {selectedSeats.length > 0 && (
              <div className="passenger-forms">
                <h4>Passenger details</h4>
                {selectedSeats.map((seat, index) => (
                  <div key={seat} className="passenger-row">
                    <h5>Seat {seat}</h5>
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={passengerDetails[index]?.firstName || ''}
                        onChange={(e) => handlePassengerDetailChange(index, 'firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={passengerDetails[index]?.lastName || ''}
                        onChange={(e) => handlePassengerDetailChange(index, 'lastName', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        value={passengerDetails[index]?.gender || ''}
                        onChange={(e) => handlePassengerDetailChange(index, 'gender', e.target.value)}
                        required
                      >
                        <option value="">Choose</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
