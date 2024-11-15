import React from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  CardActions,
  Button
} from '@mui/material'
import {
  Search,
  Edit,
  Delete,
  Warning,
  ShoppingCart
} from '@mui/icons-material'
import { formatCurrency } from '../../utils/formatters'
import useSettingsStore from '../../stores/useSettingsStore'
import useCartStore from '../../stores/useCartStore'
import useAuthStore, { ROLES } from '../../stores/useAuthStore'

const ProductList = ({ products, onEdit, onDelete, userRole }) => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const lowStockThreshold = useSettingsStore(state => state.posSettings.lowStockThreshold)
  const addToCart = useCartStore(state => state.addItem)
  const { currentUser } = useAuthStore()

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const canEditProducts = userRole === ROLES.ADMIN || userRole === ROLES.MANAGER

  return (
    <Box>
      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {/* Product Grid */}
      <Grid container spacing={3}>
        {filteredProducts.map(product => {
          const isLowStock = product.stock <= lowStockThreshold

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[8]
                  },
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                {/* Stock Status Badge */}
                {isLowStock && (
                  <Chip
                    label={product.stock === 0 ? "Out of Stock" : "Low Stock"}
                    color={product.stock === 0 ? "error" : "warning"}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      fontWeight: 500,
                      '& .MuiChip-label': {
                        px: 1,
                        fontSize: '0.75rem'
                      }
                    }}
                  />
                )}

                <CardMedia
                  component="img"
                  height="120"
                  image={product.image || '/placeholder-product.png'}
                  alt={product.name}
                  sx={{
                    objectFit: 'contain',
                    p: 1,
                    bgcolor: (theme) => theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
                  }}
                />

                <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                  <Typography
                    variant="subtitle1"
                    noWrap
                    title={product.name}
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      fontSize: '0.875rem'
                    }}
                  >
                    {product.name}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: 'block' }}
                  >
                    SKU: {product.sku}
                  </Typography>

                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1
                  }}>
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    >
                      {formatCurrency(product.price)}
                    </Typography>
                    <Chip
                      label={product.category}
                      size="small"
                      color="default"
                      variant="outlined"
                      sx={{
                        borderRadius: 1,
                        '& .MuiChip-label': {
                          px: 1,
                          fontSize: '0.75rem'
                        }
                      }}
                    />
                  </Box>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 500 }}
                    >
                      Stock: {product.stock}
                    </Typography>
                    {isLowStock && (
                      <Tooltip title="Low Stock">
                        <Warning color="warning" sx={{ fontSize: '1rem' }} />
                      </Tooltip>
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{
                  justifyContent: 'space-between',
                  px: 1.5,
                  pb: 1.5,
                  pt: 0
                }}>
                  <Box>
                    {canEditProducts && (
                      <>
                        <IconButton size="small" onClick={() => onEdit(product)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => onDelete(product.id)}>
                          <Delete />
                        </IconButton>
                      </>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ShoppingCart sx={{ fontSize: '1rem' }} />}
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    sx={{
                      borderRadius: 1,
                      textTransform: 'none',
                      px: 1,
                      py: 0.5,
                      fontSize: '0.75rem'
                    }}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box >
  )
}

export default ProductList 