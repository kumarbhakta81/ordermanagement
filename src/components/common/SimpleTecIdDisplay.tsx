import React from 'react';
import { Chip, Typography, Box } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';

interface SimpleTecIdDisplayProps {
  tecId: string;
  variant?: 'chip' | 'text';
  size?: 'small' | 'medium';
  showCopy?: boolean;
}

export const SimpleTecIdDisplay: React.FC<SimpleTecIdDisplayProps> = ({
  tecId,
  variant = 'chip',
  size = 'medium',
  showCopy = true,
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tecId);
    } catch (err) {
      console.error('Failed to copy TecID:', err);
    }
  };

  if (variant === 'text') {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <Typography
          variant={size === 'small' ? 'caption' : 'body2'}
          component="span"
          sx={{ 
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: 'primary.main',
          }}
        >
          {tecId}
        </Typography>
        {showCopy && (
          <ContentCopy 
            sx={{ fontSize: 14, cursor: 'pointer' }} 
            onClick={handleCopy}
          />
        )}
      </Box>
    );
  }

  return (
    <Chip
      label={tecId}
      size={size}
      color="primary"
      variant="outlined"
      onDelete={showCopy ? handleCopy : undefined}
      deleteIcon={showCopy ? <ContentCopy /> : undefined}
    />
  );
};