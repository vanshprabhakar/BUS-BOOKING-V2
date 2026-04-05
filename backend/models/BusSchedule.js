const mongoose = require('mongoose');

const busScheduleSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true
    },
    scheduleDate: {
      type: Date,
      required: true
    },
    seatLayout: {
      type: [[
        {
          seatNumber: Number,
          status: { type: String, enum: ['available', 'booked', 'locked'], default: 'available' },
          gender: { type: String, enum: ['male', 'female', 'other', null], default: null },
          price: Number
        }
      ]],
      default: []
    },
    totalSeats: {
      type: Number,
      required: true
    },
    availableSeats: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

busScheduleSchema.index({ busId: 1, scheduleDate: 1 }, { unique: true });

module.exports = mongoose.model('BusSchedule', busScheduleSchema);
