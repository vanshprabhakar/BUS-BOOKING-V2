# 🎯 Quick Reference Guide

## Quick Start (5 minutes)

### Backend
```bash
cd backend
npm install
npm run seed        # Optional: Load sample data
npm run dev         # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start           # http://localhost:3000
```

---

## Sample Credentials

### Regular Users
- **Email:** john@example.com
- **Password:** password123

- **Email:** jane@example.com
- **Password:** password123

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123

---

## Key File Locations

### Backend
- **Entry:** `backend/server.js`
- **Controllers:** `backend/controllers/*.js`
- **Routes:** `backend/routes/*.js`
- **Models:** `backend/models/*.js`
- **Middleware:** `backend/middleware/*.js`
- **Configuration:** `backend/.env`

### Frontend
- **Entry:** `frontend/src/index.js`
- **Main App:** `frontend/src/App.js`
- **Pages:** `frontend/src/pages/*.js`
- **Components:** `frontend/src/components/*.js`
- **API Calls:** `frontend/src/services/api.js`
- **Styling:** `frontend/src/styles/*.css`

---

## Common Commands

### Backend Commands
```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Run production server
npm start

# Seed database with sample data
npm run seed
```

### Frontend Commands
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

---

## API Quick Reference

### Authentication
```
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # Login user
GET    /api/auth/me             # Get current user
PUT    /api/auth/profile        # Update profile
POST   /api/auth/logout         # Logout
```

### Buses
```
GET    /api/buses               # Get all buses
GET    /api/buses/:id           # Get bus details
POST   /api/buses/search        # Search buses
GET    /api/buses/:id/seats/:date  # Get seat layout
GET    /api/buses/popular-routes   # Popular routes
```

### Bookings
```
POST   /api/bookings/create     # Create booking
GET    /api/bookings/my         # Get my bookings
GET    /api/bookings/:id        # Get booking details
POST   /api/bookings/:id/confirm    # Confirm booking
POST   /api/bookings/:id/cancel     # Cancel booking
```

### Admin
```
POST   /api/admin/buses         # Add bus
PUT    /api/admin/buses/:id     # Update bus
DELETE /api/admin/buses/:id     # Delete bus
GET    /api/admin/bookings      # Get all bookings
GET    /api/admin/analytics     # Get analytics
GET    /api/admin/users         # Get all users
PUT    /api/admin/users/:id/role    # Update user role
```

---

## Environment Variables

### Backend (.env)
```
MONGODB_LOCAL=mongodb://localhost:27017/bus-booking
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **MongoDB connection error** | Start MongoDB: `brew services start mongodb-community` |
| **Port 5000 already in use** | Change port: `PORT=5001 npm run dev` |
| **CORS error** | Check frontend URL in backend `.env` |
| **Buses not loading** | Run seed: `npm run seed` |
| **Login not working** | Clear localStorage and try again |
| **Blank admin panel** | Ensure you're logged in as admin |

---

## Database Collections

### Users
- Store user accounts and authentication
- Passwords are hashed with bcryptjs
- Role: user or admin

### Buses
- Bus information and details
- Seat layout (2D array)
- Amenities, ratings, reviews

### Bookings
- User bookings with seat details
- Status: pending, confirmed, cancelled
- Travel date and passenger info

### Payments
- Payment records for bookings
- Transaction tracking
- Refund information

---

## Features Checklist

- ✅ User authentication (JWT)
- ✅ Registration & Login
- ✅ Bus search & filtering
- ✅ Seat selection interface
- ✅ Booking creation
- ✅ Payment integration (mock)
- ✅ Booking confirmation
- ✅ Booking cancellation with refunds
- ✅ Admin panel
- ✅ Add/edit/delete buses
- ✅ View analytics
- ✅ Responsive design
- ✅ Input validation
- ✅ Error handling
- ✅ Database indexing

---

## Next Steps (Optional Enhancements)

### High Priority
1. Real-time seat updates (Socket.io)
2. Email notifications
3. Razorpay/Stripe integration
4. Business hours support

### Medium Priority
1. SMS notifications
2. Reviews & ratings
3. Advanced analytics
4. Mobile app (React Native)

### Low Priority
1. AI recommendations
2. Multi-language support
3. Loyalty program
4. Social media integration

---

## Performance Tips

- Database queries are indexed
- Pagination implemented (10-20 items per page)
- Lazy loading on frontend
- Optimized CSS files
- Minimize API calls

---

## Security Measures

- ✅ Password hashing (bcryptjs)
- ✅ JWT authentication
- ✅ Input validation
- ✅ CORS protection
- ✅ Error handling (no sensitive data exposed)
- ✅ Role-based access control
- ✅ Race condition prevention in bookings

---

## Documentation Files

- **README.md** - Project overview and setup
- **SETUP_GUIDE.md** - Detailed setup and deployment
- **API_DOCUMENTATION.md** - Complete API reference
- **QUICK_REFERENCE.md** - This file

---

## Resources

- [Express.js Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [React Docs](https://react.dev)
- [JWT Guide](https://jwt.io)
- [Postman](https://www.postman.com)

---

## Support

- Check readme files for detailed information
- Review API documentation for endpoint details
- Check browser console for frontend errors
- Check terminal for backend errors

---

**Happy Coding! 🚀**
