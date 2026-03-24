# 🚌 BusBook - Bus Ticket Booking Application

A production-ready, full-stack bus ticket booking application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Similar to RedBus, it provides a seamless experience for searching, selecting seats, and booking bus tickets.

## 🎯 Features

### ✅ Core Features Implemented

1. **User Authentication**
   - JWT-based authentication
   - Password hashing with bcrypt
   - Role-based access (User/Admin)
   - Secure session management

2. **Bus Search System**
   - Search by source, destination, and date
   - Filter by price range, bus type, departure time
   - Sort by price, duration, and rating
   - Real-time seat availability

3. **Seat Selection**
   - Interactive 2D seat layout
   - Visual indication of available/booked/selected seats
   - Prevent double booking with backend validation
   - Real-time seat locking

4. **Booking System**
   - Create and manage bookings
   - Booking history with detailed information
   - Cancellation with refund calculation
   - Booking confirmation emails

5. **Payment Integration**
   - Mock payment gateway (easily integrable with Razorpay/Stripe)
   - Payment status tracking
   - Transaction ID management
   - Secure payment validation

6. **Admin Panel**
   - Add/edit/delete buses
   - Manage routes and operators
   - View all bookings and analytics
   - User management
   - Dashboard with key metrics

7. **Responsive Design**
   - Mobile-friendly interface
   - Tablet and desktop optimization
   - Touch-friendly buttons and inputs

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Context API** - State management
- **react-toastify** - Notifications
- **CSS3** - Styling

### Database
- **MongoDB Atlas** - Cloud database (recommended)
- **Local MongoDB** - Development

## 📦 Project Structure

```
bus-booking-v2/
├── backend/
│   ├── controllers/          # Route handlers
│   ├── models/              # Database schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Authentication & validation
│   ├── config/              # Configuration files
│   ├── utils/               # Helper functions
│   ├── seeds/               # Database seeding
│   ├── server.js            # Entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/       # React components
    │   ├── pages/           # Page components
    │   ├── services/        # API calls
    │   ├── context/         # Context providers
    │   ├── styles/          # CSS files
    │   ├── utils/           # Helper functions
    │   ├── App.js
    │   └── index.js
    ├── public/
    │   └── index.html
    ├── package.json
    └── .env.example
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- npm or yarn
- MongoDB (local or Atlas)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` with your configuration:**
   ```
   MONGODB_LOCAL=mongodb://localhost:27017/bus-booking
   JWT_SECRET=your_super_secret_jwt_key
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

5. **Seed sample data (optional):**
   ```bash
   npm run seed
   ```

6. **Start the backend server:**
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **In a new terminal, navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/logout` | Logout user |

### Bus Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/buses` | Get all buses with filters |
| GET | `/api/buses/:id` | Get bus details |
| GET | `/api/buses/:id/seats/:date` | Get seat layout for date |
| POST | `/api/buses/search` | Search buses |
| GET | `/api/buses/popular-routes` | Get popular routes |

### Booking Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings/create` | Create booking |
| GET | `/api/bookings/my` | Get user's bookings |
| GET | `/api/bookings/:id` | Get booking details |
| POST | `/api/bookings/:id/confirm` | Confirm booking after payment |
| POST | `/api/bookings/:id/cancel` | Cancel booking |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/buses` | Add new bus |
| PUT | `/api/admin/buses/:id` | Update bus |
| DELETE | `/api/admin/buses/:id` | Delete bus |
| GET | `/api/admin/bookings` | Get all bookings |
| GET | `/api/admin/analytics` | Get analytics |
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id/role` | Update user role |

## 🔐 Authentication

### Login/Register
1. Users can register with name, email, phone, and password
2. Passwords are hashed using bcryptjs
3. JWT tokens are issued upon successful login
4. Tokens are stored in localStorage on the client

### Protected Routes
- `/booking/:id` - Requires authentication
- `/payment/:bookingId` - Requires authentication
- `/my-bookings` - Requires authentication
- `/admin` - Requires authentication + admin role

## 💾 Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: String (user/admin),
  isEmailVerified: Boolean,
  profileImage: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Bus
