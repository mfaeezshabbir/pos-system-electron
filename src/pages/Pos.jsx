import React from 'react'
import {
  Grid,
  Paper,
  Box,
  Button,
  Typography,
  Alert,
  Container
} from '@mui/material'
import { Person, ShoppingCart } from '@mui/icons-material'
import ProductGrid from '../components/POS/ProductGrid'
import Cart from '../components/POS/Cart'
import useCartStore from '../stores/useCartStore'
import Toast from '../components/common/Toast'
import CustomerDialog from '../components/POS/CustomerDialog'
import useNotificationStore from '../stores/useNotificationStore'
import useSettingsStore from '../stores/useSettingsStore'

const Pos = () => {
  const DEFAULT_WALK_IN_CUSTOMER = {
    id: 'walk-in',
    name: 'Walk-in Customer',
    phone: '',
    cnic: '',
    email: '',
    address: '',
    notes: '',
    transactions: []
  }

  const {
    items,
    addItem,
    removeItem,
    updateItemQuantity,
    customer,
    setCustomer,
    error
  } = useCartStore()

  const [customerDialogOpen, setCustomerDialogOpen] = React.useState(false)
  const { addNotification } = useNotificationStore()
  const { posSettings } = useSettingsStore()

  React.useEffect(() => {
    if (!customer && !posSettings.requireCustomer) {
      setCustomer(DEFAULT_WALK_IN_CUSTOMER)
    }
  }, [posSettings.requireCustomer])

  const handleWalkInCustomer = () => {
    setCustomer(DEFAULT_WALK_IN_CUSTOMER)
    addNotification({
      type: 'info',
      message: 'Proceeding with Walk-in Customer'
    })
  }

  const handleCustomerSelect = (selectedCustomer) => {
    setCustomer(selectedCustomer)
    setCustomerDialogOpen(false)
    addNotification({
      type: 'success',
      message: `Selected customer: ${selectedCustomer.name}`
    })
  }

  const handleProductSelect = (product) => {
    if (!customer && posSettings.requireCustomer) {
      addNotification({
        type: 'warning',
        message: 'Please select a customer first'
      })
      return
    }
    
    if (!posSettings.allowNegativeStock && product.stock <= 0) {
      addNotification({
        type: 'error',
        message: 'Product out of stock'
      })
      return
    }
    
    addItem(product)
  }

  const CustomerSelection = () => (
    <Container maxWidth="sm" sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h5" gutterBottom>
        Welcome to POS System
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Please select a customer to continue
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          startIcon={<Person />}
          onClick={() => setCustomerDialogOpen(true)}
          size="large"
        >
          Select Customer
        </Button>
        <Button
          variant="outlined"
          startIcon={<ShoppingCart />}
          onClick={handleWalkInCustomer}
          size="large"
        >
          Walk-in Customer
        </Button>
      </Box>
    </Container>
  )

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!customer ? (
        <CustomerSelection />
      ) : (
        <Grid container spacing={2} sx={{ height: '100%', p: 2 }}>
          <Grid item xs={8}>
            <Paper sx={{ height: '100%', overflow: 'hidden' }}>
              <ProductGrid
                onProductSelect={handleProductSelect}
                disabled={!customer}
              />
            </Paper>
          </Grid>

          <Grid item xs={4}>
            <Paper sx={{ height: '100%', overflow: 'hidden' }}>
              <Cart
                items={items}
                onUpdateQuantity={updateItemQuantity}
                onRemoveItem={removeItem}
              />
            </Paper>
          </Grid>
        </Grid>
      )}

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