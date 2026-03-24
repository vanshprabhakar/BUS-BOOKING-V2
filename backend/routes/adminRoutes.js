const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/auth');
const authorizeAdmin = require('../middleware/admin');
const { validateBus, validationErrorHandler } = require('../middleware/validation');

/**
 * @route   POST /api/admin/buses
 * @desc    Add a new bus
 * @access  Private/Admin
 */
router.post('/buses', authenticateToken, authorizeAdmin, validateBus, validationErrorHandler, adminController.addBus);

/**
 * @route   PUT /api/admin/buses/:id
 * @desc    Update bus details
 * @access  Private/Admin
 */
router.put('/buses/:id', authenticateToken, authorizeAdmin, adminController.updateBus);

/**
 * @route   DELETE /api/admin/buses/:id
 * @desc    Delete a bus
 * @access  Private/Admin
 */
router.delete('/buses/:id', authenticateToken, authorizeAdmin, adminController.deleteBus);

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all bookings
 * @access  Private/Admin
 */
router.get('/bookings', authenticateToken, authorizeAdmin, adminController.getAllBookings);

/**
 * @route   GET /api/admin/analytics
 * @desc    Get dashboard analytics
 * @access  Private/Admin
 */
router.get('/analytics', authenticateToken, authorizeAdmin, adminController.getAnalytics);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get('/users', authenticateToken, authorizeAdmin, adminController.getAllUsers);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Private/Admin
 */
router.put('/users/:id/role', authenticateToken, authorizeAdmin, adminController.updateUserRole);

module.exports = router;
