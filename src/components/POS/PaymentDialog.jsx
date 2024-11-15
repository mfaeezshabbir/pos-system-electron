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
import CustomerDialog from './CustomerDialog'

const PaymentDialog = ({ open, onClose, onPayment, total, customer }) => {
  const [paymentMethod, setPaymentMethod] = React.useState('cash')
  const [amountPaid, setAmountPaid] = React.useState('')
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (open) {
      setAmountPaid('')
      setError('')
      setPaymentMethod('cash')
    }
  }, [open])

  const handleSubmit = () => {
    if (!customer) {
      setError('Please select a customer first')
      return
    }

    if (paymentMethod === 'khata' && customer.currentCredit + total > customer.creditLimit) {
      setError('Credit limit exceeded')
      return
    }

    if (paymentMethod === 'cash' && (!amountPaid || parseFloat(amountPaid) < total)) {
      setError('Amount paid must be greater than or equal to total')
      return
    }

    onPayment({
      method: paymentMethod,
      amountPaid: paymentMethod === 'cash' ? parseFloat(amountPaid) : 0,
      change: paymentMethod === 'cash' ? (parseFloat(amountPaid) - total) : 0,
      total: total,
      status: paymentMethod === 'khata' ? 'pending' : 'completed'
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Payment - {customer?.name}</DialogTitle>
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
            <MenuItem value="khata">Khata (Loan)</MenuItem>
          </Select>
        </FormControl>

        {paymentMethod === 'khata' && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            {customer ? (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Customer: {customer.name}
                </Typography>
                <Typography variant="body2">
                  Current Balance: {formatCurrency(customer.currentCredit)}
                </Typography>
                <Typography variant="body2" color={
                  customer.currentCredit + total > customer.creditLimit ? 'error' : 'success'
                }>
                  New Balance will be: {formatCurrency(customer.currentCredit + total)}
                </Typography>
              </>
            ) : (
              <Typography color="warning.main">
                Please select a customer for khata payment
              </Typography>
            )}
          </Box>
        )}

        {paymentMethod === 'cash' && (
          <>
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
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography color="text.secondary" gutterBottom>
                Change: {formatCurrency(Math.max(0, parseFloat(amountPaid || 0) - total))}
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={paymentMethod === 'khata' && customer.currentCredit + total > customer.creditLimit}
        >
          Complete Payment
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PaymentDialog 