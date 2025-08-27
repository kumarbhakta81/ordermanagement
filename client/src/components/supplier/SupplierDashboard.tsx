import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Inventory,
  Assignment,
  ShoppingCart,
  TrendingUp,
  Pending,
  CheckCircle,
  LocalShipping,
  Visibility,
  Add,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { RFQ, Order, Product } from '../../types';

const SupplierDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        const [rfqsData, ordersData, productsData] = await Promise.all([
          apiService.getRFQs(user.tecId),
          apiService.getOrders(user.tecId),
          apiService.getProducts(),
        ]);
        
        // Filter for supplier's data
        const supplierRfqs = rfqsData.filter(rfq => rfq.supplierTecId === user.tecId);
        const supplierOrders = ordersData.filter(order => order.supplierTecId === user.tecId);
        const supplierProducts = productsData.filter(product => product.supplierTecId === user.tecId);
        
        setRfqs(supplierRfqs.slice(0, 5));
        setOrders(supplierOrders.slice(0, 5));
        setProducts(supplierProducts.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': case 'confirmed': return 'success';
      case 'rejected': case 'cancelled': return 'error';
      case 'negotiating': return 'info';
      case 'shipped': case 'in_production': return 'primary';
      default: return 'default';
    }
  };

  const stats = [
    {
      title: 'Pending RFQs',
      value: rfqs.filter(rfq => rfq.status === 'pending').length,
      icon: <Assignment color="warning" />,
      color: 'warning',
    },
    {
      title: 'Active Orders',
      value: orders.filter(order => ['confirmed', 'in_production'].includes(order.status)).length,
      icon: <ShoppingCart color="primary" />,
      color: 'primary',
    },
    {
      title: 'My Products',
      value: products.length,
      icon: <Inventory color="secondary" />,
      color: 'secondary',
    },
    {
      title: 'This Month Revenue',
      value: `$${orders.filter(order => order.status === 'delivered').reduce((sum, order) => sum + order.totalPrice, 0).toFixed(0)}`,
      icon: <TrendingUp color="success" />,
      color: 'success',
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.tecId}
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Manage your products, RFQs, and orders from your supplier dashboard
      </Typography>

      {/* Stats Cards */}
      <Box display="flex" gap={2} mb={4} sx={{ flexWrap: 'wrap' }}>
        {stats.map((stat) => (
          <Card key={stat.title} sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4">
                    {stat.value}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: `${stat.color}.light` }}>
                  {stat.icon}
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box display="flex" gap={3} sx={{ flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Pending RFQs */}
        <Paper sx={{ p: 2, height: '400px', overflow: 'auto', flex: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Pending RFQs</Typography>
            <Button size="small" onClick={() => navigate('/rfqs')}>
              View All
            </Button>
          </Box>
          <List>
            {rfqs.filter(rfq => rfq.status === 'pending').length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary="No pending RFQs"
                  secondary="New RFQ requests will appear here"
                />
              </ListItem>
            ) : (
              rfqs.filter(rfq => rfq.status === 'pending').map((rfq) => (
                <ListItem
                  key={rfq.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => navigate(`/rfqs/${rfq.id}`)}>
                      <Visibility />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <Pending color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`RFQ #${rfq.id} - ${rfq.quantity} units`}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Target: ${rfq.targetPrice}/unit • From: {rfq.buyerTecId}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {rfq.requirements}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        </Paper>

        {/* Recent Orders */}
        <Paper sx={{ p: 2, height: '400px', overflow: 'auto', flex: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Recent Orders</Typography>
            <Button size="small" onClick={() => navigate('/orders')}>
              View All
            </Button>
          </Box>
          <List>
            {orders.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary="No orders yet"
                  secondary="Orders from accepted RFQs will appear here"
                />
              </ListItem>
            ) : (
              orders.map((order) => (
                <ListItem
                  key={order.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => navigate(`/orders/${order.id}`)}>
                      <Visibility />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {order.status === 'shipped' ? <LocalShipping color="primary" /> : 
                     order.status === 'confirmed' ? <CheckCircle color="success" /> :
                     <ShoppingCart />}
                  </ListItemIcon>
                  <ListItemText
                    primary={`Order #${order.id} - ${order.quantity} units`}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          ${order.totalPrice} • To: {order.buyerTecId}
                        </Typography>
                        <Chip 
                          label={order.status} 
                          size="small" 
                          color={getStatusColor(order.status) as any}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      </Box>

      {/* My Products */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">My Products</Typography>
          <Box>
            <Button 
              size="small" 
              startIcon={<Add />}
              onClick={() => navigate('/products/new')}
              sx={{ mr: 1 }}
            >
              Add Product
            </Button>
            <Button size="small" onClick={() => navigate('/products')}>
              View All
            </Button>
          </Box>
        </Box>
        <Box display="flex" gap={2} sx={{ flexWrap: 'wrap' }}>
          {products.length === 0 ? (
            <Box textAlign="center" py={4} width="100%">
              <Inventory sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No products yet
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Start by adding your first product to the catalog
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/products/new')}>
                Add Your First Product
              </Button>
            </Box>
          ) : (
            products.map((product) => (
              <Card key={product.id} sx={{ minWidth: 250, flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {product.category} • {product.subcategory}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${product.price}
                  </Typography>
                  <Box mt={1}>
                    <Chip 
                      label={product.isApproved ? 'Approved' : 'Pending Approval'}
                      size="small"
                      color={product.isApproved ? 'success' : 'warning'}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </Paper>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box display="flex" gap={2} sx={{ flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/products/new')}
            startIcon={<Add />}
          >
            Add New Product
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/rfqs')}
            startIcon={<Assignment />}
          >
            View RFQ Requests
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/orders')}
            startIcon={<ShoppingCart />}
          >
            Manage Orders
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/messages')}
            startIcon={<Assignment />}
          >
            Check Messages
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SupplierDashboard;