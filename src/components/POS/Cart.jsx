import React from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  TextField,
  Button,
  Dialog
} from '@mui/material'
import { Delete, Add, Remove } from '@mui/icons-material'
import useCartStore from '../../stores/useCartStore'
import { formatCurrency } from '../../utils/formatters'
import PaymentDialog from './PaymentDialog'

const Cart = () => {
  const { 
    items, 
    updateItemQuantity, 
    removeItem, 
    getCartTotals,
    completeTransaction 
  } = useCartStore()
  
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false)
  const totals = getCartTotals()

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity > 0) {
      updateItemQuantity(item.id, newQuantity)
    }
  }

  const handlePayment = async (paymentDetails) => {
    const success = await completeTransaction(paymentDetails)
    if (success) {
      setPaymentDialogOpen(false)
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Shopping Cart</Typography>
      
      <List>
        {items.map(item => (
          <ListItem
            key={item.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => removeItem(item.id)}>
                <Delete />
              </IconButton>
            }
          >
            <ListItemText
              primary={item.name}
              secondary={formatCurrency(item.price)}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
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
                sx={{ width: 60, mx: 1 }}
              />
              <IconButton
                size="small"
                onClick={() => handleQuantityChange(item, item.quantity + 1)}
              >
                <Add />
              </IconButton>
            </Box>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Typography variant="h6" gutterBottom>Total</Typography>
        <Typography variant="h6" gutterBottom>
          {formatCurrency(totals.total)}
        </Typography>
      </Box>
      
      <Button
        variant="contained"
        color="primary"
        onClick={() => setPaymentDialogOpen(true)}
        sx={{ mt: 2 }}
      >
        Pay
      </Button>
      
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        onPayment={handlePayment}
      />
    </Box>
  )
}

export default Cart 