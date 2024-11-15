import React from 'react'
import {
  Box,
  IconButton,
  Typography,
  Divider,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  Alert,
  Stack,
  Tooltip,
  Menu
} from '@mui/material'
import {
  Delete,
  Add,
  Remove,
  Person,
  Payment,
  Receipt,
  ShoppingCart,
  KeyboardArrowDown
} from '@mui/icons-material'
import useCartStore from '../../stores/useCartStore'
import useInventoryStore from '../../stores/useInventoryStore'
import useNotificationStore from '../../stores/useNotificationStore'
import { formatCurrency } from '../../utils/formatters'
import PaymentDialog from './PaymentDialog'
import CustomerDialog from './CustomerDialog'
import useSettingsStore from '../../stores/useSettingsStore'

const CartItem = ({ item, onQuantityChange, onRemove, product }) => {
  const isOutOfStock = product?.stock <= 0
  const { posSettings } = useSettingsStore()

  return (
    <Card
      elevation={2}
      sx={{
        mb: 1.5,
        border: isOutOfStock ? '2px solid' : '1px solid',
        borderColor: isOutOfStock ? 'error.main' : 'divider',
        '&:hover': {
          boxShadow: 3
        }
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        {isOutOfStock && (
          <Alert
            severity="error"
            sx={{
              mb: 1,
              py: 0
            }}
          >
            Out of stock
          </Alert>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              {item.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="primary.main" fontWeight="medium">
                {formatCurrency(item.price)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                × {item.quantity}
              </Typography>
              {product && (
                <Typography
                  variant="caption"
                  color={product.stock < 10 ? "error.main" : "text.secondary"}
                  fontWeight={product.stock < 10 ? "medium" : "regular"}
                >
                  ({product.stock} left)
                </Typography>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title="Decrease quantity">
              <span>
                <IconButton
                  size="small"
                  onClick={() => onQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  sx={{
                    bgcolor: 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected'
                    }
                  }}
                >
                  <Remove fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <TextField
              size="small"
              value={item.quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
              sx={{
                width: '50px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'divider'
                  }
                }
              }}
              inputProps={{
                style: {
                  textAlign: 'center',
                  padding: '4px 8px'
                },
                min: 1,
                max: product?.stock || 0
              }}
            />

            <Tooltip title="Increase quantity">
              <span>
                <IconButton
                  size="small"
                  onClick={() => onQuantityChange(item.quantity + 1)}
                  disabled={item.quantity >= (product?.stock || 0)}
                  sx={{
                    bgcolor: 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected'
                    }
                  }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Remove item">
              <IconButton
                size="small"
                color="error"
                onClick={onRemove}
                sx={{
                  ml: 0.5,
                  '&:hover': {
                    bgcolor: 'error.lighter'
                  }
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}

const Cart = () => {
  const {
    items,
    updateItemQuantity,
    removeItem,
    getCartTotals,
    customer,
    setCustomer,
    error
  } = useCartStore()

  const inventory = useInventoryStore()
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false)
  const [customerDialogOpen, setCustomerDialogOpen] = React.useState(false)
  const [customerMenuAnchor, setCustomerMenuAnchor] = React.useState(null)
  const totals = getCartTotals()
  const { posSettings } = useSettingsStore()

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity > 0) {
      const product = inventory.products.find(p => p.id === item.id)
      if (product && newQuantity > product.stock) {
        useNotificationStore.getState().addNotification({
          type: 'error',
          message: `Only ${product.stock} units available in stock`
        })
        return
      }
      updateItemQuantity(item.id, newQuantity)
    }
  }

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      p: 2,
      gap: 2
    }}>
      <Paper elevation={2} sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <ShoppingCart color="primary" />
          <Typography variant="h6" color="primary.main">Cart</Typography>
          {customer && (
            <>
              <IconButton
                size="small"
                onClick={(e) => setCustomerMenuAnchor(e.currentTarget)}
              >
                <Person fontSize="small" color="primary" />
                <KeyboardArrowDown fontSize="small" color="primary" />
              </IconButton>
              <Menu
                anchorEl={customerMenuAnchor}
                open={Boolean(customerMenuAnchor)}
                onClose={() => setCustomerMenuAnchor(null)}
              >
                <Box sx={{ p: 2, minWidth: 200 }}>
                  <Typography variant="subtitle2" color="primary.main" gutterBottom>
                    Customer Details
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {customer.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {customer.phone}
                  </Typography>
                  {customer.cnic && (
                    <Typography variant="body2" color="text.secondary">
                      CNIC: {customer.cnic}
                    </Typography>
                  )}
                </Box>
              </Menu>
            </>
          )}
        </Stack>
      </Paper>

      {error && (
        <Alert
          severity="error"
          variant="filled"
          sx={{
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          {error}
        </Alert>
      )}
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          overflow: 'auto',
          bgcolor: 'background.default',
          p: 2
        }}
      >
        {items.length === 0 ? (
          <Box sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
            color: 'text.secondary'
          }}>
            <ShoppingCart sx={{ fontSize: 64, color: 'action.disabled' }} />
            <Typography variant="h6" color="text.secondary">
              Cart is empty
            </Typography>
          </Box>
        ) : (
          items.map(item => {
            const product = inventory.products.find(p => p.id === item.id)
            return (
              <CartItem
                key={item.id}
                item={item}
                product={product}
                onQuantityChange={(quantity) => handleQuantityChange(item, quantity)}
                onRemove={() => removeItem(item.id)}
              />
            )
          })
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">Subtotal</Typography>
            <Typography>{formatCurrency(totals.subtotal)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">
              Tax ({totals.taxRate}%)
            </Typography>
            <Typography>{formatCurrency(totals.taxAmount)}</Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" color="primary.main">Total</Typography>
            <Typography variant="h6" color="primary.main">
              {formatCurrency(totals.total)}
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={1.5} mt={2}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={() => setCustomerDialogOpen(true)}
            disabled={items.length === 0}
            startIcon={<Person />}
            sx={{
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px'
              }
            }}
          >
            {customer ? `Change Customer (${customer.name})` : 'Select Customer'}
          </Button>

          {customer && (
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => setPaymentDialogOpen(true)}
              disabled={items.length === 0}
              startIcon={<Payment />}
              sx={{
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              Proceed to Payment
            </Button>
          )}
        </Stack>
      </Paper>

      <CustomerDialog
        open={customerDialogOpen}
        onClose={() => setCustomerDialogOpen(false)}
        onSelect={setCustomer}
      />

      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        total={totals.total}
        customer={customer}
      />
    </Box>
  )
}

export default Cart