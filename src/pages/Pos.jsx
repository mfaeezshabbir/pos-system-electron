import React from 'react'
import { 
  Grid, 
  Paper,
  Box,
  Divider
} from '@mui/material'
import ProductGrid from '../components/POS/ProductGrid'
import Cart from '../components/POS/Cart'
import useCartStore from '../stores/useCartStore'

const Pos = () => {
  const { items, addItem, removeItem, updateItemQuantity } = useCartStore()

  return (
    <Box sx={{ height: 'calc(100vh - 64px)' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Product Grid */}
        <Grid item xs={8}>
          <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <ProductGrid onProductSelect={addItem} />
          </Paper>
        </Grid>

        {/* Cart */}
        <Grid item xs={4}>
          <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Cart
              items={items}
              onUpdateQuantity={updateItemQuantity}
              onRemoveItem={removeItem}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Pos 