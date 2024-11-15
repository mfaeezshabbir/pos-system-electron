import React from 'react'
import {
  Grid,
  Paper,
  Box,
  Divider,
  Button,
  Typography
} from '@mui/material'
import { Person } from '@mui/icons-material'
import ProductGrid from '../components/POS/ProductGrid'
import Cart from '../components/POS/Cart'
import useCartStore from '../stores/useCartStore'
import Toast from '../components/common/Toast'
import CustomerDialog from '../components/POS/CustomerDialog'

const Pos = () => {
  const {
    items,
    addItem,
    removeItem,
    updateItemQuantity,
    customer,
    setCustomer
  } = useCartStore()

  const [customerDialogOpen, setCustomerDialogOpen] = React.useState(false)

  // Set walk-in customer
  const handleWalkInCustomer = () => {
    setCustomer({
      id: 'walk-in',
      name: 'Walk-in Customer',
      phone: '',
      creditLimit: 0
    })
  }

  // Handle customer selection
  const handleCustomerSelect = (selectedCustomer) => {
    setCustomer(selectedCustomer)
    setCustomerDialogOpen(false)
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)' }}>
      {!customer && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Please select a customer to continue
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Person />}
              onClick={() => setCustomerDialogOpen(true)}
            >
              Select Customer
            </Button>
            <Button
              variant="outlined"
              onClick={handleWalkInCustomer}
            >
              Walk-in Customer
            </Button>
          </Box>
        </Box>
      )}

      <Grid container spacing={2} sx={{ height: '100%', mt: customer ? 0 : 2 }}>
        {/* Product Grid */}
        <Grid item xs={8}>
          <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <ProductGrid
              onProductSelect={addItem}
              disabled={!customer}
            />
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

      <CustomerDialog
        open={customerDialogOpen}
        onClose={() => setCustomerDialogOpen(false)}
        onSelect={handleCustomerSelect}
      />

      <Toast />
    </Box>
  )
}

export default Pos 