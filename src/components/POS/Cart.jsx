import React from 'react'
import {
  Box,
  IconButton,
  Typography,
  Divider,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  Alert
} from '@mui/material'
import { Delete, Add, Remove, Person, Payment } from '@mui/icons-material'
import useCartStore from '../../stores/useCartStore'
import { formatCurrency } from '../../utils/formatters'
import PaymentDialog from './PaymentDialog'
import useNotificationStore from '../../stores/useNotificationStore'
import CustomerDialog from './CustomerDialog'
import useInventoryStore from '../../stores/useInventoryStore'

const Cart = () => {
  const {
    items,
    updateItemQuantity,
    removeItem,
    getCartTotals,
    customer,
    setCustomer,
    error
  } = useCartStore()

  const inventory = useInventoryStore()
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false)
  const [customerDialogOpen, setCustomerDialogOpen] = React.useState(false)
  const totals = getCartTotals()

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity > 0) {
      const product = inventory.products.find(p => p.id === item.id)
      if (product && newQuantity > product.stock) {
        useNotificationStore.getState().addNotification({
          type: 'error',
          message: `Only ${product.stock} units available in stock`
        })
        return
      }
      updateItemQuantity(item.id, newQuantity)
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>Cart</Typography>

      <Paper sx={{ flex: 1, mb: 2, overflow: 'auto', bgcolor: 'background.default' }}>
        {items.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography>Cart is empty</Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            {items.map(item => {
              const product = inventory.products.find(p => p.id === item.id)
              const isOutOfStock = product?.stock <= 0

              return (
                <Card 
                  key={item.id}
                  sx={{ 
                    mb: 2,
                    border: isOutOfStock ? '1px solid' : 'none',
                    borderColor: 'error.main'
                  }}
                >
                  <CardContent>
                    {isOutOfStock && (
                      <Alert severity="error" sx={{ mb: 1 }}>
                        Out of stock
                      </Alert>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatCurrency(item.price)} × {item.quantity}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                          size="small"
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        >
                          <Remove />
                        </IconButton>
                        <TextField
                          size="small"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 0)}
                          sx={{ width: '60px' }}
                          inputProps={{ 
                            style: { textAlign: 'center' },
                            min: 1,
                            max: product?.stock || 0
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          disabled={item.quantity >= (product?.stock || 0)}
                        >
                          <Add />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => removeItem(item.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )
            })}
          </Box>
        )}
      </Paper>

      <Box sx={{ mt: 'auto' }}>
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Subtotal</Typography>
            <Typography>{formatCurrency(totals.subtotal)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Tax ({totals.taxRate}%)</Typography>
            <Typography>{formatCurrency(totals.taxAmount)}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6">{formatCurrency(totals.total)}</Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => setCustomerDialogOpen(true)}
          disabled={items.length === 0}
          startIcon={<Person />}
          sx={{ mt: 2 }}
        >
          {customer ? `Selected: ${customer.name}` : 'Select Customer'}
        </Button>

        {customer && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={() => setPaymentDialogOpen(true)}
            disabled={items.length === 0}
            startIcon={<Payment />}
            sx={{ mt: 1 }}
          >
            Proceed to Payment
          </Button>
        )}

        <CustomerDialog
          open={customerDialogOpen}
          onClose={() => setCustomerDialogOpen(false)}
          onSelect={setCustomer}
        />

        <PaymentDialog
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          total={totals.total}
          customer={customer}
        />
      </Box>
    </Box>
  )
}

export default Cart