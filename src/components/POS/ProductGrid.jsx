import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardMedia,
  Box,
  Chip
} from '@mui/material'
import useInventoryStore from '../../stores/useInventoryStore'
import { formatCurrency } from '../../utils/formatters'
import useCartStore from '../../stores/useCartStore'

const ProductGrid = ({ onProductSelect, disabled }) => {
  const { products, searchProducts } = useInventoryStore()
  const cartItems = useCartStore(state => state.items)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filteredProducts, setFilteredProducts] = React.useState(products)

  React.useEffect(() => {
    if (searchTerm) {
      setFilteredProducts(searchProducts(searchTerm))
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  const getCartQuantity = (productId) => {
    const cartItem = cartItems.find(item => item.id === productId)
    return cartItem?.quantity || 0
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {filteredProducts.map(product => {
          const cartQuantity = getCartQuantity(product.id)
          const remainingStock = product.stock - cartQuantity

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                onClick={() => !disabled && remainingStock > 0 && onProductSelect(product)}
                sx={{
                  cursor: disabled || remainingStock <= 0 ? 'not-allowed' : 'pointer',
                  opacity: disabled || remainingStock <= 0 ? 0.6 : 1,
                  '&:hover': (!disabled && remainingStock > 0) ? {
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s'
                  } : {}
                }}
              >
                {product.image && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={product.image}
                    alt={product.name}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" noWrap>{product.name}</Typography>
                  <Typography color="textSecondary">
                    {formatCurrency(product.price)}
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={`Stock: ${remainingStock}`}
                      color={remainingStock > 0 ? "success" : "error"}
                      size="small"
                    />
                    {cartQuantity > 0 && (
                      <Chip
                        label={`In Cart: ${cartQuantity}`}
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

export default ProductGrid