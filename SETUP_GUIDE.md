# 🚀 Complete Setup & Deployment Guide

## System Requirements

- Node.js v14 or higher
- MongoDB (v4.4 or higher)
- npm or yarn package manager
- Git
- Modern web browser

## Installation Steps

### Step 1: Clone or Setup Project

```bash
# Navigate to your projects directory
cd ~/Desktop

# Create project directory if not exists
mkdir bus-booking-v2
cd bus-booking-v2
```

### Step 2: Backend Setup

#### 2.1 Install Dependencies

```bash
cd backend
npm install
```

#### 2.2 Configure MongoDB

**Option A: Local MongoDB**
```bash
# On macOS with Homebrew:
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Verify MongoDB is running:
mongosh
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Copy it to your `.env` file

#### 2.3 Setup Environment Variables

```bash
# In backend directory:
cp .env.example .env

# Edit .env file with your settings:
nano .env
```

**Example .env:**
```
MONGODB_LOCAL=mongodb://localhost:27017/bus-booking
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### 2.4 Seed Database

```bash
npm run seed
```

This will:
- Create 3 sample users
- Create 8 sample bus routes
- Initialize all collections

**Sample Credentials:**
- User: john@example.com / password123
- User: jane@example.com / password123
- Admin: admin@example.com / admin123

#### 2.5 Start Backend Server

```bash
npm run dev
```

Expected output:
```
✅ MongoDB connected successfully
🚀 Server is running on port 5000
```

Visit: http://localhost:5000/api/health

### Step 3: Frontend Setup

#### 3.1 Install Dependencies

```bash
cd ../frontend
npm install
```

#### 3.2 Create Environment File

```bash
cp .env.example .env
# Or manually create:
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

#### 3.3 Start Development Server

```bash
npm start
```

This will automatically open http://localhost:3000

## Testing the Application

### 1. User Registration & Login

1. Visit http://localhost:3000
2. Click "Register"
3. Create a new account with:
   - Name: Your Name
   - Email: your@email.com
   - Phone: 1234567890
   - Password: password123

4. Or login with sample credentials:
   - Email: john@example.com
   - Password: password123

### 2. Search & Book Buses

1. On homepage, fill search form:
   - From: MUMBAI
   - To: DELHI
   - Date: Tomorrow's date
   - Bus Type: (optional)

2. Click "Search Buses"
3. Select a bus and click "Select Seats"
4. Choose seats on the interactive seat map
5. Fill passenger details
6. Click "Proceed to Payment"

### 3. Complete Payment

1. Select payment method (demo mode)
2. Click "Pay" button
3. You'll see booking confirmation
4. Go to "My Bookings" to view your booking

### 4. Admin Panel

1. Login with admin account:
   - Email: admin@example.com
   - Password: admin123

2. Click "Admin Panel" in navbar
3. Explore:
   - Dashboard (analytics)
   - Add new buses
   - View all bookings
   - Manage users

## API Testing with Postman

### Import API Collection

1. Open Postman
2. Click "Import"
3. Create API requests for each endpoint

### Sample Requests

**Register User:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Login:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Search Buses:**
```
POST http://localhost:5000/api/buses/search
Content-Type: application/json

{
  "source": "MUMBAI",
  "destination": "DELHI",
  "date": "2024-03-20",
  "priceMin": 0,
  "priceMax": 50000,
  "busType": "AC"
}
```

**Create Booking:**
```
POST http://localhost:5000/api/bookings/create
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "busId": "BUS_ID_HERE",
  "seatsBooked": [1, 2, 3],
  "passengerName": "John Doe",
  "passengerEmail": "john@example.com",
  "passengerPhone": "9876543210",
  "travelDate": "2024-03-20",
  "pickupPoint": "Central Station",
  "dropPoint": "Airport"
}
```

## Production Deployment

### Option 1: Deploy on Render

#### Backend Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/bus-booking.git
   git push -u origin main
   ```

2. **Create Render Account**
   - Go to https://render.com
   - Connect GitHub account

3. **Deploy Backend**
   - Click "New +"
   - Select "Web Service"
   - Connect repository
   - Set configuration:
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Environment Variables: Add all `.env` variables

4. **Update MongoDB**
   - Use MongoDB Atlas (cloud)
   - Add connection string to environment variables

#### Frontend Deployment (Vercel)

1. **Deploy to Vercel**
   ```bash
   npm i -g vercel
   cd frontend
   vercel
   ```

2. **Or use GitHub Integration**
   - Go to https://vercel.com
   - Import GitHub repository
   - Set environment variables:
     - `REACT_APP_API_URL=YOUR_RENDER_BACKEND_URL/api`

### Option 2: Deploy on Railway.app

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Configure backend:
   - Environment: Node.js
   - Start Command: `npm start`

5. Add databases and environment variables

### Option 3: Deploy on Heroku

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_URI=your_mongodb_uri

# Deploy
git push heroku main
```

## Environment Setup for Production

### Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use environment variables for all sensitive data
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Enable CORS properly (not "*")
- [ ] Set up SSL certificates
- [ ] Enable rate limiting
- [ ] Set up logging

### Production .env

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bus-booking
JWT_SECRET=super_strong_random_key_here_min_32_chars
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## Health Checks & Monitoring

### Check Backend Health

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "Server is running",
  "timestamp": "2024-03-17T10:00:00.000Z"
}
```

### Monitor Logs

```bash
# View logs in real-time
tail -f ~/Desktop/bus-booking-v2/backend/logs/error.log

# On production (Render)
# Check Render dashboard for logs
```

## Troubleshooting

### Issue: MongoDB Connection Error

**Solution:**
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

### Issue: Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 PID

# Or use different port
PORT=5001 npm run dev
```

### Issue: CORS Error

**Solution:** Update `server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Issue: JWT Token Invalid

**Solution:**
1. Clear browser storage
2. Login again
3. Check JWT_SECRET matches between frontend and backend

### Issue: Buses Not Showing

**Solution:**
```bash
# Reseed database
cd backend
npm run seed
```

## Database Backup & Restore

### MongoDB Atlas Backup

1. Go to MongoDB Atlas Dashboard
2. Click "Backup" tab
3. Download snapshot or restore from backup

### Local MongoDB Backup

```bash
# Backup
mongodump --out ./backup

# Restore
mongorestore ./backup
```

## Performance Optimization Tips

1. **Enable Database Indexing** - Already implemented
2. **Use Pagination** - Already implemented (limit 10-20 items)
3. **Implement Caching** - Use Redis for repeated queries
4. **Compress Images** - Optimize bus/operator images
5. **CDN** - Use CloudFlare for static assets
6. **Database Connection Pooling** - MongoDB Atlas handles this

## Support Resources

- **MongoDB Docs**: https://docs.mongodb.com
- **Express.js Docs**: https://expressjs.com
- **React Docs**: https://react.dev
- **Render Docs**: https://render.com/docs
- **JWT Guide**: https://jwt.io

---

**Need Help?** Check the main README.md for more information.
