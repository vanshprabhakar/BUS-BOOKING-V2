const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticateToken = require('../middleware/auth');

/**
 * @route   POST /api/bookings/create
 * @desc    Create a new booking
 * @access  Private
 */
router.post('/create', authenticateToken, bookingController.createBooking);

/**
 * @route   GET /api/bookings/my
 * @desc    Get all bookings for the logged-in user
 * @access  Private
 */
router.get('/my', authenticateToken, bookingController.getMyBookings);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking details
 * @access  Private
 */
router.get('/:id', authenticateToken, bookingController.getBookingDetails);

/**
 * @route   POST /api/bookings/:id/confirm
 * @desc    Confirm booking after payment
 * @access  Private
 */
router.post('/:id/confirm', authenticateToken, bookingController.confirmBooking);

/**
 * @route   POST /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private
 */
router.post('/:id/cancel', authenticateToken, bookingController.cancelBooking);

module.exports = router;
