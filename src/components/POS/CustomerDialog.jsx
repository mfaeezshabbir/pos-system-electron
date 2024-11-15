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
  Divider,
  Paper,
  IconButton,
  Stack,
  Chip,
  Avatar
} from '@mui/material'
import { Add, Person, Phone, Email, LocationOn, CreditCard, Notes } from '@mui/icons-material'
import useCustomerStore from '../../stores/useCustomerStore'
import { formatCurrency } from '../../utils/formatters'

const CustomerDialog = ({ open, onClose, onSelect }) => {
  const { customers, addCustomer } = useCustomerStore()
  const [newCustomer, setNewCustomer] = React.useState({
    name: '',
    phone: '',
    cnic: '',
    address: '',
    creditLimit: 0,
    email: '',
    notes: ''
  })

  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.phone) {
      addCustomer({
        ...newCustomer,
        currentCredit: 0,
        transactions: [],
        pendingPayments: []
      })
      setNewCustomer({
        name: '',
        phone: '',
        cnic: '',
        address: '',
        creditLimit: 0,
        email: '',
        notes: ''
      })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Person color="primary" />
          <Typography variant="h6">Customer Management</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', gap: 3, py: 3 }}>
        <Paper elevation={2} sx={{ flex: '0 0 400px', p: 3 }}>
          <Typography variant="h6" color="primary.main" gutterBottom>
            Add New Customer
          </Typography>

          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Name"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
              required
              InputProps={{
                startAdornment: <Person fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <TextField
              fullWidth
              label="Phone"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
              required
              InputProps={{
                startAdornment: <Phone fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <TextField
              fullWidth
              label="CNIC"
              value={newCustomer.cnic}
              onChange={(e) => setNewCustomer(prev => ({ ...prev, cnic: e.target.value }))}
              InputProps={{
                startAdornment: <CreditCard fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
              InputProps={{
                startAdornment: <Email fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <TextField
              fullWidth
              label="Address"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
              multiline
              rows={2}
              InputProps={{
                startAdornment: <LocationOn fontSize="small" sx={{ mr: 1, mt: 1, color: 'text.secondary' }} />
              }}
            />

            <TextField
              fullWidth
              type="number"
              label="Credit Limit"
              value={newCustomer.creditLimit}
              onChange={(e) => setNewCustomer(prev => ({ ...prev, creditLimit: parseFloat(e.target.value) || 0 }))}
              InputProps={{
                inputProps: { min: 0 },
                startAdornment: <CreditCard fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <TextField
              fullWidth
              label="Notes"
              value={newCustomer.notes}
              onChange={(e) => setNewCustomer(prev => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={2}
              InputProps={{
                startAdornment: <Notes fontSize="small" sx={{ mr: 1, mt: 1, color: 'text.secondary' }} />
              }}
            />

            <Button
              startIcon={<Add />}
              onClick={handleAddCustomer}
              variant="contained"
              disabled={!newCustomer.name || !newCustomer.phone}
              sx={{ mt: 1 }}
              size="large"
            >
              Add Customer
            </Button>
          </Stack>
        </Paper>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" color="primary.main" gutterBottom>
            Existing Customers
          </Typography>

          <List sx={{
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            {customers.map((customer, index) => (
              <React.Fragment key={customer.id}>
                {index > 0 && <Divider />}
                <ListItem
                  button
                  onClick={() => onSelect(customer)}
                  sx={{
                    py: 2,
                    '&:hover': {
                      bgcolor: 'action.hover',
                      '& .MuiAvatar-root': {
                        bgcolor: 'primary.main'
                      }
                    }
                  }}
                >
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                    {customer.name[0].toUpperCase()}
                  </Avatar>

                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {customer.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={formatCurrency(customer.currentCredit)}
                          color={customer.currentCredit > 0 ? 'error' : 'success'}
                        />
                      </Stack>
                    }
                    secondary={
                      <Stack direction="row" spacing={2} mt={0.5}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Phone fontSize="small" sx={{ mr: 0.5 }} />
                          {customer.phone}
                        </Typography>

                        {customer.cnic && (
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <CreditCard fontSize="small" sx={{ mr: 0.5 }} />
                            {customer.cnic}
                          </Typography>
                        )}
                      </Stack>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" size="large">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CustomerDialog