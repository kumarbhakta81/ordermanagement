import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Business, ShoppingCart } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [tecId, setTecId] = useState('');
  const [role, setRole] = useState<'buyer' | 'supplier'>('buyer');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tecId.trim()) {
      setError('Please enter your TecID');
      return;
    }

    try {
      await login(tecId.trim(), role);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleRoleChange = (
    event: React.MouseEvent<HTMLElement>,
    newRole: 'buyer' | 'supplier' | null,
  ) => {
    if (newRole !== null) {
      setRole(newRole);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h4" gutterBottom>
              GarmentMarketplace
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Connect with verified suppliers and buyers using TecID
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Typography variant="h6" gutterBottom>
              Select Your Role
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={role}
              exclusive
              onChange={handleRoleChange}
              fullWidth
              sx={{ mb: 3 }}
            >
              <ToggleButton value="buyer">
                <ShoppingCart sx={{ mr: 1 }} />
                Buyer
              </ToggleButton>
              <ToggleButton value="supplier">
                <Business sx={{ mr: 1 }} />
                Supplier
              </ToggleButton>
            </ToggleButtonGroup>

            <TextField
              margin="normal"
              required
              fullWidth
              id="tecId"
              label="TecID"
              name="tecId"
              autoComplete="username"
              autoFocus
              value={tecId}
              onChange={(e) => setTecId(e.target.value)}
              helperText="Enter your unique TecID for secure, anonymous access"
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="textSecondary" align="center">
                <strong>Privacy First:</strong> Only TecIDs are used for identification.
                No personal information is shared between users.
              </Typography>
            </Box>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Demo Mode:</strong> Use any TecID to test the platform.
                Examples: BUY001, SUP001
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;