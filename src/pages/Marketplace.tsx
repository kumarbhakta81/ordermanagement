import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Paper,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search,
  FilterList,
  Store,
  RequestQuote,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { Product, ProductFilter, UserRole } from '../types';
import { TecIdDisplay } from '../common/TecIdDisplay';
import { TecIdUtils } from '../../utils/tecIdUtils';

export const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<ProductFilter>({
    isApproved: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const categories = [
    'Shirts',
    'Pants',
    'Dresses',
    'Jackets',
    'T-Shirts',
    'Uniforms',
    'Accessories',
    'Fabrics',
  ];

  useEffect(() => {
    loadProducts();
  }, [filters, pagination.page, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const searchFilters = {
        ...filters,
        ...(searchTerm && { search: searchTerm }),
      };
      
      const response = await apiService.getProducts(
        searchFilters,
        pagination.page,
        pagination.limit
      );
      
      setProducts(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      }));
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCreateRFQ = (product: Product) => {
    if (!user || user.role !== UserRole.BUYER) {
      navigate('/login');
      return;
    }
    navigate(`/buyer/rfqs/new?product=${product.tecId}`);
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.images[0] || '/placeholder-image.jpg'}
        alt={product.name}
        sx={{ cursor: 'pointer' }}
        onClick={() => setSelectedProduct(product)}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom noWrap>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {product.description.substring(0, 100)}...
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Chip label={product.category} size="small" sx={{ mr: 1 }} />
          {product.isSample && (
            <Chip label="Sample" size="small" color="secondary" />
          )}
        </Box>

        <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
          ${product.priceRange.min} - ${product.priceRange.max} {product.priceRange.currency}
        </Typography>
        
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
          MOQ: {product.minimumOrderQuantity} units
        </Typography>

        <Box sx={{ mb: 2 }}>
          <TecIdDisplay
            tecId={product.supplierTecId}
            variant="badge"
            size="small"
            color="primary"
            userType="Supplier"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setSelectedProduct(product)}
            startIcon={<Store />}
          >
            View Details
          </Button>
          {user?.role === UserRole.BUYER && (
            <Button
              size="small"
              variant="contained"
              onClick={() => handleCreateRFQ(product)}
              startIcon={<RequestQuote />}
            >
              Create RFQ
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Marketplace
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category || ''}
                label="Category"
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.isSample === undefined ? '' : filters.isSample ? 'sample' : 'product'}
                label="Type"
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('isSample', 
                    value === 'sample' ? true : value === 'product' ? false : undefined
                  );
                }}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="product">Products</MenuItem>
                <MenuItem value="sample">Samples</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setFilters({ isApproved: true });
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Grid */}
      {loading ? (
        <Typography>Loading products...</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>

          {products.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No products found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filters or search terms
              </Typography>
            </Box>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={(_, page) => setPagination(prev => ({ ...prev, page }))}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Product Detail Dialog */}
      <Dialog
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedProduct && (
          <>
            <DialogTitle>
              {selectedProduct.name}
              <Box sx={{ mt: 1 }}>
                <TecIdDisplay
                  tecId={selectedProduct.tecId}
                  variant="chip"
                  color="primary"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  {selectedProduct.images.length > 0 && (
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      style={{ width: '100%', borderRadius: 8 }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Product Details
                  </Typography>
                  <Typography paragraph>
                    {selectedProduct.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Price Range:</Typography>
                    <Typography variant="h6">
                      ${selectedProduct.priceRange.min} - ${selectedProduct.priceRange.max} {selectedProduct.priceRange.currency}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Minimum Order Quantity:</Typography>
                    <Typography>{selectedProduct.minimumOrderQuantity} units</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Supplier:</Typography>
                    <TecIdDisplay
                      tecId={selectedProduct.supplierTecId}
                      variant="chip"
                      userType="Supplier"
                    />
                  </Box>

                  {Object.keys(selectedProduct.specifications).length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Specifications:
                      </Typography>
                      {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                        <Chip
                          key={key}
                          label={`${key}: ${value}`}
                          variant="outlined"
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedProduct(null)}>
                Close
              </Button>
              {user?.role === UserRole.BUYER && (
                <Button
                  variant="contained"
                  onClick={() => {
                    handleCreateRFQ(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  startIcon={<RequestQuote />}
                >
                  Create RFQ
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};