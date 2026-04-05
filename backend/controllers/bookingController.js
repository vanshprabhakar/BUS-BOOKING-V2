const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const Payment = require('../models/Payment');
const { expireOldPendingBookings } = require('../utils/bookingUtils');

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
      returnBusId,          
      returnSeatsBooked,    
      passengerName,
      passengerEmail,
      passengerPhone,
      travelDate,
      returnDate,
      bookingType,
      passengerDetails,
      passengerGender,
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
    const scheduleDate = new Date(travelDate);
    const returnScheduleDate = returnDate ? new Date(returnDate) : null;
    await expireOldPendingBookings({ busId, travelDate: scheduleDate });
    const BusSchedule = require('../models/BusSchedule');
    const schedule = await BusSchedule.findOne({ busId, scheduleDate });

    // existing booking symptom check (backup source of truth)
    const existingBookings = await Booking.find({
      busId,
      travelDate: scheduleDate,
      status: { $in: ['payment_pending', 'confirmed'] }
    });

    if (schedule) {
      const bookedSeats = schedule.seatLayout
        .flat()
        .filter(seat => seat.status === 'booked')
        .map(seat => seat.seatNumber);

      const scheduleConflicts = seatsBooked.filter((seat) => bookedSeats.includes(seat));
      if (scheduleConflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Seats ${scheduleConflicts.join(', ')} are already booked in this schedule`,
          conflictingSeats: scheduleConflicts
        });
      }
    }

    let returnBus = null;
    if (bookingType === 'roundtrip') {
      if (!returnBusId || !Array.isArray(returnSeatsBooked) || returnSeatsBooked.length === 0 || !returnDate) {
        return res.status(400).json({
          success: false,
          message: 'Round-trip bookings require a return bus, return seats, and return date'
        });
      }

      if (!returnScheduleDate || returnScheduleDate < scheduleDate) {
        return res.status(400).json({
          success: false,
          message: 'Return date must be the same or after the departure date'
        });
      }

      returnBus = await Bus.findById(returnBusId);
      if (!returnBus) {
        return res.status(404).json({
          success: false,
          message: 'Return bus not found'
        });
      }

      if (returnSeatsBooked.length !== seatsBooked.length) {
        return res.status(400).json({
          success: false,
          message: 'Return seat count must match departure seat count for round-trip bookings'
        });
      }

      await expireOldPendingBookings({ busId: returnBusId, travelDate: returnScheduleDate });
      const returnBookings = await Booking.find({
        status: { $in: ['payment_pending', 'confirmed'] },
        $or: [
          { busId: returnBusId, travelDate: returnScheduleDate },
          { returnBusId: returnBusId, returnDate: returnScheduleDate }
        ]
      });

      const returnBookedSeats = [];
      returnBookings.forEach((booking) => {
        if (booking.busId?.toString() === returnBusId.toString() && booking.travelDate?.toISOString() === returnScheduleDate.toISOString()) {
          booking.seatsBooked.forEach((seatNumber) => {
            if (!returnBookedSeats.includes(seatNumber)) returnBookedSeats.push(seatNumber);
          });
        }

        if (booking.returnBusId?.toString() === returnBusId.toString() && booking.returnDate?.toISOString() === returnScheduleDate.toISOString()) {
          booking.returnSeatsBooked?.forEach((seatNumber) => {
            if (!returnBookedSeats.includes(seatNumber)) returnBookedSeats.push(seatNumber);
          });
        }
      });

      const returnConflicts = returnSeatsBooked.filter((seat) => returnBookedSeats.includes(seat));
      if (returnConflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Return seats ${returnConflicts.join(', ')} are already booked`,
          conflictingSeats: returnConflicts
        });
      }
    }

    const bookedSeats = [];
    const genderOnSeat = {};
    existingBookings.forEach(booking => {
      booking.seatsBooked.forEach((seatNumber, index) => {
        const passenger = booking.passengerDetails?.[index] || {};
        bookedSeats.push(seatNumber);
        genderOnSeat[seatNumber] = passenger.gender || 'other';
      });
    });

    // Seat adjacency gender policy (applies across existing bookings)
    if (passengerDetails?.length > 0) {
      seatsBooked.forEach((seatNum, idx) => {
        const selectedGender = (passengerDetails[idx]?.gender || 'other').toLowerCase();
        [seatNum - 1, seatNum + 1].forEach(adj => {
          const adjacentGender = genderOnSeat[adj];
          if (adjacentGender && selectedGender !== 'other' && adjacentGender !== 'other' && adjacentGender !== selectedGender) {
            throw new Error(`Cannot select seat ${seatNum}: adjacent seat ${adj} is booked by ${adjacentGender}`);
          }
        });
      });
    }
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
    const departurePrice = bus.price * seatsBooked.length;
    const returnPrice = returnBus ? returnBus.price * returnSeatsBooked.length : 0;
    const totalPrice = departurePrice + returnPrice;

    // Generate unique booking ID
    const bookingId = `BK${Date.now()}-${req.user._id.toString().slice(-6)}`;

    // Create booking
    const retryWindowMinutes = 10;
    const booking = new Booking({
      bookingId,
      userId: req.user._id,
      busId,
      returnBusId: returnBus ? returnBus._id : null,
      passengerName,
      passengerEmail,
      passengerPhone,
      seatsBooked,
      returnSeatsBooked: returnBus ? returnSeatsBooked : [],
      numberOfPassengers: seatsBooked.length,
      travelDate: new Date(travelDate),
      returnDate: returnDate ? new Date(returnDate) : null,
      returnTotalPrice: returnPrice,
      pickupPoint,
      dropPoint,
      totalPrice,
      bookingType: bookingType || 'oneway',
      passengerDetails: passengerDetails || [
        {
          firstName: passengerName.split(' ')[0] || '',
          lastName: passengerName.split(' ').slice(1).join(' ') || '',
          email: passengerEmail,
          phone: passengerPhone,
          gender: passengerGender || 'other'
        }
      ],
      status: 'payment_pending',
      paymentStatus: 'pending',
      paymentRetryUntil: new Date(Date.now() + retryWindowMinutes * 60 * 1000)
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

    const now = new Date();

    if (paymentStatus === 'completed') {
      booking.status = 'confirmed';
      booking.paymentStatus = 'completed';
      booking.paymentId = transactionId;

      // Update payment status
      await Payment.findOneAndUpdate(
        { bookingId: booking._id },
        { paymentStatus: 'completed', transactionId, updatedAt: new Date() }
      );

      // Update schedule seat availability, not bus static assignment
      const BusSchedule = require('../models/BusSchedule');
      const scheduleDate = new Date(booking.travelDate);
      let schedule = await BusSchedule.findOne({ busId: booking.busId, scheduleDate });

      // if no schedule exists, initialize from bus template
      if (!schedule) {
        const bus = await Bus.findById(booking.busId);
        if (bus) {
          schedule = new BusSchedule({
            busId: booking.busId,
            scheduleDate,
            seatLayout: bus.seatLayout.map(row => row.map((seat) => ({ ...seat, status: 'available', gender: null }))),
            totalSeats: bus.totalSeats,
            availableSeats: bus.totalSeats
          });
        }
      }

      if (schedule) {
        // mark booked seats
        schedule.seatLayout = schedule.seatLayout.map(row =>
          row.map(seat => {
            if (booking.seatsBooked.includes(seat.seatNumber)) {
              return {
                ...seat,
                status: 'booked',
                gender: booking.passengerDetails?.find(p => p.seatNumber === seat.seatNumber)?.gender || 'other'
              };
            }
            return seat;
          })
        );

        const bookedCount = schedule.seatLayout.flat().filter((s) => s.status === 'booked').length;
        schedule.availableSeats = Math.max(0, schedule.totalSeats - bookedCount);
        await schedule.save();
      }

      // Update bus available seats as general metrics (optional)
      const bus = await Bus.findById(booking.busId);
      if (bus) {
        bus.availableSeats = Math.max(0, bus.availableSeats - booking.seatsBooked.length);
        await bus.save();
      }
    } else {
      // If still within retry window, keep pending for retry, but mark payment attempt failed
      if (booking.paymentRetryUntil && now <= booking.paymentRetryUntil) {
        booking.status = 'payment_pending';
        booking.paymentStatus = 'failed';
      } else {
        booking.status = 'failed';
        booking.paymentStatus = 'failed';
      }

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
 * @desc    Bypass payment and confirm booking (admin or demo bypass)
 * @route   POST /api/bookings/:id/bypass
 * @access  Private
 */
exports.bypassBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.status = 'confirmed';
    booking.paymentStatus = 'completed';
    booking.paymentId = `BYPASS-${Date.now()}`;

    await booking.save();

    // update bus seats
    const bus = await Bus.findById(booking.busId);
    if (bus) {
      bus.availableSeats = Math.max(0, bus.availableSeats - booking.seatsBooked.length);
      await bus.save();
    }

    await Payment.findOneAndUpdate({ bookingId: booking._id }, { paymentStatus: 'completed', transactionId: booking.paymentId });

    res.status(200).json({ success: true, message: 'Bypass confirmed', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    let bookings = await Booking.find({ userId: req.user._id })
      .populate('busId', 'operatorName source destination departureTime arrivalTime price')
      .populate('returnBusId', 'operatorName source destination departureTime arrivalTime price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Expire payment pending bookings if retry window passed
    const now = new Date();
    const bookingUpdates = bookings.map(async (booking) => {
      if (
        booking.status === 'payment_pending' &&
        booking.paymentRetryUntil &&
        new Date(booking.paymentRetryUntil) < now
      ) {
        booking.status = 'failed';
        booking.paymentStatus = 'failed';
        await booking.save();
      }
    });
    await Promise.all(bookingUpdates);

    bookings = await Booking.find({ userId: req.user._id })
      .populate('busId', 'operatorName source destination departureTime arrivalTime price')
      .populate('returnBusId', 'operatorName source destination departureTime arrivalTime price')
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
      .populate('returnBusId', 'operatorName source destination departureTime arrivalTime price busType')
      .lean();

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Expire payment retry window automatically
    if (
      booking.status === 'payment_pending' &&
      booking.paymentRetryUntil &&
      new Date(booking.paymentRetryUntil) < new Date()
    ) {
      await Booking.findByIdAndUpdate(booking._id, {
        status: 'failed',
        paymentStatus: 'failed'
      });
      booking.status = 'failed';
      booking.paymentStatus = 'failed';
    }

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
