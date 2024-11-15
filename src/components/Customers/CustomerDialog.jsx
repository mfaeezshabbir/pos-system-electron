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
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material'
import { Add, Person } from '@mui/icons-material'
import useCustomerStore from '../../stores/useCustomerStore'

const CustomerDialog = ({ open, onClose, onSelect, customer = null }) => {
  const { customers, addCustomer, updateCustomer } = useCustomerStore()
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    cnic: '',
    email: '',
    address: '',
    notes: ''
  })

  React.useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        cnic: customer.cnic || '',
        email: customer.email || '',
        address: customer.address || '',
        notes: customer.notes || ''
      })
    } else {
      setFormData({
        name: '',
        phone: '',
        cnic: '',
        email: '',
        address: '',
        notes: ''
      })
    }
  }, [customer, open])

  const handleSubmit = () => {
    if (formData.name && formData.phone) {
      const customerData = {
        ...formData,
        transactions: customer?.transactions || []
      }

      if (customer) {
        updateCustomer(customer.id, customerData)
      } else {
        addCustomer(customerData)
      }
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="CNIC"
              value={formData.cnic}
              onChange={(e) => setFormData(prev => ({ ...prev, cnic: e.target.value }))}
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              multiline
              rows={2}
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default CustomerDialog 