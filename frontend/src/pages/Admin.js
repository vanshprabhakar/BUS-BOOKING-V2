import React, { useState, useEffect } from 'react';
import '../styles/Admin.css';
import { adminAPI, busAPI } from '../services/api';
import { toast } from 'react-toastify';
import { formatPrice, formatDate } from '../utils/helpers';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [buses, setBuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    operatorName: '',
    registrationNumber: '',
    busType: 'AC',
    source: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    totalSeats: 48,
    price: 0,
    amenities: 'WiFi,AC,Reading Light'
  });

  useEffect(() => {
    if (activeTab === 'dashboard') fetchAnalytics();
    else if (activeTab === 'bookings') fetchBookings();
    else if (activeTab === 'buses') fetchBuses();
    else if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getAnalytics();
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getAllBookings();
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBuses = async () => {
    setIsLoading(true);
    try {
      const response = await busAPI.getAllBuses();
      if (response.data.success) {
        setBuses(response.data.buses);
      }
    } catch (error) {
      toast.error('Failed to fetch buses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getAllUsers();
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    try {
      const response = await adminAPI.addBus({
        ...formData,
        amenities: formData.amenities.split(',').map(a => a.trim()),
        totalSeats: parseInt(formData.totalSeats),
        price: parseFloat(formData.price)
      });

      if (response.data.success) {
        toast.success('Bus added successfully');
        setFormData({
          operatorName: '',
          registrationNumber: '',
          busType: 'AC',
          source: '',
          destination: '',
          departureTime: '',
          arrivalTime: '',
          totalSeats: 48,
          price: 0,
          amenities: 'WiFi,AC,Reading Light'
        });
        fetchBuses();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add bus');
    }
  };

  const handleDeleteBus = async (busId) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      const response = await adminAPI.deleteBus(busId);
      if (response.data.success) {
        toast.success('Bus deleted successfully');
        fetchBuses();
      }
    } catch (error) {
      toast.error('Failed to delete bus');
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'buses' ? 'active' : ''}`}
          onClick={() => setActiveTab('buses')}
        >
          Buses
        </button>
        <button
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && analytics && (
          <div className="dashboard">
            <div className="stat-card">
              <h3>Total Buses</h3>
              <p className="stat-value">{analytics.totalBuses}</p>
            </div>
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-value">{analytics.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Total Bookings</h3>
              <p className="stat-value">{analytics.totalBookings}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-value">{formatPrice(analytics.totalRevenue)}</p>
            </div>
          </div>
        )}

        {activeTab === 'buses' && (
          <div className="admin-section">
            <h2>Manage Buses</h2>

            <form className="add-bus-form" onSubmit={handleAddBus}>
              <h3>Add New Bus</h3>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Operator Name"
                  value={formData.operatorName}
                  onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Registration Number"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  required
                />
                <select
                  value={formData.busType}
                  onChange={(e) => setFormData({ ...formData, busType: e.target.value })}
                >
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                  <option value="Sleeper">Sleeper</option>
                  <option value="Seater">Seater</option>
                </select>
                <input
                  type="text"
                  placeholder="Source City"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Destination City"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  required
                />
                <input
                  type="time"
                  value={formData.departureTime}
                  onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                  required
                />
                <input
                  type="time"
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Total Seats"
                  value={formData.totalSeats}
                  onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                  min="10"
                  max="60"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  step="10"
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Add Bus</button>
            </form>

            <h3>Existing Buses</h3>
            <table className="buses-table">
              <thead>
                <tr>
                  <th>Operator</th>
                  <th>Registration</th>
                  <th>Route</th>
                  <th>Bus Type</th>
                  <th>Price</th>
                  <th>Seats</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {buses.map((bus) => (
                  <tr key={bus._id}>
                    <td>{bus.operatorName}</td>
                    <td>{bus.registrationNumber}</td>
                    <td>{bus.source} → {bus.destination}</td>
                    <td>{bus.busType}</td>
                    <td>{formatPrice(bus.price)}</td>
                    <td>{bus.availableSeats}/{bus.totalSeats}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteBus(bus._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="admin-section">
            <h2>All Bookings</h2>
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Passenger</th>
                  <th>Bus</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.bookingId}</td>
                    <td>{booking.passengerName}</td>
                    <td>{booking.busId.operatorName}</td>
                    <td>{booking.seatsBooked.join(', ')}</td>
                    <td>{formatPrice(booking.totalPrice)}</td>
                    <td>
                      <span className={`status ${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-section">
            <h2>All Users</h2>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
