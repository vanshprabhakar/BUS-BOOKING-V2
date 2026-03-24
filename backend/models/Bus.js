const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    operatorName: {
      type: String,
      required: [true, 'Please provide operator name'],
      trim: true
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true
    },
    busType: {
      type: String,
      enum: ['AC', 'Non-AC', 'Sleeper', 'Seater'],
      required: true
    },
    source: {
      type: String,
      required: [true, 'Please provide source city'],
      trim: true,
      uppercase: true
    },
    destination: {
      type: String,
      required: [true, 'Please provide destination city'],
      trim: true,
      uppercase: true
    },
    departureTime: {
      type: String,
      required: true // HH:MM format
    },
    arrivalTime: {
      type: String,
      required: true // HH:MM format
    },
    duration: {
      type: String,
      required: true // Will be calculated from departure and arrival
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 10,
      max: 60
    },
    availableSeats: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: 0
    },
    seatLayout: {
      type: Array,
      default: []
    },
    amenities: {
      type: [String],
      default: ['WiFi', 'AC', 'Reading Light']
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviews: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    bookings: [
      {
        date: Date,
        bookedSeats: [Number]
      }
    ]
  },
  { timestamps: true }
);

// Index for faster search
busSchema.index({ source: 1, destination: 1, departureTime: 1 });
busSchema.index({ source: 1, destination: 1 });
busSchema.index({ price: 1 });

// Pre-save to initialize seat layout
busSchema.pre('save', function (next) {
  if (!this.seatLayout || this.seatLayout.length === 0) {
    const rows = Math.ceil(this.totalSeats / 4);
    const layout = [];
    let seatNumber = 1;

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        if (seatNumber <= this.totalSeats) {
          row.push({
            seatNumber: seatNumber,
            status: 'available', // available, booked, selected, locked
            price: this.price
          });
          seatNumber++;
        }
      }
      layout.push(row);
    }
    this.seatLayout = layout;
  }
  next();
});

module.exports = mongoose.model('Bus', busSchema);
