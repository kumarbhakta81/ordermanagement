import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Store,
  RequestQuote,
  ShoppingCart,
  Add,
  TrendingUp,
  Visibility,
  Brush,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { Product, RFQ, Order } from '../types';
import { TecIdDisplay } from '../components/common/TecIdDisplay';

interface DashboardStats {
  totalRFQs: number;
  activeRFQs: number;
  totalOrders: number;
  pendingOrders: number;
}

export const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalRFQs: 0,
    activeRFQs: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentRFQs, setRecentRFQs] = useState<RFQ[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load featured products from marketplace
      const productsResponse = await apiService.getProducts({ isApproved: true }, 1, 8);
      setFeaturedProducts(productsResponse.data);
      
      // Load buyer's RFQs
      const rfqsResponse = await apiService.getBuyerRFQs();
      setRecentRFQs(rfqsResponse.slice(0, 5));
      
      // Load buyer's orders
      const ordersResponse = await apiService.getOrders();
      setRecentOrders(ordersResponse.data.slice(0, 5));
      
      // Calculate stats
      setStats({
        totalRFQs: rfqsResponse.length,
        activeRFQs: rfqsResponse.filter(rfq => rfq.status === 'published' || rfq.status === 'in_negotiation').length,
        totalOrders: ordersResponse.data.length,
        pendingOrders: ordersResponse.data.filter(order => order.status === 'pending').length,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
  }> = ({ title, value, icon, color, onClick }) => (
    <Card sx={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
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
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Buyer Dashboard
        </Typography>
        <TecIdDisplay
          tecId={user!.tecId}
          variant="chip"
          userType="Buyer"
        />
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Store />}
            onClick={() => navigate('/marketplace')}
            sx={{ py: 2 }}
          >
            Browse Marketplace
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Add />}
            onClick={() => navigate('/buyer/rfqs/new')}
            sx={{ py: 2 }}
          >
            Create RFQ
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Brush />}
            onClick={() => navigate('/buyer/customization')}
            sx={{ py: 2 }}
          >
            Customize Uniforms
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ShoppingCart />}
            onClick={() => navigate('/buyer/orders')}
            sx={{ py: 2 }}
          >
            View Orders
          </Button>
        </Grid>
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total RFQs"
            value={stats.totalRFQs}
            icon={<RequestQuote color="primary" />}
            color="primary"
            onClick={() => navigate('/buyer/rfqs')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active RFQs"
            value={stats.activeRFQs}
            icon={<TrendingUp color="info" />}
            color="info"
            onClick={() => navigate('/buyer/rfqs?status=active')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCart color="success" />}
            color="success"
            onClick={() => navigate('/buyer/orders')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={<ShoppingCart color="warning" />}
            color="warning"
            onClick={() => navigate('/buyer/orders?status=pending')}
          />
        </Grid>
      </Grid>

      {/* Featured Products & Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Featured Products
              </Typography>
              <Grid container spacing={2}>
                {featuredProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        '&:hover': { elevation: 4 },
                      }}
                      onClick={() => navigate(`/marketplace/product/${product.tecId}`)}
                    >
                      {product.images.length > 0 && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: 120,
                            objectFit: 'cover',
                            borderRadius: 4,
                            marginBottom: 8,
                          }}
                        />
                      )}
                      <Typography variant="subtitle2" noWrap>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {product.category}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <TecIdDisplay
                          tecId={product.supplierTecId}
                          variant="badge"
                          size="small"
                          color="secondary"
                          userType="Supplier"
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              {featuredProducts.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
                  No featured products available. Check back later!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent RFQs
                  </Typography>
                  <List dense>
                    {recentRFQs.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No RFQs yet. Create your first RFQ to get started.
                      </Typography>
                    ) : (
                      recentRFQs.map((rfq) => (
                        <ListItem key={rfq.id} divider>
                          <ListItemText
                            primary={rfq.title}
                            secondary={
                              <TecIdDisplay
                                tecId={rfq.tecId}
                                variant="text"
                                size="small"
                                showCopy={false}
                              />
                            }
                          />
                          <ListItemSecondaryAction>
                            <Chip
                              label={rfq.status}
                              size="small"
                              color={rfq.status === 'published' ? 'success' : 'default'}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Orders
                  </Typography>
                  <List dense>
                    {recentOrders.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No orders yet. Browse the marketplace to place your first order.
                      </Typography>
                    ) : (
                      recentOrders.map((order) => (
                        <ListItem key={order.id} divider>
                          <ListItemText
                            primary={`Order ${order.tecId}`}
                            secondary={`$${order.totalAmount} ${order.currency}`}
                          />
                          <ListItemSecondaryAction>
                            <Chip
                              label={order.status}
                              size="small"
                              color={order.status === 'delivered' ? 'success' : 'primary'}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};