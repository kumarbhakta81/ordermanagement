import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  Search as SearchIcon,
  FilterList,
  Clear,
  Inventory,
  Business,
  Category,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { Product, SearchFilters } from '../types';

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    approvedOnly: true,
    priceRange: { min: 0, max: 1000 },
  });
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  
  // Advanced filter options
  const categories = ['Apparel', 'Accessories', 'Uniforms', 'Safety Gear', 'Footwear'];
  const materials = ['Cotton', 'Polyester', 'Blend', 'Leather', 'Denim', 'Canvas'];
  const colors = ['White', 'Black', 'Navy', 'Gray', 'Red', 'Blue', 'Green'];

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchFilters = {
        ...filters,
        searchTerm: searchTerm.trim() || undefined,
        priceRange: {
          min: priceRange[0],
          max: priceRange[1],
        },
      };
      const data = await apiService.getProducts(searchFilters);
      setProducts(data);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm || Object.keys(filters).length > 2) {
      performSearch();
    }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    performSearch();
  };

  const handleClearFilters = () => {
    setFilters({ approvedOnly: true, priceRange: { min: 0, max: 1000 } });
    setPriceRange([0, 1000]);
    setSearchTerm('');
    setProducts([]);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const categories = filters.category ? filters.category.split(',') : [];
    if (checked) {
      categories.push(category);
    } else {
      const index = categories.indexOf(category);
      if (index > -1) categories.splice(index, 1);
    }
    setFilters({
      ...filters,
      category: categories.length > 0 ? categories.join(',') : undefined,
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Advanced Search
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Find exactly what you're looking for with powerful search and filtering tools
      </Typography>

      <Box display="flex" gap={3} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Search and Filters Panel */}
        <Box sx={{ width: { xs: '100%', md: '300px' } }}>
          <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
            {/* Search Bar */}
            <TextField
              fullWidth
              label="Search products, categories, suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <SearchIcon sx={{ cursor: 'pointer' }} onClick={handleSearch} />
                ),
              }}
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{ mb: 2 }}
            >
              Search
            </Button>

            <Divider sx={{ mb: 2 }} />

            {/* Price Range */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Price Range</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography gutterBottom>
                  ${priceRange[0]} - ${priceRange[1]}
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(_, value) => setPriceRange(value as number[])}
                  onChangeCommitted={() => setFilters({
                    ...filters,
                    priceRange: { min: priceRange[0], max: priceRange[1] }
                  })}
                  valueLabelDisplay="auto"
                  min={0}
                  max={1000}
                  step={10}
                />
              </AccordionDetails>
            </Accordion>

            {/* Categories */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Categories</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {categories.map((category) => (
                    <FormControlLabel
                      key={category}
                      control={
                        <Checkbox
                          checked={filters.category?.includes(category) || false}
                          onChange={(e) => handleCategoryChange(category, e.target.checked)}
                        />
                      }
                      label={category}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* Product Features */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Product Features</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.customizable || false}
                        onChange={(e) => setFilters({ ...filters, customizable: e.target.checked })}
                      />
                    }
                    label="Customizable"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.samplesOnly || false}
                        onChange={(e) => setFilters({ ...filters, samplesOnly: e.target.checked })}
                      />
                    }
                    label="Samples Available"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.approvedOnly || false}
                        onChange={(e) => setFilters({ ...filters, approvedOnly: e.target.checked })}
                      />
                    }
                    label="Approved Products Only"
                  />
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* Material Types */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Materials</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {materials.map((material) => (
                    <Chip
                      key={material}
                      label={material}
                      variant="outlined"
                      size="small"
                      clickable
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Colors */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Colors</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {colors.map((color) => (
                    <Chip
                      key={color}
                      label={color}
                      variant="outlined"
                      size="small"
                      clickable
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>

            <Button
              fullWidth
              startIcon={<Clear />}
              onClick={handleClearFilters}
              sx={{ mt: 2 }}
            >
              Clear All Filters
            </Button>
          </Paper>
        </Box>

        {/* Search Results */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Search Results {products.length > 0 && `(${products.length} found)`}
              </Typography>
              <Chip icon={<FilterList />} label="Advanced Filters Active" variant="outlined" />
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <Typography>Searching...</Typography>
              </Box>
            ) : products.length === 0 ? (
              <Box textAlign="center" py={8}>
                <SearchIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  {searchTerm ? 'No products found' : 'Start your search'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {searchTerm 
                    ? 'Try adjusting your search terms or filters'
                    : 'Enter keywords or use filters to find products'
                  }
                </Typography>
              </Box>
            ) : (
              <List>
                {products.map((product, index) => (
                  <React.Fragment key={product.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon>
                        <Inventory color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="start">
                            <Typography variant="h6">{product.name}</Typography>
                            <Typography variant="h6" color="primary">
                              ${product.price}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              {product.description}
                            </Typography>
                            <Box display="flex" gap={1} mb={1}>
                              <Chip 
                                icon={<Category />}
                                label={`${product.category} • ${product.subcategory}`}
                                size="small" 
                                variant="outlined" 
                              />
                              <Chip 
                                icon={<Business />}
                                label={product.supplierTecId}
                                size="small" 
                                variant="outlined" 
                              />
                              {product.customizable && (
                                <Chip label="Customizable" size="small" color="info" />
                              )}
                              {product.isApproved && (
                                <Chip label="Approved" size="small" color="success" />
                              )}
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              Min Quantity: {product.minQuantity} units
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < products.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default SearchPage;