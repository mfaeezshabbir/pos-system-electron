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
  Typography
} from '@mui/material'
import { formatCurrency } from '../../utils/formatters'

const PaymentDialog = ({ open, onClose, onSubmit, total }) => {
  const [paymentMethod, setPaymentMethod] = React.useState('cash')
  const [amountPaid, setAmountPaid] = React.useState(total)
  const [error, setError] = React.useState('')

  const handleSubmit = () => {
    if (amountPaid < total) {
      setError('Amount paid must be greater than or equal to total')
      return
    }

    onSubmit({
      method: paymentMethod,
      amountPaid: parseFloat(amountPaid),
      change: amountPaid - total
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Payment</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <Typography variant="h6">
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
            onChange={(e) => setAmountPaid(parseFloat(e.target.value))}
            margin="normal"
            error={!!error}
            helperText={error}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Confirm Payment
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PaymentDialog 