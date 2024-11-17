import React from "react";
import {
  Grid,
  Paper,
  Box,
  Button,
  Typography,
  Alert,
  Container,
  Stack,
} from "@mui/material";
import { Person, ShoppingCart } from "@mui/icons-material";
import ProductGrid from "../components/POS/ProductGrid";
import Cart from "../components/POS/Cart";
import useCartStore from "../stores/useCartStore";
import Toast from "../components/common/Toast";
import CustomerDialog from "../components/POS/CustomerDialog";
import useNotificationStore from "../stores/useNotificationStore";
import useSettingsStore from "../stores/useSettingsStore";

const Pos = () => {
  const DEFAULT_WALK_IN_CUSTOMER = {
    id: "walk-in",
    name: "Walk-in Customer",
    phone: "",
    cnic: "",
    email: "",
    address: "",
    notes: "",
    transactions: [],
  };

  const {
    items,
    addItem,
    removeItem,
    updateItemQuantity,
    customer,
    setCustomer,
    error,
  } = useCartStore();

  const [customerDialogOpen, setCustomerDialogOpen] = React.useState(false);
  const { addNotification } = useNotificationStore();
  const { posSettings } = useSettingsStore();

  React.useEffect(() => {
    const initCart = async () => {
      await useCartStore.getState().initializeCart();
      if (!customer && !posSettings.requireCustomer) {
        setCustomer(DEFAULT_WALK_IN_CUSTOMER);
      }
    };
    initCart();
  }, [posSettings.requireCustomer]);

  const handleWalkInCustomer = () => {
    setCustomer(DEFAULT_WALK_IN_CUSTOMER);
    addNotification({
      type: "info",
      message: "Proceeding with Walk-in Customer",
    });
  };

  const handleCustomerSelect = (selectedCustomer) => {
    setCustomer(selectedCustomer);
    setCustomerDialogOpen(false);
    addNotification({
      type: "success",
      message: `Selected customer: ${selectedCustomer.name}`,
    });
  };

  const handleProductSelect = (product) => {
    if (!customer && posSettings.requireCustomer) {
      addNotification({
        type: "warning",
        message: "Please select a customer first",
      });
      return;
    }

    if (!posSettings.allowNegativeStock && product.stock <= 0) {
      addNotification({
        type: "error",
        message: "Product out of stock",
      });
      return;
    }

    addItem(product);
  };

  const CustomerSelection = () => (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.paper",
        borderRadius: 3,
        p: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          maxWidth: 500,
          width: "100%",
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Typography variant="h4" fontWeight="700">
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            To begin a new transaction, please select a customer or proceed with
            a walk-in sale
          </Typography>
          <Stack direction="row" spacing={2} width="100%">
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Person />}
              onClick={() => setCustomerDialogOpen(true)}
              sx={{
                borderRadius: 2,
                py: 1.5,
              }}
            >
              Select Customer
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={handleWalkInCustomer}
              sx={{
                borderRadius: 2,
                py: 1.5,
              }}
            >
              Quick Sale
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );

  const CartComponent = () => (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Cart
        items={items}
        onUpdateQuantity={updateItemQuantity}
        onRemoveItem={removeItem}
      />
    </Box>
  );

  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)",
        bgcolor: "background.default",
      }}
    >
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {!customer ? (
        <CustomerSelection />
      ) : (
        <Box sx={{ height: "100%", position: "relative" }}>
          <Grid container spacing={3} sx={{ height: "100%" }}>
            <Grid item xs={8}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  overflow: "hidden",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <ProductGrid
                  onProductSelect={handleProductSelect}
                  disabled={!customer}
                />
              </Paper>
            </Grid>

            <Grid item xs={4}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  overflow: "hidden",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <CartComponent />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      <CustomerDialog
        open={customerDialogOpen}
        onClose={() => setCustomerDialogOpen(false)}
        onSelect={handleCustomerSelect}
      />

      <Toast />
    </Box>
  );
};

export default Pos;
