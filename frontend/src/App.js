import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Buses from './pages/Buses';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import BookingConfirmation from './pages/BookingConfirmation';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SearchProvider>
          <Navbar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/buses" element={<Buses />} />
              <Route path="/booking/:id" element={<ProtectedRoute Component={Booking} />} />
              <Route path="/payment/:bookingId" element={<ProtectedRoute Component={Payment} />} />
              <Route path="/booking-confirmation/:bookingId" element={<ProtectedRoute Component={BookingConfirmation} />} />
              <Route path="/my-bookings" element={<ProtectedRoute Component={MyBookings} />} />
              <Route path="/admin" element={<ProtectedRoute Component={Admin} adminOnly={true} />} />
            </Routes>
          </main>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </SearchProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
