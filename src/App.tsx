import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { SimpleSupplierDashboard } from './pages/SimpleSupplierDashboard';
import { SimpleBuyerDashboard } from './pages/SimpleBuyerDashboard';
import { SimpleMarketplace } from './pages/SimpleMarketplace';

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
            {/* Marketplace - accessible to all */}
            <Route path="/marketplace" element={<SimpleMarketplace />} />
            <Route path="/supplier" element={<SimpleSupplierDashboard />} />
            <Route path="/buyer" element={<SimpleBuyerDashboard />} />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/marketplace" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
