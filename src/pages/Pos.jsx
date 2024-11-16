import React from "react";
import {
  Grid,
  Paper,
  Box,
  Button,
  Typography,
  Alert,
  Container,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Person, ShoppingCart, Menu } from "@mui/icons-material";
import ProductGrid from "../components/POS/ProductGrid";
import Cart from "../components/POS/Cart";
import useCartStore from "../stores/useCartStore";
import Toast from "../components/common/Toast";
import CustomerDialog from "../components/POS/CustomerDialog";
import useNotificationStore from "../stores/useNotificationStore";
import useSettingsStore from "../stores/useSettingsStore";

const Pos = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = React.useState(false);

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
    if (isMobile) {
      setDrawerOpen(true);
    }
  };

  const CustomerSelection = () => (
    <Container maxWidth="sm" sx={{ textAlign: "center", py: 4 }}>
      <Typography variant="h5" gutterBottom>
        Welcome to POS System
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Please select a customer to continue
      </Typography>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 3 }}>
        <Button
          variant="contained"
          startIcon={<Person />}
          onClick={() => setCustomerDialogOpen(true)}
          size="large"
        >
          Select Customer
        </Button>
        <Button
          variant="outlined"
          startIcon={<ShoppingCart />}
          onClick={handleWalkInCustomer}
          size="large"
        >
          Walk-in Customer
        </Button>
      </Box>
    </Container>
  );

  const CartComponent = () => (
    <Cart
      items={items}
      onUpdateQuantity={updateItemQuantity}
      onRemoveItem={removeItem}
    />
  );

  return (
    <Box sx={{ height: "calc(100vh - 64px)", bgcolor: "background.default" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!customer ? (
        <CustomerSelection />
      ) : (
        <Box sx={{ height: "100%", position: "relative" }}>
          {isMobile && (
            <IconButton
              sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}
              color="primary"
              onClick={() => setDrawerOpen(true)}
            >
              <ShoppingCart />
            </IconButton>
          )}

          <Grid container spacing={2} sx={{ height: "100%", p: 2 }}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ height: "100%", overflow: "hidden" }}>
                <ProductGrid
                  onProductSelect={handleProductSelect}
                  disabled={!customer}
                />
              </Paper>
            </Grid>

            {!isMobile && (
              <Grid item md={4}>
                <Paper sx={{ height: "100%", overflow: "hidden" }}>
                  <CartComponent />
                </Paper>
              </Grid>
            )}
          </Grid>

          {isMobile && (
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              sx={{
                "& .MuiDrawer-paper": {
                  width: "85%",
                  maxWidth: 400,
                },
              }}
            >
              <CartComponent />
            </Drawer>
          )}
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
