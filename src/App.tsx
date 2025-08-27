import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/common/Layout';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ProtectedRoute, PublicRoute, SupplierRoute, BuyerRoute } from './components/auth/ProtectedRoute';
import { SupplierDashboard } from './pages/SupplierDashboard';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { Marketplace } from './pages/Marketplace';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Public Marketplace (accessible to all) */}
            <Route
              path="/marketplace"
              element={<Marketplace />}
            />

            {/* Protected Routes with Layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      {/* Supplier Routes */}
                      <Route
                        path="/supplier"
                        element={
                          <SupplierRoute>
                            <SupplierDashboard />
                          </SupplierRoute>
                        }
                      />
                      <Route
                        path="/supplier/products"
                        element={
                          <SupplierRoute>
                            <div>Supplier Products Page - Coming Soon</div>
                          </SupplierRoute>
                        }
                      />
                      <Route
                        path="/supplier/samples"
                        element={
                          <SupplierRoute>
                            <div>Supplier Samples Page - Coming Soon</div>
                          </SupplierRoute>
                        }
                      />
                      <Route
                        path="/supplier/rfqs"
                        element={
                          <SupplierRoute>
                            <div>Supplier RFQs Page - Coming Soon</div>
                          </SupplierRoute>
                        }
                      />
                      <Route
                        path="/supplier/orders"
                        element={
                          <SupplierRoute>
                            <div>Supplier Orders Page - Coming Soon</div>
                          </SupplierRoute>
                        }
                      />
                      <Route
                        path="/supplier/messages"
                        element={
                          <SupplierRoute>
                            <div>Supplier Messages Page - Coming Soon</div>
                          </SupplierRoute>
                        }
                      />

                      {/* Buyer Routes */}
                      <Route
                        path="/buyer"
                        element={
                          <BuyerRoute>
                            <BuyerDashboard />
                          </BuyerRoute>
                        }
                      />
                      <Route
                        path="/buyer/rfqs"
                        element={
                          <BuyerRoute>
                            <div>Buyer RFQs Page - Coming Soon</div>
                          </BuyerRoute>
                        }
                      />
                      <Route
                        path="/buyer/rfqs/new"
                        element={
                          <BuyerRoute>
                            <div>Create RFQ Page - Coming Soon</div>
                          </BuyerRoute>
                        }
                      />
                      <Route
                        path="/buyer/orders"
                        element={
                          <BuyerRoute>
                            <div>Buyer Orders Page - Coming Soon</div>
                          </BuyerRoute>
                        }
                      />
                      <Route
                        path="/buyer/messages"
                        element={
                          <BuyerRoute>
                            <div>Buyer Messages Page - Coming Soon</div>
                          </BuyerRoute>
                        }
                      />
                      <Route
                        path="/buyer/customization"
                        element={
                          <BuyerRoute>
                            <div>Uniform Customization Studio - Coming Soon</div>
                          </BuyerRoute>
                        }
                      />

                      {/* Default redirect based on user role */}
                      <Route path="/" element={<Navigate to="/marketplace" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
