require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Bus = require('../models/Bus');

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_LOCAL || process.env.MONGODB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Bus.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create sample users
    const usersData = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        password: 'password123',
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '8765432109',
        password: 'password123',
        role: 'user'
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '7654321098',
        password: 'admin123',
        role: 'admin'
      }
    ];

    const users = [];
    for (const userData of usersData) {
      const user = new User(userData);
      await user.save();
      users.push(user);
    }
    console.log('✅ Created 3 sample users');

    // Helper function to generate seat layout
    const generateSeatLayout = (totalSeats, price) => {
      const rows = Math.ceil(totalSeats / 4);
      const layout = [];
      let seatNumber = 1;

      for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < 4; j++) {
          if (seatNumber <= totalSeats) {
            row.push({
              seatNumber: seatNumber,
              status: 'available',
              price: price
            });
            seatNumber++;
          }
        }
        layout.push(row);
      }
      return layout;
    };

    // Create sample buses
    const busesData = [
      {
        operatorName: 'RedBus',
        registrationNumber: 'MH01AB1234',
        busType: 'AC',
        source: 'MUMBAI',
        destination: 'DELHI',
        departureTime: '22:00',
        arrivalTime: '06:00',
        duration: '8h 0m',
        totalSeats: 48,
        availableSeats: 48,
        price: 1200,
        amenities: ['WiFi', 'AC', 'Reading Light', 'USB Charger'],
        rating: 4.2,
        reviews: 245
      },
      {
        operatorName: 'GoIbibo',
        registrationNumber: 'MH02BC5678',
        busType: 'Non-AC',
        source: 'MUMBAI',
        destination: 'DELHI',
        departureTime: '14:00',
        arrivalTime: '21:00',
        duration: '7h 0m',
        totalSeats: 48,
        availableSeats: 48,
        price: 800,
        amenities: ['Fan', 'Reading Light'],
        rating: 3.8,
        reviews: 156
      },
      {
        operatorName: 'Volvo Travels',
        registrationNumber: 'DL01CD9012',
        busType: 'Sleeper',
        source: 'DELHI',
        destination: 'KOLKATA',
        departureTime: '20:00',
        arrivalTime: '08:00',
        duration: '12h 0m',
        totalSeats: 32,
        availableSeats: 32,
        price: 2500,
        amenities: ['WiFi', 'AC', 'Bed', 'USB Charger', 'TV'],
        rating: 4.5,
        reviews: 512
      },
      {
        operatorName: 'SaiRam Travels',
        registrationNumber: 'KA01EF3456',
        busType: 'AC',
        source: 'BANGALORE',
        destination: 'HYDERABAD',
        departureTime: '22:30',
        arrivalTime: '06:30',
        duration: '8h 0m',
        totalSeats: 48,
        availableSeats: 48,
        price: 950,
        amenities: ['WiFi', 'AC', 'Reading Light', 'USB Charger'],
        rating: 4.1,
        reviews: 338
      },
      {
        operatorName: 'Shrinivas Travels',
        registrationNumber: 'MH03GH7890',
        busType: 'Seater',
        source: 'MUMBAI',
        destination: 'PUNE',
        departureTime: '06:00',
        arrivalTime: '10:30',
        duration: '4h 30m',
        totalSeats: 52,
        availableSeats: 52,
        price: 450,
        amenities: ['AC', 'Comfortable Seats'],
        rating: 3.9,
        reviews: 267
      },
      {
        operatorName: 'RedBus Premium',
        registrationNumber: 'MH04IJ1234',
        busType: 'Sleeper',
        source: 'MUMBAI',
        destination: 'BANGALORE',
        departureTime: '19:00',
        arrivalTime: '06:00',
        duration: '11h 0m',
        totalSeats: 32,
        availableSeats: 32,
        price: 1800,
        amenities: ['WiFi', 'AC', 'Bed', 'USB Charger', 'TV', 'Pillow'],
        rating: 4.6,
        reviews: 445
      },
      {
        operatorName: 'AllStars Travels',
        registrationNumber: 'TN01KL5678',
        busType: 'AC',
        source: 'CHENNAI',
        destination: 'BANGALORE',
        departureTime: '22:00',
        arrivalTime: '06:00',
        duration: '8h 0m',
        totalSeats: 40,
        availableSeats: 40,
        price: 750,
        amenities: ['WiFi', 'AC', 'Reading Light'],
        rating: 4.0,
        reviews: 189
      },
      {
        operatorName: 'BharathBus',
        registrationNumber: 'AP01MN9012',
        busType: 'Non-AC',
        source: 'HYDERABAD',
        destination: 'VIJAYAWADA',
        departureTime: '12:00',
        arrivalTime: '17:00',
        duration: '5h 0m',
        totalSeats: 52,
        availableSeats: 52,
        price: 350,
        amenities: ['Fan', 'Reading Light'],
        rating: 3.7,
        reviews: 124
      }
    ];

    const buses = [];
    for (const busData of busesData) {
      // Add seatLayout before creating the bus
      busData.seatLayout = generateSeatLayout(busData.totalSeats, busData.price);
      const bus = new Bus(busData);
      await bus.save();
      buses.push(bus);
    }
    console.log('✅ Created 8 sample buses');

    console.log('✨ Seed data completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed data error:', error);
    process.exit(1);
  }
};

// Run the seed function
connectDB().then(() => {
  seedData();
});
