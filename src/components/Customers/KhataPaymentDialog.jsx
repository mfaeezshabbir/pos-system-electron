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
  Alert,
  Divider
} from '@mui/material'
import { formatCurrency } from '../../utils/formatters'
import useTransactionStore from '../../stores/useTransactionStore'
import useCustomerStore from '../../stores/useCustomerStore'
import useNotificationStore from '../../stores/useNotificationStore'

const KhataPaymentDialog = ({ open, onClose, customer }) => {
  const [amount, setAmount] = React.useState('')
  const [error, setError] = React.useState('')
  const { makePayment } = useCustomerStore()
  const { addTransaction } = useTransactionStore()
  const { addNotification } = useNotificationStore()

  React.useEffect(() => {
    if (open) {
      setAmount('')
      setError('')
    }
  }, [open])

  const handleSubmit = () => {
    try {
      const paymentAmount = parseFloat(amount)
      if (!paymentAmount || paymentAmount <= 0) {
        setError('Please enter a valid amount')
        return
      }
      if (paymentAmount > customer?.currentCredit) {
        setError('Amount exceeds current credit')
        return
      }

      const paymentTransaction = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'payment',
        amount: paymentAmount,
        status: 'completed'
      }

      const success = makePayment(customer.id, paymentAmount)
      if (success) {
        addTransaction({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: 'khata_payment',
          customerId: customer.id,
          customerName: customer.name,
          amount: paymentAmount,
          status: 'completed'
        })
        
        addNotification({
          type: 'success',
          message: `Payment of ${formatCurrency(paymentAmount)} received from ${customer.name}`
        })
        
        onClose()
      } else {
        setError('Payment failed. Please try again.')
      }
    } catch (error) {
      setError(error.message)
    }
  }

  if (!customer) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Khata Payment</Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Customer: {customer.name}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Credit Details
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Current Balance:</Typography>
            <Typography color="error">
              {formatCurrency(customer.currentCredit)}
            </Typography>
          </Box>
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
          helperText={error || 'Enter amount to be paid'}
          InputProps={{
            inputProps: { 
              min: 0, 
              max: customer.currentCredit,
              step: '0.01'
            }
          }}
        />

        {amount && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Payment Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography>Remaining Balance:</Typography>
              <Typography color="success.main">
                {formatCurrency(customer.currentCredit - parseFloat(amount || 0))}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > customer.currentCredit}
        >
          Complete Payment
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default KhataPaymentDialog 