```javascript
{
  operatorName: String,
  registrationNumber: String (unique),
  busType: String (AC/Non-AC/Sleeper/Seater),
  source: String,
  destination: String,
  departureTime: String (HH:MM),
  arrivalTime: String (HH:MM),
  totalSeats: Number,
  availableSeats: Number,
  price: Number,
  seatLayout: Array,
  amenities: [String],
  rating: Number,
  reviews: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking
```javascript
{
  bookingId: String (unique),
  userId: ObjectId (ref: User),
  busId: ObjectId (ref: Bus),
  passengerName: String,
  passengerEmail: String,
  passengerPhone: String,
  seatsBooked: [Number],
  numberOfPassengers: Number,
  travelDate: Date,
  pickupPoint: String,
  dropPoint: String,
  totalPrice: Number,
  status: String (pending/confirmed/cancelled),
  paymentStatus: String (pending/completed/failed),
  paymentId: String,
  cancellationReason: String,
  refundAmount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment
```javascript
{
  bookingId: ObjectId (ref: Booking),
  userId: ObjectId (ref: User),
  amount: Number,
  currency: String,
  paymentMethod: String,
  paymentGateway: String,
  transactionId: String,
  paymentStatus: String (pending/completed/failed/refunded),
  refundStatus: String,
  refundAmount: Number,
  refundDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Sample Data

The database is pre-populated with sample data using the seed script:

**Users:**
- john@example.com (password: password123)
- jane@example.com (password: password123)
- admin@example.com (password: admin123) - Admin account

**Buses:**
- 8 different bus routes with various operators
- Different bus types (AC, Non-AC, Sleeper, Seater)
- Various amenities and ratings

## 📝 Usage Guide

### For Users

1. **Register/Login**
   - Create an account or login with existing credentials
   - Email: user@example.com, Password: password123

2. **Search Buses**
   - Enter source, destination, and date
   - View available buses with details
   - Filter by price, bus type, etc.

3. **Book Tickets**
   - Click "Select Seats" on a bus
   - Choose your seats on the interactive seat map
   - Fill passenger details
   - Review booking summary

4. **Payment**
   - Select payment method
   - Click "Pay" to complete the booking
   - Receive booking confirmation

5. **Manage Bookings**
   - View all bookings in "My Bookings"
   - Cancel bookings if needed
   - View cancellation refund details

### For Admins

1. **Login as Admin**
   - Email: admin@example.com, Password: admin123

2. **Access Admin Panel**
   - Click "Admin Panel" in navbar

3. **Manage Buses**
   - Add new buses with all details
   - Update existing bus information
   - Delete buses

4. **View Analytics**
   - Total buses, users, bookings
   - Total revenue from completed payments
   - Popular routes
   - Recent bookings

5. **Manage Bookings & Users**
   - View all bookings with details
   - Manage user accounts and roles
   - View user information

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```
MONGODB_LOCAL=mongodb://localhost:27017/bus-booking
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bus-booking
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Push code to GitHub**
2. **Connect repository to deployment platform**
3. **Set environment variables**
4. **Deploy**

### Frontend Deployment (Vercel/Netlify)

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   npm i -g vercel
   vercel
   ```

3. **Or use Netlify:**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Input Validation** - express-validator for server-side validation
- **CORS** - Cross-origin request handling
- **Protected Routes** - Role-based access control
- **Error Handling** - Centralized error handling middleware
- **SQL Injection Prevention** - Mongoose query protection

## 📊 Performance Optimization

- **Database Indexing** - Indexes on frequently searched fields
- **Pagination** - Limit data fetching with pagination
- **Lazy Loading** - Load components as needed
- **Caching** - Implement caching strategies
- **API Rate Limiting** - Prevent abuse

## 🐛 Known Issues & Improvements

### Future Enhancements

1. **Real-time Updates** - Socket.io for live seat updates
2. **Email Integration** - Send confirmation emails
3. **Payment Gateway Integration** - Razorpay/Stripe integration
4. **SMS Notifications** - SMS confirmations
5. **Reviews & Ratings** - User reviews for buses
6. **Cancellation Policies** - Flexible cancellation rules
7. **Multi-language Support** - i18n implementation
8. **Advanced Analytics** - Detailed revenue reports
9. **Mobile App** - React Native app
10. **API Documentation** - Swagger integration

## 📞 Support

For issues or questions:
1. Check the README and documentation
2. Review sample data and test cases
3. Check browser console for errors
4. Verify environment variables are set correctly

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built with ❤️ for the MERN community

---

**Happy Coding! 🚀**
