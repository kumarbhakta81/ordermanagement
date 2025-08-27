# Order Management Backend

This is a mock backend API for the Order Management System. It provides RESTful endpoints with dummy data that can be easily replaced with real database connections and business logic.

## Features

- **Mock Data**: All endpoints return realistic mock data
- **RESTful API**: Follows REST conventions
- **Easy Integration**: Structured for easy replacement with real APIs
- **Express.js**: Built with Express.js framework
- **CORS Enabled**: Ready for frontend integration

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

### Orders
- `GET /api/orders` - List orders (with filtering)
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Products
- `GET /api/products` - List products (with search/filtering)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Add new product
- `PATCH /api/products/:id/stock` - Update product stock

### Customers
- `GET /api/customers` - List customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create new customer

### Inventory
- `GET /api/inventory` - Get inventory overview
- `GET /api/inventory/:productId` - Get stock for specific product

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Dashboard
- `GET /api/dashboard/overview` - Dashboard statistics
- `GET /api/dashboard/sales` - Sales data
- `GET /api/dashboard/inventory` - Inventory analytics

## Response Format

All responses follow a consistent format:

```json
{
  "data": {...},
  "pagination": {...}, // For list endpoints
  "error": {...} // For error responses
}
```

## Mock Data

The API uses in-memory mock data stored in `src/utils/mockData.js`. This includes:
- Sample orders with different statuses
- Product catalog with categories
- Customer information
- User accounts for authentication

## Future Integration

This mock backend is designed to be easily replaced with real implementations:

1. Replace mock data with database models
2. Add real authentication middleware
3. Implement business logic in service layers
4. Add data validation and error handling
5. Connect to external APIs and services

## Development

- The server auto-reloads on file changes with `npm run dev`
- All routes are modular and located in `src/routes/`
- Mock data can be easily modified in `src/utils/mockData.js`
- Add new endpoints by creating new route files and importing them in `app.js`