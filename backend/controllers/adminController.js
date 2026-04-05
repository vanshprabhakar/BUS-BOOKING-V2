const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Payment = require('../models/Payment');
const BusSchedule = require('../models/BusSchedule');

/**
 * @desc    Add a new bus
 * @route   POST /api/admin/buses
 * @access  Private/Admin
 */
exports.addBus = async (req, res) => {
  try {
    const {
      operatorName,
      registrationNumber,
      busType,
      source,
      destination,
      departureTime,
      arrivalTime,
      totalSeats,
      price,
      amenities,
      image
    } = req.body;

    // Check if bus already exists
    let bus = await Bus.findOne({ registrationNumber });
    if (bus) {
      return res.status(400).json({
        success: false,
        message: 'Bus with this registration number already exists'
      });
    }

    // Calculate duration
    const [depHour, depMin] = departureTime.split(':').map(Number);
    const [arrHour, arrMin] = arrivalTime.split(':').map(Number);
    let depMinutes = depHour * 60 + depMin;
    let arrMinutes = arrHour * 60 + arrMin;

    if (arrMinutes < depMinutes) {
      arrMinutes += 24 * 60; // Add 24 hours if arrival is next day
    }

    const diffMinutes = arrMinutes - depMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    const duration = `${hours}h ${minutes}m`;

    // Create bus
    bus = new Bus({
      operatorName,
      registrationNumber,
      busType,
      source: source.toUpperCase(),
      destination: destination.toUpperCase(),
      departureTime,
      arrivalTime,
      totalSeats,
      availableSeats: totalSeats,
      price,
      duration,
      amenities,
      image
    });

    await bus.save();

    res.status(201).json({
      success: true,
      message: 'Bus added successfully',
      bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update bus details
 * @route   PUT /api/admin/buses/:id
 * @access  Private/Admin
 */
exports.updateBus = async (req, res) => {
  try {
    const { operatorName, price, amenities, isActive } = req.body;

    let bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    if (operatorName) bus.operatorName = operatorName;
    if (price) bus.price = price;
    if (amenities) bus.amenities = amenities;
    if (isActive !== undefined) bus.isActive = isActive;

    await bus.save();

    res.status(200).json({
      success: true,
      message: 'Bus updated successfully',
      bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete a bus
 * @route   DELETE /api/admin/buses/:id
 * @access  Private/Admin
 */
exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all bookings (Admin)
 * @route   GET /api/admin/bookings
 * @access  Private/Admin
 */
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;
    const totalBookings = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(totalBookings / limit);

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone')
      .populate('busId', 'registrationNumber operatorName source destination')
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
 * @desc    Get dashboard analytics
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
exports.getAnalytics = async (req, res) => {
  try {
    // Total buses
    const totalBuses = await Bus.countDocuments();

    // Total users
    const totalUsers = await User.countDocuments();

    // Total bookings
    const totalBookings = await Booking.countDocuments();

    // Total revenue (completed payments)
    const revenues = await Payment.aggregate([
      {
        $match: { paymentStatus: 'completed' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);

    const totalRevenue = revenues.length > 0 ? revenues[0].totalRevenue : 0;

    // Bookings by status
    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Popular routes
    const popularRoutes = await Bus.aggregate([
      {
        $group: {
          _id: {
            source: '$source',
            destination: '$destination'
          },
          busCount: { $sum: 1 },
          totalBookings: { $sum: '$totalSeats' }
        }
      },
      {
        $sort: { busCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('busId', 'operatorName source destination')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      analytics: {
        totalBuses,
        totalUsers,
        totalBookings,
        totalRevenue,
        bookingsByStatus,
        popularRoutes,
        recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      totalUsers,
      totalPages,
      currentPage: parseInt(page),
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get bus occupancy details for a specific date
 * @route   GET /api/admin/buses/date-overview?date=YYYY-MM-DD
 * @access  Private/Admin
 */
exports.getBusesDateOverview = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Query param "date" is required'
      });
    }

    const selectedDate = new Date(date);
    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const buses = await Bus.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    const schedules = await BusSchedule.find({ scheduleDate: selectedDate }).lean();

    const scheduleByBusId = new Map(
      schedules.map((schedule) => [schedule.busId.toString(), schedule])
    );

    const bookings = await Booking.find({
      status: { $in: ['payment_pending', 'confirmed'] },
      $or: [
        { travelDate: selectedDate },
        { returnDate: selectedDate }
      ]
    }).lean();

    const bookingStats = {};
    bookings.forEach((booking) => {
      const travelBusId = booking.busId?.toString();
      const returnBusId = booking.returnBusId?.toString();
      const status = booking.status;

      if (travelBusId && booking.travelDate?.toISOString() === selectedDate.toISOString()) {
        if (!bookingStats[travelBusId]) {
          bookingStats[travelBusId] = { confirmed: 0, pending: 0 };
        }
        bookingStats[travelBusId][status === 'confirmed' ? 'confirmed' : 'pending'] += booking.seatsBooked?.length || 0;
      }

      if (returnBusId && booking.returnDate?.toISOString() === selectedDate.toISOString()) {
        if (!bookingStats[returnBusId]) {
          bookingStats[returnBusId] = { confirmed: 0, pending: 0 };
        }
        bookingStats[returnBusId][status === 'confirmed' ? 'confirmed' : 'pending'] += booking.returnSeatsBooked?.length || 0;
      }
    });

    const overview = buses.map((bus) => {
      const schedule = scheduleByBusId.get(bus._id.toString());
      const stats = bookingStats[bus._id.toString()] || { confirmed: 0, pending: 0 };
      const bookedFromSchedule = schedule
        ? schedule.seatLayout.flat().filter((seat) => seat.status === 'booked').length
        : stats.confirmed;
      const blockedFromSchedule = schedule
        ? schedule.seatLayout.flat().filter((seat) => seat.status === 'blocked').length
        : stats.pending;

      return {
        ...bus,
        selectedDate,
        bookedSeatsForDate: bookedFromSchedule,
        pendingSeatsForDate: blockedFromSchedule,
        availableSeatsForDate: Math.max(0, bus.totalSeats - bookedFromSchedule - blockedFromSchedule),
        hasSchedule: Boolean(schedule)
      };
    });

    res.status(200).json({
      success: true,
      date: selectedDate,
      count: overview.length,
      buses: overview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
