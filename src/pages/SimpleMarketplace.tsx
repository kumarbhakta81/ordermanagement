import React from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent,
  CardMedia,
  Button,
  Container,
  TextField,
  Chip
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { SimpleTecIdDisplay } from '../components/common/SimpleTecIdDisplay';

// Mock data for demonstration
const mockProducts = [
  {
    id: '1',
    tecId: 'PRD-ABC123',
    supplierTecId: 'SUP-XYZ789',
    name: 'Cotton Business Shirts',
    description: 'High-quality cotton shirts perfect for corporate environments',
    category: 'Shirts',
    price: '$25-45 USD',
    image: '/api/placeholder/300/200',
    isApproved: true,
  },
  {
    id: '2',
    tecId: 'PRD-DEF456',
    supplierTecId: 'SUP-ABC123',
    name: 'Polyester Uniforms',
    description: 'Durable polyester uniforms for hospitality industry',
    category: 'Uniforms',
    price: '$30-50 USD',
    image: '/api/placeholder/300/200',
    isApproved: true,
  },
  {
    id: '3',
    tecId: 'PRD-GHI789',
    supplierTecId: 'SUP-DEF456',
    name: 'Custom Embroidered Polos',
    description: 'Premium polo shirts with custom embroidery options',
    category: 'T-Shirts',
    price: '$20-35 USD',
    image: '/api/placeholder/300/200',
    isApproved: true,
  },
];

export const SimpleMarketplace: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        GarmentTrade Marketplace
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Discover quality garments from verified suppliers worldwide
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search products, categories, or suppliers..."
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ maxWidth: 600 }}
        />
      </Box>

      {/* Categories */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Categories
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['Shirts', 'Uniforms', 'T-Shirts', 'Jackets', 'Pants', 'Accessories'].map((category) => (
            <Chip 
              key={category} 
              label={category} 
              variant="outlined" 
              clickable 
            />
          ))}
        </Box>
      </Box>

      {/* Products Grid */}
      <Typography variant="h6" gutterBottom>
        Featured Products
      </Typography>
      <Box sx={{ 
        display: 'grid', 
        gap: 3, 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        mb: 4 
      }}>
        {mockProducts.map((product) => (
          <Card key={product.id}>
            <CardMedia
              component="div"
              sx={{
                height: 200,
                backgroundColor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Product Image
              </Typography>
            </CardMedia>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {product.description}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip label={product.category} size="small" sx={{ mr: 1 }} />
                <Typography variant="body1" fontWeight="bold" color="primary">
                  {product.price}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Supplier:
                </Typography>
                <SimpleTecIdDisplay 
                  tecId={product.supplierTecId} 
                  variant="text" 
                  size="small" 
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" fullWidth>
                  View Details
                </Button>
                {user?.role === UserRole.BUYER && (
                  <Button size="small" variant="contained" fullWidth>
                    Create RFQ
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Footer Info */}
      <Box sx={{ 
        mt: 6, 
        p: 3, 
        backgroundColor: 'grey.50', 
        borderRadius: 2,
        textAlign: 'center' 
      }}>
        <Typography variant="h6" gutterBottom>
          Privacy-First B2B Trading
        </Typography>
        <Typography variant="body2" color="text.secondary">
          All transactions use our TecID system to protect personal information while enabling secure business relationships.
          Suppliers and buyers interact using anonymous TecIDs, ensuring complete privacy protection.
        </Typography>
      </Box>
    </Container>
  );
};