import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Paper,
  Alert,
  Switch,
  FormControlLabel,
  ImageList,
  ImageListItem,
  IconButton,
} from '@mui/material';
import { Add, Delete, CloudUpload } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import { Product } from '../../types';

interface ProductFormProps {
  onSuccess: () => void;
  product?: Product;
}

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

const subcategories: Record<string, string[]> = {
  'Shirts': ['Dress Shirts', 'Casual Shirts', 'Polo Shirts'],
  'Pants': ['Formal Pants', 'Casual Pants', 'Jeans'],
  'Dresses': ['Formal Dresses', 'Casual Dresses', 'Evening Dresses'],
  'Jackets': ['Blazers', 'Casual Jackets', 'Winter Coats'],
  'T-Shirts': ['Basic T-Shirts', 'Graphic T-Shirts', 'Polo T-Shirts'],
  'Uniforms': ['School Uniforms', 'Corporate Uniforms', 'Medical Uniforms'],
  'Accessories': ['Ties', 'Belts', 'Scarves'],
  'Fabrics': ['Cotton', 'Silk', 'Polyester', 'Wool'],
};

export const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, product }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    subcategory: product?.subcategory || '',
    priceRange: {
      min: product?.priceRange?.min || 0,
      max: product?.priceRange?.max || 0,
      currency: product?.priceRange?.currency || 'USD',
    },
    minimumOrderQuantity: product?.minimumOrderQuantity || 1,
    isSample: product?.isSample || false,
    specifications: product?.specifications || {},
  });
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      setLoading(true);
      const uploadPromises = Array.from(files).map(file => apiService.uploadFile(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      setError('Failed to upload images');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addSpecification = () => {
    if (newSpecKey && newSpecValue) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey]: newSpecValue,
        },
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: Object.fromEntries(
        Object.entries(prev.specifications).filter(([k]) => k !== key)
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      
      const productData = {
        ...formData,
        images,
        supplierTecId: user!.tecId,
      };

      if (product) {
        await apiService.updateProduct(product.tecId, productData);
      } else {
        await apiService.createProduct(productData);
      }

      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Product Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={4}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              label="Category"
              onChange={(e) => {
                handleChange('category', e.target.value);
                handleChange('subcategory', ''); // Reset subcategory
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth required disabled={!formData.category}>
            <InputLabel>Subcategory</InputLabel>
            <Select
              value={formData.subcategory}
              label="Subcategory"
              onChange={(e) => handleChange('subcategory', e.target.value)}
            >
              {(subcategories[formData.category] || []).map((subcategory) => (
                <MenuItem key={subcategory} value={subcategory}>
                  {subcategory}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Minimum Price"
            type="number"
            value={formData.priceRange.min}
            onChange={(e) => handleChange('priceRange.min', Number(e.target.value))}
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Maximum Price"
            type="number"
            value={formData.priceRange.max}
            onChange={(e) => handleChange('priceRange.max', Number(e.target.value))}
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Minimum Order Quantity"
            type="number"
            value={formData.minimumOrderQuantity}
            onChange={(e) => handleChange('minimumOrderQuantity', Number(e.target.value))}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isSample}
                onChange={(e) => handleChange('isSample', e.target.checked)}
              />
            }
            label="This is a sample product"
          />
        </Grid>

        {/* Images Upload */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Product Images
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              disabled={loading}
            >
              Upload Images
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
          </Box>
          
          {images.length > 0 && (
            <ImageList sx={{ maxHeight: 200 }} cols={4} rowHeight={120}>
              {images.map((image, index) => (
                <ImageListItem key={index}>
                  <img src={image} alt={`Product ${index + 1}`} loading="lazy" />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      color: 'white',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                    }}
                    size="small"
                    onClick={() => removeImage(index)}
                  >
                    <Delete />
                  </IconButton>
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </Grid>

        {/* Specifications */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Specifications
          </Typography>
          
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Specification"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Value"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="outlined"
                  onClick={addSpecification}
                  disabled={!newSpecKey || !newSpecValue}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(formData.specifications).map(([key, value]) => (
              <Chip
                key={key}
                label={`${key}: ${value}`}
                onDelete={() => removeSpecification(key)}
                variant="outlined"
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};