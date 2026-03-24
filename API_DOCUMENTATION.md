# 📖 API Reference Documentation

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* data here */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ /* array of errors */ ]
}
```

## API Endpoints

### Auth Endpoints

#### 1. Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "confirmPassword": "password123"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### 2. Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### 3. Get Current User
```
GET /auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "user"
  }
}
```

#### 4. Update Profile
```
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "8765432109",
  "profileImage": "url_to_image"
}

Response: 200 OK
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user */ }
}
```

---

### Bus Endpoints

#### 1. Get All Buses
```
GET /buses?page=1&limit=10&sortBy=price

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- sortBy: price | duration | rating (default: createdAt)
- source: Filter by source city
- destination: Filter by destination city
- busType: AC | Non-AC | Sleeper | Seater

Response: 200 OK
{
  "success": true,
  "totalBuses": 50,
  "totalPages": 5,
  "currentPage": 1,
  "buses": [ /* array of buses */ ]
}
```

#### 2. Get Bus by ID
```
GET /buses/:id

Response: 200 OK
{
  "success": true,
  "bus": {
    "_id": "507f1f77bcf86cd799439011",
    "operatorName": "RedBus",
    "source": "MUMBAI",
    "destination": "DELHI",
    "departureTime": "22:00",
    "arrivalTime": "06:00",
    "totalSeats": 48,
    "availableSeats": 48,
    "price": 1200,
    "busType": "AC",
    "rating": 4.2,
    "reviews": 245,
    "amenities": ["WiFi", "AC", "Reading Light"]
  }
}
```

#### 3. Search Buses
```
POST /buses/search
Content-Type: application/json

{
  "source": "MUMBAI",
  "destination": "DELHI",
  "date": "2024-03-20",
  "priceMin": 0,
  "priceMax": 5000,
  "busType": "AC"
}

Response: 200 OK
{
  "success": true,
  "count": 5,
  "buses": [ /* array of matching buses */ ]
}
```

#### 4. Get Bus Seats for Date
```
GET /buses/:busId/seats/:date
Format: YYYY-MM-DD

Response: 200 OK
{
  "success": true,
  "busId": "507f1f77bcf86cd799439011",
  "totalSeats": 48,
  "availableSeatsCount": 40,
  "bookedSeats": [5, 10, 15],
  "seatLayout": [
    [
      { "seatNumber": 1, "status": "available", "price": 1200 },
      { "seatNumber": 2, "status": "available", "price": 1200 }
    ]
  ]
}
```

#### 5. Popular Routes
```
GET /buses/popular-routes

Response: 200 OK
{
  "success": true,
  "routes": [
    {
      "_id": {
        "source": "MUMBAI",
        "destination": "DELHI"
      },
      "count": 8,
      "avgPrice": 1200
    }
  ]
}
```

---

### Booking Endpoints

#### 1. Create Booking
```
POST /bookings/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "busId": "507f1f77bcf86cd799439011",
  "seatsBooked": [1, 2, 3],
  "passengerName": "John Doe",
  "passengerEmail": "john@example.com",
  "passengerPhone": "9876543210",
  "travelDate": "2024-03-20",
  "pickupPoint": "Central Station",
  "dropPoint": "Airport Terminal"
}

Response: 201 Created
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "_id": "507f1f77bcf86cd799439012",
    "bookingId": "BUS1710752400001",
    "userId": "507f1f77bcf86cd799439011",
    "busId": "507f1f77bcf86cd799439011",
    "seatsBooked": [1, 2, 3],
    "totalPrice": 3600,
    "status": "pending",
    "paymentStatus": "pending"
  },
  "paymentId": "507f1f77bcf86cd799439013"
}
```

#### 2. Get My Bookings
```
GET /bookings/my?page=1&limit=10
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "totalBookings": 5,
  "totalPages": 1,
  "currentPage": 1,
  "bookings": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "bookingId": "BUS1710752400001",
      "passengerName": "John Doe",
      "seatsBooked": [1, 2, 3],
      "totalPrice": 3600,
      "status": "confirmed",
      "busId": {
        "operatorName": "RedBus",
        "source": "MUMBAI",
        "destination": "DELHI"
      }
    }
  ]
}
```

#### 3. Get Booking Details
```
GET /bookings/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "booking": { /* full booking details */ },
  "payment": { /* payment details */ }
}
```

#### 4. Confirm Booking (After Payment)
```
POST /bookings/:id/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentStatus": "completed",
  "transactionId": "TXN1710752400001"
}

