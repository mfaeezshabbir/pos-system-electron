import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material'
import { Add, Person } from '@mui/icons-material'
import useCustomerStore from '../../stores/useCustomerStore'

const CustomerDialog = ({ open, onClose, onSelect }) => {
  const { customers, addCustomer } = useCustomerStore()
  const [newCustomer, setNewCustomer] = React.useState({
    name: '',
    phone: '',
    creditLimit: 0
  })

  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.phone) {
      addCustomer(newCustomer)
      setNewCustomer({ name: '', phone: '', creditLimit: 0 })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Customer</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Add New Customer</Typography>
          <TextField
            fullWidth
            label="Name"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="Credit Limit"
            value={newCustomer.creditLimit}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, creditLimit: parseFloat(e.target.value) }))}
            margin="normal"
          />
          <Button
            startIcon={<Add />}
            onClick={handleAddCustomer}
            variant="contained"
            sx={{ mt: 1 }}
          >
            Add Customer
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom>Existing Customers</Typography>
        <List>
          {customers.map(customer => (
            <ListItem
              key={customer.id}
              button
              onClick={() => onSelect(customer)}
              secondaryAction={
                <Typography color="text.secondary">
                  Credit: {customer.totalCredit}
                </Typography>
              }
            >
              <ListItemText
                primary={customer.name}
                secondary={customer.phone}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}

export default CustomerDialog 