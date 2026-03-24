const Bus = require('../models/Bus');

/**
 * @desc    Get all buses with filters
 * @route   GET /api/buses
 * @access  Public
 */
exports.getAllBuses = async (req, res) => {
  try {
    const { source, destination, date, busType, page = 1, limit = 10, sortBy = 'price' } = req.query;

    const filter = { isActive: true };

    // Apply filters
    if (source) filter.source = source.toUpperCase();
    if (destination) filter.destination = destination.toUpperCase();
    if (busType) filter.busType = busType;

    // Build sort object
    let sortObj = {};
    switch (sortBy) {
      case 'price':
        sortObj = { price: 1 };
        break;
      case 'duration':
        sortObj = { duration: 1 };
        break;
      case 'rating':
        sortObj = { rating: -1 };
        break;
      case 'departure':
        sortObj = { departureTime: 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const totalBuses = await Bus.countDocuments(filter);
    const totalPages = Math.ceil(totalBuses / limit);

    // Get buses
    const buses = await Bus.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      totalBuses,
      totalPages,
      currentPage: parseInt(page),
      buses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single bus with seat layout
 * @route   GET /api/buses/:id
 * @access  Public
 */
exports.getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    res.status(200).json({
      success: true,
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
 * @desc    Get bus seats for a specific date
 * @route   GET /api/buses/:id/seats/:date
 * @access  Public
 */
exports.getBusSeats = async (req, res) => {
  try {
    const { id, date } = req.params;

    const bus = await Bus.findById(id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Find bookings for this bus on the given date
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({
      busId: id,
      travelDate: new Date(date),
      status: { $in: ['confirmed', 'pending'] }
    });

    // Get booked seats
    const bookedSeats = [];
    bookings.forEach(booking => {
      bookedSeats.push(...booking.seatsBooked);
    });

    // Update seat layout
    const seatLayout = bus.seatLayout.map(row =>
      row.map(seat => ({
        ...seat,
        status: bookedSeats.includes(seat.seatNumber) ? 'booked' : 'available'
      }))
    );

    res.status(200).json({
      success: true,
      busId: bus._id,
      totalSeats: bus.totalSeats,
      seatLayout,
      bookedSeats,
      availableSeatsCount: bus.totalSeats - bookedSeats.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Search buses by source and destination
 * @route   POST /api/buses/search
 * @access  Public
 */
exports.searchBuses = async (req, res) => {
  try {
    const { source, destination, date, priceMin = 0, priceMax = 50000, busType } = req.body;

    if (!source || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination are required'
      });
    }

    const filter = {
      source: source.toUpperCase(),
      destination: destination.toUpperCase(),
      isActive: true,
      price: { $gte: priceMin, $lte: priceMax }
    };

    if (busType) filter.busType = busType;

    const buses = await Bus.find(filter).sort({ price: 1 });

    res.status(200).json({
      success: true,
      count: buses.length,
      buses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get popular routes
 * @route   GET /api/buses/popular-routes
 * @access  Public
 */
exports.getPopularRoutes = async (req, res) => {
  try {
    const routes = await Bus.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: {
            source: '$source',
            destination: '$destination'
          },
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      routes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
