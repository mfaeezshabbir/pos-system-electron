import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert
} from '@mui/material'
import { formatCurrency } from '../../utils/formatters'
import useTransactionStore from '../../stores/useTransactionStore'
import useCustomerStore from '../../stores/useCustomerStore'

const KhataPaymentDialog = ({ open, onClose, customer }) => {
  const [amount, setAmount] = React.useState('')
  const [error, setError] = React.useState('')
  const { makePayment } = useCustomerStore()
  const { addTransaction } = useTransactionStore()

  React.useEffect(() => {
    if (open) {
      setAmount('')
      setError('')
    }
  }, [open])

  const handleSubmit = () => {
    const paymentAmount = parseFloat(amount)
    if (!paymentAmount || paymentAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (paymentAmount > customer?.currentCredit) {
      setError('Amount exceeds current credit')
      return
    }

    const success = makePayment(customer.id, paymentAmount)
    if (success) {
      // Add to transaction store for reporting
      addTransaction({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'khata_payment',
        customerId: customer.id,
        customerName: customer.name,
        amount: paymentAmount,
        status: 'completed'
      })
      onClose()
    }
  }

  if (!customer) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Khata Payment - {customer.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Current Balance: {formatCurrency(customer.currentCredit)}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Payment Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={!!error}
          helperText={error}
          InputProps={{
            inputProps: { min: 0, max: customer.currentCredit }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!amount || parseFloat(amount) <= 0}
        >
          Complete Payment
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default KhataPaymentDialog 