import React from "react";
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
  Menu,
} from "@mui/material";
import {
  Delete,
  Add,
  Remove,
  Person,
  Payment,
  Receipt,
  ShoppingCart,
  KeyboardArrowDown,
} from "@mui/icons-material";
import useCartStore from "../../stores/useCartStore";
import useInventoryStore from "../../stores/useInventoryStore";
import useNotificationStore from "../../stores/useNotificationStore";
import { formatCurrency } from "../../utils/formatters";
import PaymentDialog from "./PaymentDialog";
import CustomerDialog from "./CustomerDialog";
import useSettingsStore from "../../stores/useSettingsStore";

const CartItem = ({ item, onQuantityChange, onRemove, product }) => {
  const isOutOfStock = product?.stock <= 0;
  const { posSettings } = useSettingsStore();

  return (
    <Card
      elevation={1}
      sx={{
        mb: 1.5,
        borderRadius: 2,
        border: isOutOfStock ? "2px solid" : "1px solid",
        borderColor: isOutOfStock ? "error.main" : "divider",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        {isOutOfStock && (
          <Alert
            severity="error"
            sx={{
              mb: 1,
              py: 0,
              borderRadius: 1,
            }}
          >
            Out of stock
          </Alert>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="600">
              {item.name}
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="body1" color="primary.main" fontWeight="600">
                {formatCurrency(item.price)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                × {item.quantity}
              </Typography>
              {product && (
                <Typography
                  variant="caption"
                  color={product.stock < 10 ? "error.main" : "text.secondary"}
                  fontWeight={product.stock < 10 ? "600" : "regular"}
                  sx={{ opacity: 0.9 }}
                >
                  ({product.stock} left)
                </Typography>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={0.75} alignItems="center">
            <Tooltip title="Decrease quantity" arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={() => onQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  sx={{
                    bgcolor: "action.hover",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "action.selected",
                      transform: "scale(1.1)",
                    },
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
                width: "60px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  "& fieldset": {
                    borderColor: "divider",
                  },
                  "&:hover fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
              inputProps={{
                style: {
                  textAlign: "center",
                  padding: "6px 8px",
                  fontWeight: 500,
                },
                min: 1,
                max: product?.stock || 0,
              }}
            />

            <Tooltip title="Increase quantity" arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={() => onQuantityChange(item.quantity + 1)}
                  disabled={item.quantity >= (product?.stock || 0)}
                  sx={{
                    bgcolor: "action.hover",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "action.selected",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Remove item" arrow>
              <IconButton
                size="small"
                color="error"
                onClick={onRemove}
                sx={{
                  ml: 0.5,
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "error.lighter",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

const Cart = () => {
  const {
    items,
    updateItemQuantity,
    removeItem,
    getCartTotals,
    customer,
    setCustomer,
    error,
  } = useCartStore();

  const inventory = useInventoryStore();
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = React.useState(false);
  const [customerMenuAnchor, setCustomerMenuAnchor] = React.useState(null);
  const totals = getCartTotals();
  const { posSettings } = useSettingsStore();

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity > 0) {
      const product = inventory.products.find((p) => p.id === item.id);
      if (product && newQuantity > product.stock) {
        useNotificationStore.getState().addNotification({
          type: "error",
          message: `Only ${product.stock} units available in stock`,
        });
        return;
      }
      updateItemQuantity(item.id, newQuantity);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 2.5,
        gap: 2.5,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 2,
          background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
          color: "white",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <ShoppingCart sx={{ color: "white" }} />
          <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
            Cart
          </Typography>
          {customer && (
            <>
              <IconButton
                size="small"
                onClick={(e) => setCustomerMenuAnchor(e.currentTarget)}
                sx={{ color: "white" }}
              >
                <Person fontSize="small" />
                <KeyboardArrowDown fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={customerMenuAnchor}
                open={Boolean(customerMenuAnchor)}
                onClose={() => setCustomerMenuAnchor(null)}
                PaperProps={{
                  elevation: 3,
                  sx: { borderRadius: 2, mt: 1 },
                }}
              >
                <Box sx={{ p: 2.5, minWidth: 250 }}>
                  <Typography
                    variant="subtitle1"
                    color="primary.main"
                    fontWeight="600"
                    gutterBottom
                  >
                    Customer Details
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {customer.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
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
            borderRadius: 2,
            "& .MuiAlert-message": {
              width: "100%",
            },
          }}
        >
          {error}
        </Alert>
      )}

      <Paper
        elevation={2}
        sx={{
          flex: 1,
          overflow: "auto",
          bgcolor: "background.default",
          p: 2.5,
          borderRadius: 2,
        }}
      >
        {items.length === 0 ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 2.5,
              color: "text.secondary",
            }}
          >
            <ShoppingCart
              sx={{ fontSize: 80, color: "action.disabled", opacity: 0.5 }}
            />
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ opacity: 0.7 }}
            >
              Your cart is empty
            </Typography>
          </Box>
        ) : (
          items.map((item) => {
            const product = inventory.products.find((p) => p.id === item.id);
            return (
              <CartItem
                key={item.id}
                item={item}
                product={product}
                onQuantityChange={(quantity) =>
                  handleQuantityChange(item, quantity)
                }
                onRemove={() => removeItem(item.id)}
              />
            );
          })
        )}
      </Paper>

      <Paper
        elevation={3}
        sx={{
          p: 2.5,
          borderRadius: 2,
          background: "linear-gradient(to bottom, #ffffff, #f5f5f5)",
        }}
      >
        <Stack spacing={2}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="text.secondary" fontWeight="500">
              Subtotal
            </Typography>
            <Typography fontWeight="600">
              {formatCurrency(totals.subtotal)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="text.secondary" fontWeight="500">
              Tax ({totals.taxRate}%)
            </Typography>
            <Typography fontWeight="600">
              {formatCurrency(totals.taxAmount)}
            </Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" color="primary.main" fontWeight="600">
              Total
            </Typography>
            <Typography variant="h6" color="primary.main" fontWeight="600">
              {formatCurrency(totals.total)}
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={2} mt={3}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={() => setCustomerDialogOpen(true)}
            disabled={items.length === 0}
            startIcon={<Person />}
            sx={{
              borderWidth: "2px",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                borderWidth: "2px",
                transform: "translateY(-2px)",
                boxShadow: 2,
              },
              transition: "all 0.2s",
            }}
          >
            {customer
              ? `Change Customer (${customer.name})`
              : "Select Customer"}
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
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.2s",
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
  );
};

export default Cart;
