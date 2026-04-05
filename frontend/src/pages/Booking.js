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
  const [busInfo, setBusInfo] = useState(location.state?.bus || null);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatLayout, setSeatLayout] = useState([]);
  const [returnBuses, setReturnBuses] = useState([]);
  const [returnBus, setReturnBus] = useState(null);
  const [returnSeatLayout, setReturnSeatLayout] = useState([]);
  const [selectedReturnSeats, setSelectedReturnSeats] = useState([]);
  const [isReturnLoading, setIsReturnLoading] = useState(false);
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

  const fetchBusDetails = useCallback(async () => {
    if (busInfo) return;
    try {
      const response = await busAPI.getBusById(busId);
      if (response.data.success) {
        setBusInfo(response.data.bus);
      }
    } catch (error) {
      toast.error('Failed to load bus details');
    }
  }, [busId, busInfo]);

  useEffect(() => {
    fetchBusDetails();
  }, [fetchBusDetails]);

  useEffect(() => {
    if (busInfo && formData.travelDate) {
      fetchSeatLayout();
    }
  }, [busInfo, formData.travelDate, fetchSeatLayout]);

  const fetchReturnBuses = useCallback(async () => {
    if (formData.bookingType !== 'roundtrip' || !busInfo || !formData.returnDate) {
      setReturnBuses([]);
      setReturnBus(null);
      setReturnSeatLayout([]);
      setSelectedReturnSeats([]);
      return;
    }

    setIsReturnLoading(true);
    try {
      const response = await busAPI.searchBuses({
        source: busInfo.destination,
        destination: busInfo.source,
        date: formData.returnDate,
        busType: searchParams.busType || ''
      });

      if (response.data.success) {
        setReturnBuses(response.data.buses);
      }
    } catch (error) {
      toast.error('Failed to load return buses');
      setReturnBuses([]);
    } finally {
      setIsReturnLoading(false);
    }
  }, [busInfo, formData.bookingType, formData.returnDate, searchParams.busType]);

  useEffect(() => {
    fetchReturnBuses();
  }, [fetchReturnBuses]);

  const handleSelectReturnBus = async (bus) => {
    setReturnBus(bus);
    setSelectedReturnSeats([]);
    setReturnSeatLayout([]);

    try {
      const response = await busAPI.getBusSeats(bus._id, formData.returnDate);
      if (response.data.success) {
        setReturnSeatLayout(response.data.seatLayout);
      }
    } catch (error) {
      toast.error('Failed to load return seat layout');
    }
  };

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
    console.log('Booking: handleSeatSelect called with seats:', seats);
    const normalizedSeats = Array.isArray(seats)
      ? Array.from(new Set(seats.map((seat) => Number(seat)).filter((seatNum) => !Number.isNaN(seatNum))))
          .sort((a, b) => a - b)
      : [];
    console.log('Booking: normalizedSeats:', normalizedSeats);

    const [firstName = '', lastName = ''] = user?.name?.split(' ') || [''];

    const newDetails = normalizedSeats.map((seat, index) => {
      if (passengerRegistry[seat]) {
        return passengerRegistry[seat];
      }

      return {
        seatNumber: seat,
        firstName: index === 0 && formData.iAmTravelling ? firstName : '',
        lastName: index === 0 && formData.iAmTravelling ? lastName : '',
        email: '',
        phone: '',
        gender: index === 0 && formData.iAmTravelling ? 'other' : ''
      };
    });

    console.log('Booking: setting selectedSeats to:', normalizedSeats);
    setSelectedSeats(normalizedSeats);
    setPassengerDetails(newDetails);
  };

  const handleReturnSeatSelect = (seats) => {
    const normalizedSeats = Array.isArray(seats)
      ? Array.from(new Set(seats.map((seat) => Number(seat)).filter((seatNum) => !Number.isNaN(seatNum))))
          .sort((a, b) => a - b)
      : [];

    setSelectedReturnSeats(normalizedSeats);
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

    if (formData.bookingType === 'roundtrip') {
      if (!returnBus) {
        toast.error('Please select a return bus');
        return;
      }
      if (selectedReturnSeats.length === 0) {
        toast.error('Please select seats for the return bus');
        return;
      }
    }

    // Add email and phone from form to passenger details
    const passengerDetailsWithContact = passengerDetails.map(p => ({
      ...p,
      email: formData.passengerEmail,
      phone: formData.passengerPhone
    }));

    setIsLoading(true);

    try {
      const payload = {
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
      };

      if (formData.bookingType === 'roundtrip') {
        payload.returnBusId = returnBus._id;
        payload.returnSeatsBooked = selectedReturnSeats;
      }

      const response = await bookingAPI.createBooking(payload);

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

  if (!busInfo) {
    return <div className="booking-container"><p>Bus not found</p></div>;
  }

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h2>{busInfo.operatorName} - Select Seats</h2>
        <p>{busInfo.source} → {busInfo.destination}</p>
      </div>

      <div className="booking-content">
        <div className="seat-section">
          {seatLayout.length > 0 ? (
            <SeatSelector
              seatLayout={seatLayout}
              onSeatSelect={handleSeatSelect}
              selectedSeats={selectedSeats}
              price={busInfo.price}
            />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
              <p>Loading seat layout...</p>
              <small>Departure Date: {formData.travelDate || 'Not selected'}</small>
            </div>
          )}
        </div>

        {formData.bookingType === 'roundtrip' && (
          <div className="return-trip-section">
            <h3>Return Bus Selection</h3>
            <p>{busInfo.destination} → {busInfo.source} on {formData.returnDate}</p>

            {isReturnLoading ? (
              <div style={{ padding: '20px', color: '#666' }}>Loading return buses...</div>
            ) : returnBuses.length > 0 ? (
              <div className="return-bus-list">
                {returnBuses.map((candidate) => (
                  <div
                    key={candidate._id}
                    className={`return-bus-card ${returnBus?._id === candidate._id ? 'selected' : ''}`}
                    style={{
                      border: returnBus?._id === candidate._id ? '2px solid #667eea' : '1px solid #ccc',
                      borderRadius: '10px',
                      padding: '16px',
                      marginBottom: '12px',
                      background: returnBus?._id === candidate._id ? '#f0f4ff' : '#fff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong>{candidate.operatorName}</strong>
                      <span>{candidate.source} → {candidate.destination}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <span>{candidate.busType}</span>
                      <span>{candidate.availableSeats} seats</span>
                      <span>₹{candidate.price}</span>
                    </div>
                    <button
                      type="button"
                      className="select-btn"
                      style={{ marginTop: '12px' }}
                      onClick={() => handleSelectReturnBus(candidate)}
                    >
                      {returnBus?._id === candidate._id ? 'Selected' : 'Select Return Bus'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px', color: '#666' }}>
                No return buses found for the selected return date.
              </div>
            )}

            {returnBus && (
              <div className="seat-section" style={{ marginTop: '24px' }}>
                <h4>Return Seat Selection - {returnBus.operatorName}</h4>
                {returnSeatLayout.length > 0 ? (
                  <SeatSelector
                    seatLayout={returnSeatLayout}
                    onSeatSelect={handleReturnSeatSelect}
                    selectedSeats={selectedReturnSeats}
                    price={returnBus.price}
                  />
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    <p>Loading return seat layout...</p>
                    <small>Return Date: {formData.returnDate || 'Not selected'}</small>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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
                <span>Departure Seats:</span>
                <span>{selectedSeats.join(', ') || 'None'}</span>
              </p>
              {formData.bookingType === 'roundtrip' && (
                <p className="summary-item">
                  <span>Return Seats:</span>
                  <span>{selectedReturnSeats.join(', ') || 'None'}</span>
                </p>
              )}
              <p className="summary-item">
                <span>Price per Seat:</span>
                <span>{formatPrice(busInfo.price)}</span>
              </p>
              {formData.bookingType === 'roundtrip' && returnBus && (
                <p className="summary-item">
                  <span>Return Price per Seat:</span>
                  <span>{formatPrice(returnBus.price)}</span>
                </p>
              )}
              <p className="summary-item total">
                <span>Total Price:</span>
                <span>{formatPrice((selectedSeats.length * busInfo.price) + (selectedReturnSeats.length * (returnBus?.price || 0)))}</span>
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
