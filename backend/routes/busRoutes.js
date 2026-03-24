const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const authenticateToken = require('../middleware/auth');

/**
 * @route   GET /api/buses
 * @desc    Get all buses with filters and pagination
 * @access  Public
 * @query   source, destination, date, busType, page, limit, sortBy
 */
router.get('/', busController.getAllBuses);

/**
 * @route   GET /api/buses/popular-routes
 * @desc    Get popular routes
 * @access  Public
 */
router.get('/popular-routes', busController.getPopularRoutes);

/**
 * @route   POST /api/buses/search
 * @desc    Search buses by source, destination, date, price, and type
 * @access  Public
 */
router.post('/search', busController.searchBuses);

/**
 * @route   GET /api/buses/suggestions?q=...
 * @desc    Search suggestion for source/destination
 * @access  Public
 */
router.get('/suggestions', busController.getSuggestions);

/**
 * @route   GET /api/buses/:id
 * @desc    Get single bus details
 * @access  Public
 */
router.get('/:id', busController.getBusById);

/**
 * @route   GET /api/buses/:id/seats/:date
 * @desc    Get seat layout for a specific bus and date
 * @access  Public
 */
router.get('/:id/seats/:date', busController.getBusSeats);

module.exports = router;
