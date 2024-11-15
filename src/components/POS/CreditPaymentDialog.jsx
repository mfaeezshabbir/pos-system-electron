import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box
} from '@mui/material'
import { formatCurrency } from '../../utils/formatters'

const CreditPaymentDialog = ({ open, onClose, customer, onPayment }) => {
  const [amount, setAmount] = React.useState('')
  const [error, setError] = React.useState('')

  const handleSubmit = () => {
    const paymentAmount = parseFloat(amount)
    if (!paymentAmount || paymentAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (paymentAmount > customer.currentCredit) {
      setError('Amount exceeds current credit')
      return
    }
    onPayment(paymentAmount)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Credit Payment</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography>Customer: {customer?.name}</Typography>
          <Typography>Current Credit: {formatCurrency(customer?.currentCredit || 0)}</Typography>
        </Box>
        <TextField
          fullWidth
          label="Payment Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={!!error}
          helperText={error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Complete Payment
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreditPaymentDialog 