import React from 'react'
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
  CardActions
} from '@mui/material'
import { Edit, Delete, Warning } from '@mui/icons-material'
import { formatCurrency } from '../../utils/formatters'
import useSettingsStore from '../../stores/useSettingsStore'

const ProductCard = ({ product, onEdit, onDelete }) => {
  const lowStockThreshold = useSettingsStore(state => state.posSettings.lowStockThreshold)
  const isLowStock = product.stock <= lowStockThreshold

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.image || '/placeholder-product.png'}
        alt={product.name}
        sx={{ objectFit: 'contain', p: 2, bgcolor: 'grey.50' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" noWrap title={product.name}>
          {product.name}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          SKU: {product.sku}
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="primary">
            {formatCurrency(product.price)}
          </Typography>
          <Chip 
            label={product.category} 
            size="small" 
            color="default"
          />
        </Box>

        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">
            Stock: {product.stock}
          </Typography>
          {isLowStock && (
            <Tooltip title="Low Stock">
              <Warning color="warning" fontSize="small" />
            </Tooltip>
          )}
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        <IconButton size="small" onClick={() => onEdit(product)}>
          <Edit />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => onDelete(product.id)}>
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  )
}

export default ProductCard 