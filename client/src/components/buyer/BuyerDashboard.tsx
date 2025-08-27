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
  ShoppingCart,
  Assignment,
  Message,
  TrendingUp,
  Pending,
  CheckCircle,
  LocalShipping,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { RFQ, Order, Message as MessageType } from '../../types';

const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        const [rfqsData, ordersData, messagesData] = await Promise.all([
          apiService.getRFQs(user.tecId),
          apiService.getOrders(user.tecId),
          apiService.getMessages(user.tecId),
        ]);
        
        setRfqs(rfqsData.slice(0, 5)); // Show only recent 5
        setOrders(ordersData.slice(0, 5));
        setMessages(messagesData.slice(0, 5));
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
      case 'shipped': return 'primary';
      default: return 'default';
    }
  };

  const stats = [
    {
      title: 'Active RFQs',
      value: rfqs.filter(rfq => ['pending', 'negotiating'].includes(rfq.status)).length,
      icon: <Assignment color="primary" />,
      color: 'primary',
    },
    {
      title: 'Orders in Progress',
      value: orders.filter(order => ['confirmed', 'in_production', 'shipped'].includes(order.status)).length,
      icon: <ShoppingCart color="secondary" />,
      color: 'secondary',
    },
    {
      title: 'Unread Messages',
      value: messages.filter(msg => !msg.isRead).length,
      icon: <Message color="info" />,
      color: 'info',
    },
    {
      title: 'This Month Orders',
      value: orders.length,
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
        Here's an overview of your marketplace activity
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
        {/* Recent RFQs */}
        <Paper sx={{ p: 2, height: '400px', overflow: 'auto', flex: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Recent RFQs</Typography>
            <Button size="small" onClick={() => navigate('/rfqs')}>
              View All
            </Button>
          </Box>
          <List>
            {rfqs.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary="No RFQs yet"
                  secondary="Start by browsing the catalog to send your first RFQ"
                />
              </ListItem>
            ) : (
              rfqs.map((rfq) => (
                <ListItem
                  key={rfq.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => navigate(`/rfqs/${rfq.id}`)}>
                      <Visibility />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {rfq.status === 'pending' ? <Pending color="warning" /> : 
                     rfq.status === 'accepted' ? <CheckCircle color="success" /> :
                     <Assignment />}
                  </ListItemIcon>
                  <ListItemText
                    primary={`RFQ #${rfq.id} - ${rfq.quantity} units`}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Target: ${rfq.targetPrice}/unit • To: {rfq.supplierTecId}
                        </Typography>
                        <Chip 
                          label={rfq.status} 
                          size="small" 
                          color={getStatusColor(rfq.status) as any}
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
                  secondary="Orders will appear here once your RFQs are accepted"
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
                          ${order.totalPrice} • From: {order.supplierTecId}
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

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box display="flex" gap={2} sx={{ flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/catalog')}
            startIcon={<ShoppingCart />}
          >
            Browse Catalog
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/customization')}
            startIcon={<Assignment />}
          >
            Customize Uniforms
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/search')}
            startIcon={<Assignment />}
          >
            Advanced Search
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/messages')}
            startIcon={<Message />}
          >
            Check Messages
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default BuyerDashboard;