import React from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Button,
  Container
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SimpleTecIdDisplay } from '../components/common/SimpleTecIdDisplay';

export const SimpleBuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Buyer Dashboard
        </Typography>
        {user && (
          <SimpleTecIdDisplay tecId={user.tecId} variant="chip" />
        )}
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Browse Marketplace
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Discover products from verified suppliers
            </Typography>
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => navigate('/marketplace')}
            >
              Explore Products
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Create RFQ
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Request quotes for custom requirements
            </Typography>
            <Button variant="outlined" fullWidth>
              New RFQ
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              My Orders
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Track your purchase orders
            </Typography>
            <Button variant="outlined" fullWidth>
              View Orders
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Uniform Studio
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Design custom uniforms and garments
            </Typography>
            <Button variant="outlined" fullWidth>
              Design Studio
            </Button>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Privacy & Security
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your personal information is protected through our TecID system. 
          Suppliers will only see your company TecID, ensuring complete privacy 
          while enabling secure business transactions.
        </Typography>
      </Box>
    </Container>
  );
};