Response: 200 OK
{
  "success": true,
  "message": "Booking confirmed",
  "booking": { /* updated booking */ }
}
```

#### 5. Cancel Booking
```
POST /bookings/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "cancellationReason": "Change of plans"
}

Response: 200 OK
{
  "success": true,
  "message": "Booking cancelled successfully",
  "refundAmount": 1800,
  "booking": { /* updated booking */ }
}
```

---

### Admin Endpoints

#### 1. Add Bus
```
POST /admin/buses
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "operatorName": "RedBus",
  "registrationNumber": "MH01AB1234",
  "busType": "AC",
  "source": "MUMBAI",
  "destination": "DELHI",
  "departureTime": "22:00",
  "arrivalTime": "06:00",
  "totalSeats": 48,
  "price": 1200,
  "amenities": ["WiFi", "AC", "Reading Light"],
  "image": "image_url"
}

Response: 201 Created
{
  "success": true,
  "message": "Bus added successfully",
  "bus": { /* created bus */ }
}
```

#### 2. Update Bus
```
PUT /admin/buses/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "operatorName": "RedBus Premium",
  "price": 1500,
  "amenities": ["WiFi", "AC", "USB Charger", "TV"]
}

Response: 200 OK
{
  "success": true,
  "message": "Bus updated successfully",
  "bus": { /* updated bus */ }
}
```

#### 3. Delete Bus
```
DELETE /admin/buses/:id
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "success": true,
  "message": "Bus deleted successfully"
}
```

#### 4. Get All Bookings
```
GET /admin/bookings?page=1&limit=20&status=confirmed
Authorization: Bearer <admin_token>

Query Parameters:
- status: pending | confirmed | cancelled
- paymentStatus: pending | completed | failed

Response: 200 OK
{
  "success": true,
  "totalBookings": 100,
  "totalPages": 5,
  "currentPage": 1,
  "bookings": [ /* array of bookings */ ]
}
```

#### 5. Get Analytics
```
GET /admin/analytics
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "success": true,
  "analytics": {
    "totalBuses": 50,
    "totalUsers": 200,
    "totalBookings": 500,
    "totalRevenue": 500000,
    "bookingsByStatus": [
      { "_id": "confirmed", "count": 450 },
      { "_id": "cancelled", "count": 50 }
    ],
    "popularRoutes": [ /* top 5 routes */ ],
    "recentBookings": [ /* last 5 bookings */ ]
  }
}
```

#### 6. Get All Users
```
GET /admin/users?page=1&limit=20
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "success": true,
  "totalUsers": 200,
  "totalPages": 10,
  "currentPage": 1,
  "users": [ /* array of users */ ]
}
```

#### 7. Update User Role
```
PUT /admin/users/:id/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "admin"
}

Response: 200 OK
{
  "success": true,
  "message": "User role updated successfully",
  "user": { /* updated user */ }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Admin access required |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate entry |
| 500 | Server Error |

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per minute per IP

---

## Testing

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Using Postman

1. Import the API endpoints
2. Set up environment variables for `baseUrl` and `token`
3. Use pre-request scripts to save tokens automatically
4. Create API tests

---

## Common Errors

### 401 Unauthorized
- Check if token is included in Authorization header
- Verify token hasn't expired
- Token format should be: `Bearer <token>`

### 400 Bad Request
- Check request body format
- Verify all required fields are present
- Validate data types

### 409 Conflict (Seats Already Booked)
- Seats were booked by another user
- Create a new booking with available seats
- Get updated seat layout first

---

## Best Practices

1. **Always use HTTPS in production**
2. **Never expose JWT secret**
3. **Validate input on frontend and backend**
4. **Implement request timeouts**
5. **Log errors for debugging**
6. **Use pagination for large datasets**
7. **Cache frequently accessed data**
8. **Monitor API performance**

---

For more information, refer to the main README.md
