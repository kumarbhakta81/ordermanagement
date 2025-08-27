import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  TextField,
  MenuItem,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search,
  Send,
  Visibility,
  Clear,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Product, SearchFilters } from '../types';

const CatalogPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    approvedOnly: true,
    samplesOnly: false,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rfqDialogOpen, setRfqDialogOpen] = useState(false);
  const [rfqQuantity, setRfqQuantity] = useState<number>(100);
  const [rfqTargetPrice, setRfqTargetPrice] = useState<number>(0);
  const [rfqRequirements, setRfqRequirements] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiService.getProducts(filters);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const searchFilters = {
      ...filters,
      searchTerm: searchTerm.trim() || undefined,
    };
    setFilters(searchFilters);
  };

  const handleSendRFQ = (product: Product) => {
    setSelectedProduct(product);
    setRfqTargetPrice(product.price * 0.9); // Start with 10% discount
    setRfqDialogOpen(true);
  };

  const handleSubmitRFQ = async () => {
    if (!selectedProduct || !user) return;

    try {
      await apiService.createRFQ({
        buyerTecId: user.tecId,
        supplierTecId: selectedProduct.supplierTecId,
        productId: selectedProduct.id,
        quantity: rfqQuantity,
        targetPrice: rfqTargetPrice,
        requirements: rfqRequirements,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });

      setRfqDialogOpen(false);
      setSelectedProduct(null);
      setRfqQuantity(100);
      setRfqTargetPrice(0);
      setRfqRequirements('');
      
      // Show success message (you could add a snackbar here)
      alert('RFQ sent successfully!');
    } catch (error) {
      console.error('Error sending RFQ:', error);
      alert('Failed to send RFQ. Please try again.');
    }
  };

  const categories = ['All', 'Apparel', 'Accessories', 'Uniforms', 'Safety Gear'];
  const subcategories = ['All', 'T-Shirts', 'Polos', 'Jackets', 'Pants', 'Hats', 'Bags'];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Product Catalog
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Browse and discover products from verified suppliers
      </Typography>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" gap={2} sx={{ flexWrap: 'wrap' }}>
              <TextField
                sx={{ minWidth: 200 }}
                label="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleSearch}>
                      <Search />
                    </IconButton>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category || 'All'}
                  label="Category"
                  onChange={(e) => setFilters({ ...filters, category: e.target.value === 'All' ? undefined : e.target.value })}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={filters.subcategory || 'All'}
                  label="Subcategory"
                  onChange={(e) => setFilters({ ...filters, subcategory: e.target.value === 'All' ? undefined : e.target.value })}
                >
                  {subcategories.map((sub) => (
                    <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                sx={{ width: 100 }}
                label="Min Price"
                type="number"
                value={filters.priceRange?.min || ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  priceRange: { 
                    ...filters.priceRange, 
                    min: parseFloat(e.target.value) || 0,
                    max: filters.priceRange?.max || 1000
                  }
                })}
              />
              <TextField
                sx={{ width: 100 }}
                label="Max Price"
                type="number"
                value={filters.priceRange?.max || ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  priceRange: { 
                    min: filters.priceRange?.min || 0,
                    max: parseFloat(e.target.value) || 1000
                  }
                })}
              />
            </Box>
        
        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
          <Chip 
            label="Approved Only" 
            variant={filters.approvedOnly ? "filled" : "outlined"}
            onClick={() => setFilters({ ...filters, approvedOnly: !filters.approvedOnly })}
          />
          <Chip 
            label="Samples Only" 
            variant={filters.samplesOnly ? "filled" : "outlined"}
            onClick={() => setFilters({ ...filters, samplesOnly: !filters.samplesOnly })}
          />
          <Chip 
            label="Customizable" 
            variant={filters.customizable ? "filled" : "outlined"}
            onClick={() => setFilters({ ...filters, customizable: !filters.customizable })}
          />
          <Button 
            startIcon={<Clear />} 
            onClick={() => setFilters({ approvedOnly: true, samplesOnly: false })}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Products Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <Typography>Loading products...</Typography>
        </Box>
      ) : (
        <Box display="flex" gap={2} sx={{ flexWrap: 'wrap' }}>
          {products.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', width: '100%' }}>
              <Typography variant="h6" color="textSecondary">
                No products found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Try adjusting your search criteria
              </Typography>
            </Paper>
          ) : (
            products.map((product) => (
              <Card key={product.id} sx={{ width: 300, display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height={200}
                  image={product.images[0] || '/api/placeholder/300/200'}
                  alt={product.name}
                />
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" noWrap gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {product.category} • {product.subcategory}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, height: 40, overflow: 'hidden' }}>
                    {product.description}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    ${product.price}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Min Quantity: {product.minQuantity}
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                    <Chip 
                      label={product.isApproved ? 'Approved' : 'Pending'} 
                      size="small"
                      color={product.isApproved ? 'success' : 'warning'}
                    />
                    {product.customizable && (
                      <Chip label="Customizable" size="small" color="info" />
                    )}
                    {product.isSample && (
                      <Chip label="Sample" size="small" color="secondary" />
                    )}
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Supplier: {product.supplierTecId}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/catalog/${product.id}`)}
                  >
                    View Details
                  </Button>
                  {user?.role === 'buyer' && (
                    <Button 
                      size="small" 
                      variant="contained"
                      startIcon={<Send />}
                      onClick={() => handleSendRFQ(product)}
                    >
                      Send RFQ
                    </Button>
                  )}
                </CardActions>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* RFQ Dialog */}
      <Dialog open={rfqDialogOpen} onClose={() => setRfqDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send RFQ for {selectedProduct?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={rfqQuantity}
              onChange={(e) => setRfqQuantity(parseInt(e.target.value) || 0)}
              sx={{ mb: 2 }}
              inputProps={{ min: selectedProduct?.minQuantity || 1 }}
            />
            <TextField
              fullWidth
              label="Target Price per Unit"
              type="number"
              value={rfqTargetPrice}
              onChange={(e) => setRfqTargetPrice(parseFloat(e.target.value) || 0)}
              sx={{ mb: 2 }}
              inputProps={{ step: 0.01, min: 0 }}
            />
            <TextField
              fullWidth
              label="Special Requirements"
              multiline
              rows={4}
              value={rfqRequirements}
              onChange={(e) => setRfqRequirements(e.target.value)}
              placeholder="Describe any special requirements, customizations, or notes..."
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Total Estimated Cost: ${(rfqQuantity * rfqTargetPrice).toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRfqDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitRFQ}
            disabled={!rfqQuantity || !rfqTargetPrice}
          >
            Send RFQ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CatalogPage;