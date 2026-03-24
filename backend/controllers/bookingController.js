const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const Payment = require('../models/Payment');

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings/create
 * @access  Private
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      busId,
      seatsBooked,
      passengerName,
      passengerEmail,
      passengerPhone,
      travelDate,
      pickupPoint,
      dropPoint
    } = req.body;

    // Validate input
    if (!busId || !seatsBooked || !passengerName || !travelDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Get bus details
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Check if seats are available and not already booked
    const existingBookings = await Booking.find({
      busId,
      travelDate: new Date(travelDate),
      status: { $in: ['confirmed', 'pending'] }
    });

    const bookedSeats = [];
    existingBookings.forEach(booking => {
      bookedSeats.push(...booking.seatsBooked);
    });

    // Check if selected seats are already booked
    const conflictingSeats = seatsBooked.filter(seat => bookedSeats.includes(seat));
    if (conflictingSeats.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seats ${conflictingSeats.join(', ')} are already booked`,
        conflictingSeats
      });
    }

    // Calculate total price
    const totalPrice = bus.price * seatsBooked.length;

    // Create booking
    const booking = new Booking({
      userId: req.user._id,
      busId,
      passengerName,
      passengerEmail,
      passengerPhone,
      seatsBooked,
      numberOfPassengers: seatsBooked.length,
      travelDate: new Date(travelDate),
      pickupPoint,
      dropPoint,
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await booking.save();

    // Create payment record
    const payment = new Payment({
      bookingId: booking._id,
      userId: req.user._id,
      amount: totalPrice,
      paymentMethod: 'card',
      paymentStatus: 'pending'
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking,
      paymentId: payment._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Confirm booking after payment
 * @route   POST /api/bookings/:id/confirm
 * @access  Private
 */
exports.confirmBooking = async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify booking belongs to user
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to confirm this booking'
      });
    }

    if (paymentStatus === 'completed') {
      booking.status = 'confirmed';
      booking.paymentStatus = 'completed';
      booking.paymentId = transactionId;

      // Update payment status
      await Payment.findOneAndUpdate(
        { bookingId: booking._id },
        { paymentStatus: 'completed', transactionId, updatedAt: new Date() }
      );

      // Update bus available seats
      const bus = await Bus.findById(booking.busId);
      if (bus) {
        bus.availableSeats = bus.availableSeats - booking.seatsBooked.length;
        await bus.save();
      }
    } else {
      booking.status = 'cancelled';
      booking.paymentStatus = 'failed';

      // Update payment status
      await Payment.findOneAndUpdate(
        { bookingId: booking._id },
        { paymentStatus: 'failed', updatedAt: new Date() }
      );
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking ${paymentStatus === 'completed' ? 'confirmed' : 'cancelled'}`,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get user bookings
 * @route   GET /api/bookings/my
 * @access  Private
 */
exports.getMyBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const totalBookings = await Booking.countDocuments({ userId: req.user._id });
    const totalPages = Math.ceil(totalBookings / limit);

    const bookings = await Booking.find({ userId: req.user._id })
      .populate('busId', 'operatorName source destination departureTime arrivalTime price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      totalBookings,
      totalPages,
      currentPage: parseInt(page),
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get booking details
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('busId', 'operatorName source destination departureTime arrivalTime price busType')
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify booking belongs to user or user is admin
    if (
      booking.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this booking'
      });
    }

    const payment = await Payment.findOne({ bookingId: booking._id });

    res.status(200).json({
      success: true,
      booking,
      payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Cancel booking
 * @route   POST /api/bookings/:id/cancel
 * @access  Private
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify booking belongs to user
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Calculate refund (50% if cancelled before 24 hours)
    const travelDate = new Date(booking.travelDate);
    const currentDate = new Date();
    const diffTime = Math.abs(travelDate - currentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    if (diffDays > 1) {
      refundPercentage = 50;
    } else if (diffDays > 0.5) {
      refundPercentage = 25;
    }

    const refundAmount = (booking.totalPrice * refundPercentage) / 100;

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    booking.refundAmount = refundAmount;

    await booking.save();

    // Update payment
    await Payment.findOneAndUpdate(
      { bookingId: booking._id },
      { refundStatus: 'completed', refundAmount, refundDate: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      refundAmount,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
