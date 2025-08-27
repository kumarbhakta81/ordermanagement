import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from '@mui/material';
import {
  Inventory,
  RequestQuote,
  ShoppingCart,
  Message,
  Add,
  TrendingUp,
  PendingActions,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { Product, RFQ, Order } from '../types';
import { TecIdDisplay } from '../components/common/TecIdDisplay';
import { ProductForm } from '../components/supplier/ProductForm';

interface DashboardStats {
  totalProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  activeRFQs: number;
  totalOrders: number;
  pendingOrders: number;
}

export const SupplierDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    activeRFQs: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentRFQs, setRecentRFQs] = useState<RFQ[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load products
      const productsResponse = await apiService.getSupplierProducts(user!.tecId);
      setRecentProducts(productsResponse.slice(0, 5));
      
      // Calculate stats
      const totalProducts = productsResponse.length;
      const approvedProducts = productsResponse.filter(p => p.isApproved).length;
      const pendingProducts = totalProducts - approvedProducts;
      
      // Load RFQs (mock data for now)
      const rfqsResponse = await apiService.getSupplierRFQs();
      setRecentRFQs(rfqsResponse.slice(0, 5));
      
      // Load orders (mock data for now)
      const ordersResponse = await apiService.getOrders();
      setRecentOrders(ordersResponse.data.slice(0, 5));
      
      setStats({
        totalProducts,
        approvedProducts,
        pendingProducts,
        activeRFQs: rfqsResponse.length,
        totalOrders: ordersResponse.data.length,
        pendingOrders: ordersResponse.data.filter(o => o.status === 'pending').length,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductAdded = () => {
    setShowProductForm(false);
    loadDashboardData();
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: 2,
              p: 1,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Supplier Dashboard
        </Typography>
        <TecIdDisplay
          tecId={user!.tecId}
          variant="chip"
          verified={(user as any).isVerified}
          userType="Supplier"
        />
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={<Inventory color="primary" />}
            color="primary"
            subtitle={`${stats.approvedProducts} approved`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Approval"
            value={stats.pendingProducts}
            icon={<PendingActions color="warning" />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active RFQs"
            value={stats.activeRFQs}
            icon={<RequestQuote color="info" />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCart color="success" />}
            color="success"
            subtitle={`${stats.pendingOrders} pending`}
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Products
              </Typography>
              {recentProducts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No products yet. Add your first product to get started.
                </Typography>
              ) : (
                recentProducts.map((product) => (
                  <Box
                    key={product.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {product.name}
                      </Typography>
                      <TecIdDisplay
                        tecId={product.tecId}
                        variant="text"
                        size="small"
                        showCopy={false}
                      />
                    </Box>
                    <Chip
                      label={product.isApproved ? 'Approved' : 'Pending'}
                      color={product.isApproved ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent RFQs
              </Typography>
              {recentRFQs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No RFQs yet. Check back later for new opportunities.
                </Typography>
              ) : (
                recentRFQs.map((rfq) => (
                  <Box
                    key={rfq.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {rfq.title}
                      </Typography>
                      <TecIdDisplay
                        tecId={rfq.tecId}
                        variant="text"
                        size="small"
                        showCopy={false}
                      />
                    </Box>
                    <Chip
                      label={rfq.status}
                      color="primary"
                      size="small"
                    />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add product"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setShowProductForm(true)}
      >
        <Add />
      </Fab>

      {/* Add Product Dialog */}
      <Dialog
        open={showProductForm}
        onClose={() => setShowProductForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <ProductForm onSuccess={handleProductAdded} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProductForm(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};