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

const ProductGrid = ({ onProductSelect }) => {
  const { products, searchProducts } = useInventoryStore()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filteredProducts, setFilteredProducts] = React.useState(products)

  React.useEffect(() => {
    if (searchTerm) {
      setFilteredProducts(searchProducts(searchTerm))
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  return (
    <Box>
      <Grid container spacing={2}>
        {filteredProducts.map(product => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card 
              onClick={() => onProductSelect(product)}
              sx={{ 
                cursor: 'pointer',
                '&:hover': { transform: 'scale(1.02)' },
                transition: 'transform 0.2s'
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
                <Typography color="textSecondary" gutterBottom>
                  {formatCurrency(product.price)}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Chip 
                    label={product.category} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Stock: ${product.stock}`}
                    size="small"
                    color={product.stock > 10 ? "success" : "error"}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default ProductGrid 