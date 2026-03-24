const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true
    },
    passengerName: {
      type: String,
      required: true,
      trim: true
    },
    passengerEmail: {
      type: String,
      required: true,
      lowercase: true
    },
    passengerPhone: {
      type: String,
      required: true
    },
    seatsBooked: {
      type: [Number],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one seat must be booked'
      }
    },
    numberOfPassengers: {
      type: Number,
      required: true,
      min: 1
    },
    travelDate: {
      type: Date,
      required: true
    },
    pickupPoint: String,
    dropPoint: String,
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    bookingType: {
      type: String,
      enum: ['oneway', 'roundtrip'],
      default: 'oneway'
    },
    returnDate: {
      type: Date,
      default: null
    },
    passengerDetails: {
      type: [
        {
          firstName: String,
          lastName: String,
          email: String,
          phone: String,
          gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' }
        }
      ],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Passenger details must be provided'
      }
    },
    status: {
      type: String,
      enum: ['initiated', 'payment_pending', 'confirmed', 'failed', 'cancelled'],
      default: 'initiated'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    paymentId: String,
    bookingRemarks: String,
    cancellationReason: String,
    refundAmount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Index for faster queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ busId: 1, travelDate: 1 });
bookingSchema.index({ bookingId: 1 });

// Generate booking ID before saving
bookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingId = `BUS${Date.now()}${count}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
