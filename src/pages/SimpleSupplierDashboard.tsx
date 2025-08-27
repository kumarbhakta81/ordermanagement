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
import { SimpleTecIdDisplay } from '../components/common/SimpleTecIdDisplay';

export const SimpleSupplierDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Supplier Dashboard
        </Typography>
        {user && (
          <SimpleTecIdDisplay tecId={user.tecId} variant="chip" />
        )}
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Products
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manage your product catalog and samples
            </Typography>
            <Button variant="contained" fullWidth>
              Manage Products
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              RFQ Inbox
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              View and respond to buyer requests
            </Typography>
            <Button variant="outlined" fullWidth>
              View RFQs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Orders
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Track your order fulfillment
            </Typography>
            <Button variant="outlined" fullWidth>
              View Orders
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Messages
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Communicate with buyers via TecID
            </Typography>
            <Button variant="outlined" fullWidth>
              View Messages
            </Button>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Privacy Protection
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This platform ensures your privacy and buyers' privacy through our TecID system. 
          You will only see buyer TecIDs, never their personal information.
        </Typography>
      </Box>
    </Container>
  );
};