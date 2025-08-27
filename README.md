# Order Management System

A modern order management system with clean separation between frontend and backend components. The project is structured for GitHub Pages deployment and easy API integration.

## Project Structure

```
ordermanagement/
├── client/                 # Frontend React application
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── build/             # Production build (generated)
├── backend/               # Backend API server
│   ├── src/               # Backend source code
│   │   ├── routes/        # API route handlers
│   │   ├── utils/         # Utilities and mock data
│   │   ├── app.js         # Express app configuration
│   │   └── server.js      # Server entry point
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
├── backend_documentation.md # API specification
└── README.md              # This file
```

## Quick Start

### Frontend (Client)

The frontend is a React application ready for GitHub Pages deployment.

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

The client runs on `http://localhost:3000` and is configured to deploy to GitHub Pages at `https://kumarbhakta81.github.io/ordermanagement`.

### Backend (API Server)

The backend provides mock API endpoints that simulate real database operations.

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

The backend runs on `http://localhost:3001` with API endpoints at `/api/*`.

## Features

### Frontend Features
- **React 19** with TypeScript
- **Material-UI** for modern UI components
- **React Router** for navigation
- **Authentication system** with role-based access
- **Responsive design** optimized for all devices
- **GitHub Pages ready** deployment configuration

### Backend Features
- **RESTful API** with Express.js
- **Mock data endpoints** for all business entities
- **CORS enabled** for frontend integration
- **Structured for real API replacement**
- **Comprehensive error handling**
- **Health check endpoints**

## API Endpoints

The backend provides the following main endpoints:

- **Orders**: `/api/orders` - Order management
- **Products**: `/api/products` - Product catalog
- **Customers**: `/api/customers` - Customer management
- **Inventory**: `/api/inventory` - Stock management
- **Authentication**: `/api/auth` - User authentication
- **Dashboard**: `/api/dashboard` - Analytics and reporting

See `backend/README.md` for detailed API documentation.

## Development Workflow

1. **Frontend Development**:
   ```bash
   cd client && npm start
   ```

2. **Backend Development**:
   ```bash
   cd backend && npm run dev
   ```

3. **Full System Testing**:
   - Start both frontend and backend servers
   - Frontend will connect to backend APIs
   - Test complete user workflows

## Deployment

### GitHub Pages (Frontend)
The frontend is configured for automatic GitHub Pages deployment:

```bash
cd client
npm run deploy
```

This builds the React app and deploys it to the `gh-pages` branch.

### Backend Deployment
The backend can be deployed to any Node.js hosting service:
- Heroku
- Vercel
- Railway
- DigitalOcean
- AWS

## Future Enhancements

### Frontend
- Real-time order updates
- Advanced search and filtering
- File upload capabilities
- PWA features

### Backend
- Database integration (PostgreSQL/MongoDB)
- Real authentication with JWT
- File upload handling
- Email notifications
- Third-party API integrations
- Comprehensive testing suite

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

This project is licensed under the MIT License.