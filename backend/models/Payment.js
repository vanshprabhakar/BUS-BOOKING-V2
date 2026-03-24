const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'net-banking', 'wallet'],
      required: true
    },
    paymentGateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'manual'],
      default: 'manual'
    },
    transactionId: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    failureReason: String,
    refundStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    refundDate: Date,
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

// Index for faster queries
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
