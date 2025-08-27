import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Upload,
  Preview,
  Save,
  Send,
  ColorLens,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Product, CustomizationOption, Customization } from '../types';

const CustomizationStudioPage: React.FC = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customizableProducts, setCustomizableProducts] = useState<Product[]>([]);
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [quantity, setQuantity] = useState(100);
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    fetchCustomizableProducts();
  }, []);

  const fetchCustomizableProducts = async () => {
    try {
      const products = await apiService.getProducts({ customizable: true, approvedOnly: true });
      setCustomizableProducts(products);
    } catch (error) {
      console.error('Error fetching customizable products:', error);
    }
  };

  // Mock customization options for demo
  const customizationOptions: CustomizationOption[] = [
    {
      id: 'logo',
      name: 'Company Logo',
      type: 'image',
      required: false,
      description: 'Upload your company logo for embroidery or printing'
    },
    {
      id: 'text',
      name: 'Custom Text',
      type: 'text',
      required: false,
      description: 'Add custom text like company name or employee names'
    },
    {
      id: 'color',
      name: 'Primary Color',
      type: 'color',
      options: ['Red', 'Blue', 'Green', 'Black', 'White', 'Navy', 'Gray'],
      required: true,
      description: 'Choose the primary color for your uniforms'
    },
    {
      id: 'size',
      name: 'Size Distribution',
      type: 'select',
      options: ['S', 'M', 'L', 'XL', 'XXL'],
      required: true,
      description: 'Specify size distribution for your order'
    },
    {
      id: 'placement',
      name: 'Logo Placement',
      type: 'select',
      options: ['Left Chest', 'Right Chest', 'Center Chest', 'Back', 'Sleeve'],
      required: false,
      description: 'Where to place your logo on the garment'
    }
  ];

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setActiveStep(1);
  };

  const handleCustomizationChange = (optionId: string, value: any) => {
    const existing = customizations.find(c => c.optionId === optionId);
    if (existing) {
      setCustomizations(customizations.map(c => 
        c.optionId === optionId ? { ...c, value } : c
      ));
    } else {
      setCustomizations([...customizations, { optionId, value }]);
    }
  };

  const getCustomizationValue = (optionId: string) => {
    return customizations.find(c => c.optionId === optionId)?.value || '';
  };

  const calculateEstimatedCost = () => {
    if (!selectedProduct) return 0;
    
    let baseCost = selectedProduct.price * quantity;
    let customizationCost = 0;
    
    // Add customization costs (mock calculation)
    customizations.forEach(custom => {
      const option = customizationOptions.find(opt => opt.id === custom.optionId);
      if (option) {
        switch (option.type) {
          case 'image':
            customizationCost += quantity * 2.50; // $2.50 per item for logo
            break;
          case 'text':
            customizationCost += quantity * 1.00; // $1.00 per item for text
            break;
          case 'color':
            if (custom.value !== 'Standard') {
              customizationCost += quantity * 0.50; // $0.50 per item for custom color
            }
            break;
        }
      }
    });
    
    return baseCost + customizationCost;
  };

  const handleSubmitOrder = async () => {
    if (!selectedProduct || !user) return;

    try {
      // Create an RFQ with customization details
      await apiService.createRFQ({
        buyerTecId: user.tecId,
        supplierTecId: selectedProduct.supplierTecId,
        productId: selectedProduct.id,
        quantity,
        targetPrice: selectedProduct.price,
        requirements: `Custom uniform order: ${projectName}\n\nCustomizations:\n${customizations.map(c => {
          const option = customizationOptions.find(opt => opt.id === c.optionId);
          return `- ${option?.name}: ${c.value}`;
        }).join('\n')}`,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      alert('Custom order request submitted successfully!');
      
      // Reset form
      setActiveStep(0);
      setSelectedProduct(null);
      setCustomizations([]);
      setProjectName('');
      setQuantity(100);
    } catch (error) {
      console.error('Error submitting custom order:', error);
      alert('Failed to submit order. Please try again.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Uniform Customization Studio
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Design custom uniforms with your company branding and specifications
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Select Product */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Select Base Product</Typography>
            </StepLabel>
            <StepContent>
              <Typography gutterBottom>
                Choose a customizable product as the base for your uniform design
              </Typography>
              <Box display="flex" gap={2} sx={{ flexWrap: 'wrap', mt: 1 }}>
                {customizableProducts.map((product) => (
                  <Card 
                    key={product.id}
                    sx={{ 
                      width: 250,
                      cursor: 'pointer',
                      border: selectedProduct?.id === product.id ? 2 : 0,
                      borderColor: 'primary.main'
                    }}
                    onClick={() => handleProductSelect(product)}
                  >
                    <CardMedia
                      component="img"
                      height={150}
                      image={product.images[0] || '/api/placeholder/300/150'}
                      alt={product.name}
                    />
                    <CardContent>
                      <Typography variant="h6" noWrap>{product.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {product.category} • ${product.price}
                      </Typography>
                      <Chip label="Customizable" size="small" color="primary" sx={{ mt: 1 }} />
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Customize Design */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Customize Design</Typography>
            </StepLabel>
            <StepContent>
              <Typography gutterBottom>
                Configure your custom design options
              </Typography>
              
              <TextField
                fullWidth
                label="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="e.g., Spring 2024 Uniforms"
              />

              <Box display="flex" gap={2} sx={{ flexWrap: 'wrap' }}>
                {customizationOptions.map((option) => (
                  <Paper key={option.id} sx={{ p: 2, minWidth: 250, flex: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {option.name}
                      {option.required && <Chip label="Required" size="small" color="error" sx={{ ml: 1 }} />}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {option.description}
                    </Typography>
                    
                    {option.type === 'text' && (
                      <TextField
                        fullWidth
                        value={getCustomizationValue(option.id)}
                        onChange={(e) => handleCustomizationChange(option.id, e.target.value)}
                        placeholder="Enter custom text"
                      />
                    )}
                    
                    {option.type === 'select' && (
                      <FormControl fullWidth>
                        <Select
                          value={getCustomizationValue(option.id)}
                          onChange={(e) => handleCustomizationChange(option.id, e.target.value)}
                        >
                          {option.options?.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    
                    {option.type === 'color' && (
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {option.options?.map((color) => (
                          <Chip
                            key={color}
                            label={color}
                            variant={getCustomizationValue(option.id) === color ? "filled" : "outlined"}
                            onClick={() => handleCustomizationChange(option.id, color)}
                            icon={<ColorLens />}
                          />
                        ))}
                      </Box>
                    )}
                    
                    {option.type === 'image' && (
                      <Box>
                        <Button
                          variant="outlined"
                          startIcon={<Upload />}
                          fullWidth
                          onClick={() => {
                            // Mock file upload
                            handleCustomizationChange(option.id, 'logo-uploaded.png');
                          }}
                        >
                          Upload Image
                        </Button>
                        {getCustomizationValue(option.id) && (
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Uploaded: {getCustomizationValue(option.id)}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>

              <Box mt={2}>
                <Button 
                  variant="contained" 
                  onClick={() => setActiveStep(2)}
                  disabled={customizationOptions.filter(opt => opt.required).some(opt => !getCustomizationValue(opt.id))}
                >
                  Continue to Preview
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Review & Preview */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Review & Preview</Typography>
            </StepLabel>
            <StepContent>
              <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
                <Paper sx={{ p: 2, flex: 2 }}>
                  <Typography variant="h6" gutterBottom>Order Summary</Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Product:</strong> {selectedProduct?.name}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Project:</strong> {projectName}
                  </Typography>
                  
                  <TextField
                    label="Quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    sx={{ mb: 2, width: 200 }}
                    inputProps={{ min: selectedProduct?.minQuantity || 1 }}
                  />

                  <Typography variant="h6" gutterBottom>Customizations:</Typography>
                  <List>
                    {customizations.map((custom) => {
                      const option = customizationOptions.find(opt => opt.id === custom.optionId);
                      return (
                        <ListItem key={custom.optionId}>
                          <ListItemText
                            primary={option?.name}
                            secondary={custom.value}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
                <Paper sx={{ p: 2, flex: 1 }}>
                  <Typography variant="h6" gutterBottom>Cost Estimate</Typography>
                  <Typography variant="body1">
                    Base Cost: ${(selectedProduct?.price || 0) * quantity}
                  </Typography>
                  <Typography variant="body1">
                    Customization: ${calculateEstimatedCost() - (selectedProduct?.price || 0) * quantity}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6">
                    Total: ${calculateEstimatedCost()}
                  </Typography>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Preview />}
                    onClick={() => setPreviewOpen(true)}
                    sx={{ mt: 2 }}
                  >
                    3D Preview
                  </Button>
                </Paper>
              </Box>

              <Box mt={2}>
                <Button 
                  variant="contained" 
                  onClick={() => setActiveStep(3)}
                  sx={{ mr: 1 }}
                >
                  Continue to Submit
                </Button>
                <Button onClick={() => setActiveStep(1)}>
                  Back to Customize
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 4: Submit Order */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Submit Custom Order</Typography>
            </StepLabel>
            <StepContent>
              <Typography gutterBottom>
                Review your custom uniform design and submit your order request to the supplier.
              </Typography>
              
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.light' }}>
                <Typography variant="body2">
                  <strong>Note:</strong> This will send an RFQ (Request for Quotation) to the supplier with your 
                  custom specifications. The supplier will review your requirements and provide a detailed 
                  quote including production timeline and final pricing.
                </Typography>
              </Paper>

              <Box display="flex" gap={2}>
                <Button 
                  variant="contained" 
                  startIcon={<Send />}
                  onClick={handleSubmitOrder}
                  size="large"
                >
                  Submit Custom Order Request
                </Button>
                <Button 
                  startIcon={<Save />}
                  onClick={() => alert('Design saved as draft!')}
                >
                  Save as Draft
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </Paper>

      {/* 3D Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>3D Preview</DialogTitle>
        <DialogContent>
          <Box 
            sx={{ 
              height: 400, 
              bgcolor: 'grey.100', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: 1
            }}
          >
            <Typography variant="h6" color="textSecondary">
              3D Preview Coming Soon
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Interactive 3D preview will show your customized uniform with all selected options applied.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomizationStudioPage;