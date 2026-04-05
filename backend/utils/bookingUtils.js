const Booking = require('../models/Booking');

async function expireOldPendingBookings(filter = {}) {
  const now = new Date();
  return Booking.updateMany(
    {
      ...filter,
      status: 'payment_pending',
      paymentRetryUntil: { $lt: now }
    },
    {
      status: 'failed',
      paymentStatus: 'failed'
    }
  );
}

module.exports = {
  expireOldPendingBookings
};
