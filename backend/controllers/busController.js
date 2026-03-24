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

    // Get booked seats with gender tags
    const bookedSeatMeta = {};
    const bookedSeats = [];
    bookings.forEach(booking => {
      booking.seatsBooked.forEach((seatNumber, index) => {
        const passenger = booking.passengerDetails?.[index] || {};
        bookedSeatMeta[seatNumber] = {
          gender: passenger.gender || 'other',
          bookingId: booking._id
        };
        if (!bookedSeats.includes(seatNumber)) {
          bookedSeats.push(seatNumber);
        }
      });
    });

    // Update seat layout
    const seatLayout = bus.seatLayout.map(row =>
      row.map(seat => {
        if (bookedSeatMeta[seat.seatNumber]) {
          return {
            ...seat,
            status: 'booked',
            gender: bookedSeatMeta[seat.seatNumber].gender
          };
        }

        return {
          ...seat,
          status: 'available',
          gender: null
        };
      })
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

    const fuzzySource = new RegExp(source.replace(/\W/g, ''), 'i');
    const fuzzyDestination = new RegExp(destination.replace(/\W/g, ''), 'i');

    let filter = {
      isActive: true,
      price: { $gte: priceMin, $lte: priceMax }
    };

    if (busType) filter.busType = busType;

    // Elasticsearch integration placeholder:
    // if (process.env.ELASTICSEARCH_URL) { ... }

    // fallback fuzzy matching via MongoDB regex
    filter.$and = [
      {
        $or: [
          { source: { $regex: fuzzySource } },
          { source: { $regex: new RegExp(source.split('').join('.*'), 'i') } }
        ]
      },
      {
        $or: [
          { destination: { $regex: fuzzyDestination } },
          { destination: { $regex: new RegExp(destination.split('').join('.*'), 'i') } }
        ]
      }
    ];

    // Date is handled in seat availability check rather than bus row (bus is static by route).

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
exports.getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Query param q is required' });
    }

    const regex = new RegExp(q, 'i');

    const sources = await Bus.distinct('source', { source: { $regex: regex }, isActive:true });
    const destinations = await Bus.distinct('destination', { destination: { $regex: regex }, isActive:true });

    const combined = [...new Set([...sources, ...destinations])];

    res.status(200).json({ success: true, suggestions: combined.slice(0, 10) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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
