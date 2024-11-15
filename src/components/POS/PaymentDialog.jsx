import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert
} from '@mui/material'
import { formatCurrency } from '../../utils/formatters'
import useCartStore from '../../stores/useCartStore'

const PaymentDialog = ({ open, onClose, total, customer }) => {
  const [paymentMethod, setPaymentMethod] = React.useState('cash')
  const [amountPaid, setAmountPaid] = React.useState('')
  const [error, setError] = React.useState('')
  const { completeTransaction } = useCartStore()

  React.useEffect(() => {
    if (open) {
      setAmountPaid('')
      setError('')
      setPaymentMethod('cash')
    }
  }, [open])

  const handleSubmit = async () => {
    try {
      if (paymentMethod === 'cash' && (!amountPaid || parseFloat(amountPaid) < total)) {
        setError('Amount paid must be greater than or equal to total')
        return
      }

      const paymentDetails = {
        method: paymentMethod,
        amountPaid: paymentMethod === 'cash' ? parseFloat(amountPaid) : total,
        change: paymentMethod === 'cash' ? Math.max(0, parseFloat(amountPaid) - total) : 0,
        total: total,
        status: 'completed'
      }

      const success = await completeTransaction(paymentDetails)
      if (success) {
        onClose()
      }
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Payment Details</Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Customer: {customer?.name || 'Walk-in Customer'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ my: 2 }}>
          <Typography variant="h5" gutterBottom>
            Total Amount: {formatCurrency(total)}
          </Typography>
        </Box>

        <FormControl fullWidth margin="normal">
          <InputLabel>Payment Method</InputLabel>
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="card">Card</MenuItem>
            <MenuItem value="mobile">Mobile Payment</MenuItem>
          </Select>
        </FormControl>

        {paymentMethod === 'cash' && (
          <TextField
            fullWidth
            label="Amount Paid"
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            margin="normal"
            error={!!error}
            helperText={error}
          />
        )}

        {paymentMethod === 'cash' && amountPaid && (
          <Box sx={{ mt: 2 }}>
            <Typography>
              Change: {formatCurrency(Math.max(0, parseFloat(amountPaid) - total))}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Complete Payment
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PaymentDialog 