import React from 'react';
import { Box, Chip, Typography, Tooltip, IconButton } from '@mui/material';
import { ContentCopy, Verified } from '@mui/icons-material';
import { TecIdUtils } from '../../utils/tecIdUtils';

interface TecIdDisplayProps {
  tecId: string;
  variant?: 'chip' | 'text' | 'badge';
  size?: 'small' | 'medium';
  showCopy?: boolean;
  verified?: boolean;
  prefix?: string;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export const TecIdDisplay: React.FC<TecIdDisplayProps> = ({
  tecId,
  variant = 'chip',
  size = 'medium',
  showCopy = true,
  verified = false,
  prefix,
  color = 'primary',
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tecId);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy TecID:', err);
    }
  };

  const formatTecId = (id: string) => {
    return prefix ? `${prefix} ${TecIdUtils.formatTecIdDisplay(id)}` : TecIdUtils.formatTecIdDisplay(id);
  };

  const entityType = TecIdUtils.getEntityTypeFromTecId(tecId);
  const tooltipTitle = `TecID: ${tecId}${entityType ? ` (${entityType})` : ''}`;

  switch (variant) {
    case 'chip':
      return (
        <Tooltip title={tooltipTitle}>
          <Chip
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {formatTecId(tecId)}
                {verified && <Verified sx={{ fontSize: 16 }} />}
                {showCopy && (
                  <IconButton
                    size="small"
                    onClick={handleCopy}
                    sx={{ ml: 0.5, p: 0.25 }}
                  >
                    <ContentCopy sx={{ fontSize: 12 }} />
                  </IconButton>
                )}
              </Box>
            }
            size={size}
            color={color}
            variant="outlined"
          />
        </Tooltip>
      );

    case 'text':
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={tooltipTitle}>
            <Typography
              variant={size === 'small' ? 'caption' : 'body2'}
              component="span"
              sx={{ 
                fontFamily: 'monospace',
                fontWeight: 'bold',
                color: `${color}.main`,
              }}
            >
              {formatTecId(tecId)}
            </Typography>
          </Tooltip>
          {verified && (
            <Verified 
              sx={{ 
                fontSize: size === 'small' ? 14 : 16,
                color: 'success.main' 
              }} 
            />
          )}
          {showCopy && (
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{ p: 0.25 }}
            >
              <ContentCopy sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>
      );

    case 'badge':
      return (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: `${color}.50`,
            border: 1,
            borderColor: `${color}.200`,
            borderRadius: 1,
            px: 1,
            py: 0.5,
          }}
        >
          <Tooltip title={tooltipTitle}>
            <Typography
              variant="caption"
              sx={{ 
                fontFamily: 'monospace',
                fontWeight: 'bold',
                color: `${color}.800`,
              }}
            >
              {formatTecId(tecId)}
            </Typography>
          </Tooltip>
          {verified && (
            <Verified sx={{ fontSize: 14, color: 'success.main' }} />
          )}
          {showCopy && (
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{ p: 0.25 }}
            >
              <ContentCopy sx={{ fontSize: 12 }} />
            </IconButton>
          )}
        </Box>
      );

    default:
      return null;
  }
};

// Specialized components for different entity types
export const UserTecId: React.FC<Omit<TecIdDisplayProps, 'prefix'> & { userType?: string }> = ({
  userType,
  ...props
}) => (
  <TecIdDisplay {...props} prefix={userType} />
);

export const ProductTecId: React.FC<Omit<TecIdDisplayProps, 'prefix'>> = (props) => (
  <TecIdDisplay {...props} prefix="Product" />
);

export const RFQTecId: React.FC<Omit<TecIdDisplayProps, 'prefix'>> = (props) => (
  <TecIdDisplay {...props} prefix="RFQ" />
);

export const OrderTecId: React.FC<Omit<TecIdDisplayProps, 'prefix'>> = (props) => (
  <TecIdDisplay {...props} prefix="Order" />
);