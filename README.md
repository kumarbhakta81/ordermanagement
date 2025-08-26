# Order Management System Frontend

A complete frontend dashboard system for order management platforms, deployable via GitHub Pages.

## 🎯 Features

### Landing Page & Authentication
- **Modern Landing Page** with role selection and responsive design
- **Authentication Forms** with role-based login (Admin/Wholesaler/Retailer)
- **Registration Forms** with role selection and validation
- **Mock Authentication** for demo purposes using localStorage

### Dashboard Layouts
- **Admin Dashboard**: Product approval workflow, user management, system analytics
- **Wholesaler Dashboard**: Product upload, inventory management, order processing
- **Retailer Dashboard**: Product catalog, shopping cart, order tracking

### Interactive Components
- **Product Management**: Multi-image upload preview, approval workflow UI
- **Order Management**: Order creation wizard, status tracking, order history
- **Notification System**: Real-time notifications with badge counts
- **Analytics**: Charts and reports using Chart.js

## 🚀 Live Demo

Visit the live demo: [https://kumarbhakta81.github.io/ordermanagement](https://kumarbhakta81.github.io/ordermanagement)

### Demo Credentials

**Admin Access:**
- Email: admin@ordermanage.com
- Password: admin123

**Wholesaler Access:**
- Email: john@wholesale.com
- Password: wholesale123

**Retailer Access:**
- Email: jane@retail.com
- Password: retail123

## 🎨 UI/UX Features

- **Bootstrap 5** framework for consistent styling
- **Font Awesome** icons for intuitive navigation
- **Responsive Design** - Mobile-first approach
- **Professional Color Scheme** with role-based theming
- **Smooth Animations** and hover effects
- **Interactive Charts** using Chart.js

## 📱 Technical Implementation

### Frontend Architecture
```
frontend/
├── index.html                 # Landing page with role selection
├── css/                       # Stylesheet directory
│   ├── style.css             # Main stylesheet
│   ├── auth.css              # Authentication pages
│   ├── dashboard.css         # Dashboard-specific styles
│   └── responsive.css        # Mobile responsiveness
├── js/                        # JavaScript directory
│   ├── main.js               # Core application logic
│   ├── auth.js               # Authentication handling
│   ├── dashboard.js          # Dashboard functionality
│   ├── products.js           # Product management
│   ├── charts.js             # Analytics and charts
│   └── utils.js              # Utility functions
├── pages/                     # HTML pages
│   ├── login.html            # Login page
│   ├── register.html         # Registration page
│   ├── admin-dashboard.html  # Admin interface
│   ├── wholesaler-dashboard.html # Wholesaler interface
│   └── retailer-dashboard.html   # Retailer interface
└── assets/                    # Static assets
    └── images/               # Images and icons
```

## 🛠 Key Features

### Role-Based Dashboards
- Dynamic sidebar navigation based on user role
- Role-specific feature access and UI elements
- Contextual actions and permissions display

### Product Management
- Multi-image upload with preview thumbnails
- Product form validation and submission
- Approval workflow status indicators
- Category and tag management

### Order Management
- Order creation wizard with step-by-step process
- Order status tracking with visual progress
- Order details with expandable sections
- Shipping and billing address management

### Real-Time Simulation
- Mock real-time updates using JavaScript intervals
- Notification badge updates
- Order status change animations
- Live activity feeds

## 📊 Demo Data

The system includes comprehensive demo data:
- **20+ Sample Products** with various categories and statuses
- **Mock Orders** in all status levels (pending → delivered)
- **User Profiles** for all roles with realistic information
- **Sample Notifications** for demonstration purposes

## 🚀 Deployment

### GitHub Pages Setup
1. Enable GitHub Pages in repository settings
2. Set source to main branch
3. Custom domain support available
4. Automatic deployment on push

### Local Development
```bash
# Serve locally using Python
python3 -m http.server 8000

# Or using Node.js
npx http-server

# Visit http://localhost:8000
```

## 📋 Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## 🎯 Success Criteria

- ✅ All dashboard interfaces are visually complete and functional
- ✅ Navigation works smoothly between different sections
- ✅ Forms are interactive with proper validation
- ✅ Charts and analytics display correctly
- ✅ Mobile responsiveness perfect across devices
- ✅ Loading times optimized for web deployment
- ✅ Demo data provides realistic user experience

## 📧 Contact

For questions or support, please contact the development team or create an issue in this repository.

---

**OrderManage Pro** - Streamlining business operations worldwide.