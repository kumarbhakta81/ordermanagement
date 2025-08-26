# Order Management System

A comprehensive order management system that allows wholesalers to upload products and samples while providing admins with instant notifications and complete order management capabilities.

## 🚀 Live Demo

Visit the live application: [https://kumarbhakta81.github.io/ordermanagement](https://kumarbhakta81.github.io/ordermanagement)

**Demo Credentials:**
- **Admin**: admin@ordermanagement.com / admin123
- **Wholesaler**: Create account with role "wholesaler"
- **Retailer**: Create account with role "retailer"

## ✨ Features

### Role-Based Access Control
- **Admin Dashboard**: Complete platform oversight with product approval workflows, user management, and system analytics
- **Wholesaler Dashboard**: Product and sample upload capabilities, order management, and business analytics  
- **Retailer Dashboard**: Product browsing with advanced filtering, order placement, and order tracking

### Enhanced Product Management
- Multi-image upload system with security validation
- Product approval workflow (pending → approved/rejected)
- Category-based organization with filtering
- Real-time inventory management
- Advanced search and filtering capabilities

### Complete Order Management System
- Full order lifecycle tracking (pending → confirmed → processing → shipped → delivered)
- Role-based order permissions and status updates
- Automated inventory adjustment on order placement/cancellation
- Comprehensive order analytics and reporting
- Shipping address and order notes management

### Real-Time Notification System
- Instant admin notifications for product/sample uploads
- Order status update notifications for all stakeholders
- Real-time polling system with 30-second intervals
- Notification categorization and filtering
- Mark as read/unread functionality with counts

## 🛠 Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MySQL** database with connection pooling
- **JWT** authentication with role-based authorization
- **Multer** for secure file uploads
- **Winston** for comprehensive logging
- **Helmet** for security headers
- **Express-validator** for input validation
- **Rate limiting** by endpoint type

### Frontend
- **Vanilla JavaScript** with ES6+ features
- **Bootstrap 5** for responsive UI
- **Font Awesome** for icons
- **Real-time notifications** with 30-second polling
- **Progressive Web App** features

### Security
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- XSS protection through input escaping
- File upload security with type and size validation
- Rate limiting (auth: 5/15min, uploads: 20/hour, orders: 50/hour)
- CORS configuration and path traversal prevention
- Secure filename generation for uploads

## 📊 Database Schema

The system uses 6 main tables:

1. **users** - User accounts with role-based access
2. **products** - Product catalog with approval workflow
3. **samples** - Sample uploads for wholesalers
4. **orders** - Order management with full lifecycle
5. **order_items** - Individual items within orders
6. **notifications** - Real-time notification system

## 🚦 API Endpoints

### Authentication & Users
- `POST /api/auth/register` - User registration with role selection
- `POST /api/auth/login` - User login with JWT token
- `GET /api/auth/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Admin: Get all users
- `PUT /api/users/:id/role` - Admin: Update user role

### Products
- `GET /api/products` - Get all approved products (with filtering)
- `POST /api/products` - Wholesaler: Create new product
- `PUT /api/products/:id` - Wholesaler: Update own product
- `DELETE /api/products/:id` - Wholesaler: Delete own product
- `PUT /api/products/:id/approve` - Admin: Approve/reject product
- `GET /api/products/pending` - Admin: Get pending products

### Orders
- `GET /api/orders` - Get orders based on user role
- `POST /api/orders` - Retailer: Create new order
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/:id` - Get order details
- `DELETE /api/orders/:id` - Cancel order (if pending)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

## 🏗 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kumarbhakta81/ordermanagement.git
   cd ordermanagement
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup MySQL database:**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE order_management;"
   
   # Import schema
   mysql -u root -p order_management < database/schema.sql
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and other settings
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api
   - Health Check: http://localhost:3000/api/health

### Production Deployment

The application is configured for automatic deployment to GitHub Pages. Simply push to the main branch or any copilot branch to trigger deployment.

For custom deployment:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Configure production environment variables**

3. **Deploy using your preferred method (Docker, PM2, etc.)**

## 📁 Project Structure

```
/
├── backend/
│   ├── controllers/         # API request handlers
│   ├── middleware/         # Auth, validation, rate limiting
│   ├── models/            # Database connection and queries
│   ├── routes/            # API route definitions
│   ├── utils/             # Helper functions and logging
│   └── server.js          # Main server file
├── frontend/
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript modules
│   ├── components/        # Reusable HTML components
│   ├── pages/             # Page templates
│   └── index.html         # Main HTML file
├── uploads/               # File upload directory
├── database/
│   └── schema.sql         # Database schema
├── .github/workflows/     # GitHub Actions deployment
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🔒 Security Features

- **Authentication**: JWT-based with role-based access control
- **Input Validation**: Comprehensive validation using express-validator
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input escaping and sanitization
- **File Upload Security**: Type checking, size limits, secure naming
- **Rate Limiting**: Per-endpoint rate limiting
- **CORS Protection**: Configured for production domains
- **Security Headers**: Helmet.js integration

## 📱 Mobile Responsive

The application is fully responsive and works seamlessly across:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablet devices (iPad, Android tablets)
- Mobile phones (iOS Safari, Android Chrome)

## 🎯 Key Features Demonstrated

### Admin Features
- User management and role assignment
- Product and sample approval workflows
- System-wide analytics and reporting
- Real-time notification management

### Wholesaler Features
- Product catalog management
- Sample upload and management
- Order tracking and fulfillment
- Business analytics and insights

### Retailer Features
- Product browsing and search
- Shopping cart and order placement
- Order tracking and history
- Notification preferences

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@ordermanagement.com

## 🚀 Deployment Status

[![Deploy to GitHub Pages](https://github.com/kumarbhakta81/ordermanagement/actions/workflows/deploy.yml/badge.svg)](https://github.com/kumarbhakta81/ordermanagement/actions/workflows/deploy.yml)

The application is automatically deployed to GitHub Pages on every push to the main branch.