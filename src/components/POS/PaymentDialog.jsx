import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  InputAdornment,
  Grid,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import { formatCurrency } from "../../utils/formatters";
import useCartStore from "../../stores/useCartStore";
import { generateReceipt } from "../../utils/pdfGenerator";
import useSettingsStore from "../../stores/useSettingsStore";
import ReceiptPreviewDialog from "./ReceiptPreviewDialog";
import useTransactionStore from "../../stores/useTransactionStore";
import { Receipt, Print } from "@mui/icons-material";

const PaymentDialog = ({ open, onClose, total, customer }) => {
  const [paymentMethod, setPaymentMethod] = React.useState("cash");
  const [amountPaid, setAmountPaid] = React.useState("");
  const [error, setError] = React.useState("");
  const [showReceipt, setShowReceipt] = React.useState(false);
  const [currentTransaction, setCurrentTransaction] = React.useState(null);
  const { completeTransaction, items } = useCartStore();
  const { receiptSettings } = useSettingsStore();
  const [paymentComplete, setPaymentComplete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setAmountPaid("");
      setError("");
      setPaymentMethod("cash");
      setShowReceipt(false);
      setCurrentTransaction(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      if (
        paymentMethod === "cash" &&
        (!amountPaid || parseFloat(amountPaid) < total)
      ) {
        setError("Amount paid must be greater than or equal to total");
        return;
      }

      const paymentDetails = {
        method: paymentMethod,
        amountPaid: paymentMethod === "cash" ? parseFloat(amountPaid) : total,
        change:
          paymentMethod === "cash"
            ? Math.max(0, parseFloat(amountPaid) - total)
            : 0,
        total,
        status: paymentMethod === "khata" ? "pending" : "completed",
      };

      const success = await completeTransaction(paymentDetails);

      if (success) {
        const latestTransaction =
          useTransactionStore.getState().transactions[0];
        setCurrentTransaction(latestTransaction);
        setPaymentComplete(true);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    onClose();
  };

  const PaymentMethodButton = ({ method, label }) => (
    <Grid item xs={4}>
      <Paper
        elevation={paymentMethod === method ? 4 : 1}
        sx={{
          p: 2.5,
          cursor: "pointer",
          borderRadius: 2,
          bgcolor:
            paymentMethod === method ? "primary.main" : "background.paper",
          color: paymentMethod === method ? "white" : "text.primary",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            bgcolor:
              paymentMethod === method ? "primary.dark" : "primary.light",
            color: paymentMethod === method ? "white" : "text.primary",
          },
        }}
        onClick={() => setPaymentMethod(method)}
      >
        <Typography align="center" fontWeight={600}>
          {label}
        </Typography>
      </Paper>
    </Grid>
  );

  if (paymentComplete && currentTransaction) {
    return (
      <Dialog
        open={open}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, bgcolor: "grey.50" },
        }}
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white", py: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Receipt />
              <Typography variant="h6">Payment Complete</Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            <Box textAlign="center">
              <Typography variant="h5" color="success.main" gutterBottom>
                ✓ Payment Successful
              </Typography>
              <Typography color="text.secondary">
                Amount Paid: {formatCurrency(currentTransaction.total)}
              </Typography>
            </Box>

            {currentTransaction.change > 0 && (
              <Alert severity="info" sx={{ width: "100%" }}>
                Change Due: {formatCurrency(currentTransaction.change)}
              </Alert>
            )}

            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={() => handlePrintReceipt(currentTransaction)}
              sx={{ width: "100%", py: 1.5 }}
            >
              Print Receipt
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                setPaymentComplete(false);
                onClose();
              }}
              sx={{ width: "100%", py: 1.5 }}
            >
              Done
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ p: 4 }}>
        <DialogTitle sx={{ p: 0, mb: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" fontWeight={700}>
              Payment Details
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              fontWeight={500}
            >
              {customer?.name || "Walk-in Customer"}
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} variant="filled">
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Select Payment Method
            </Typography>
            <Grid container spacing={2}>
              <PaymentMethodButton method="cash" label="Cash" />
              <PaymentMethodButton method="card" label="Card" />
              {customer?.id !== "walk-in" && (
                <PaymentMethodButton method="khata" label="Khata" />
              )}
            </Grid>
          </Box>

          {paymentMethod === "cash" && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Amount Received
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">Rs.</InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontSize: "1.1rem",
                  },
                }}
              />
            </Box>
          )}

          {paymentMethod === "khata" && (
            <Alert
              severity="info"
              variant="outlined"
              sx={{
                mb: 4,
                borderRadius: 2,
                "& .MuiAlert-message": {
                  fontWeight: 500,
                },
              }}
            >
              Amount will be added to customer's credit
            </Alert>
          )}

          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              borderWidth: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Payment Summary
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Total Amount</Typography>
                <Typography fontWeight={700}>
                  {formatCurrency(total)}
                </Typography>
              </Stack>
              {paymentMethod === "cash" && parseFloat(amountPaid) > total && (
                <>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Change</Typography>
                    <Typography fontWeight={700} color="success.main">
                      {formatCurrency(parseFloat(amountPaid) - total)}
                    </Typography>
                  </Stack>
                </>
              )}
            </Stack>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: 0, pt: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            size="large"
            sx={{
              minWidth: 120,
              borderRadius: 2,
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            sx={{
              minWidth: 120,
              borderRadius: 2,
              fontWeight: 600,
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)",
              },
            }}
            disabled={
              paymentMethod === "cash" &&
              (!amountPaid || parseFloat(amountPaid) < total)
            }
          >
            Complete Payment
          </Button>
        </DialogActions>
      </Box>

      <ReceiptPreviewDialog
        open={showReceipt}
        onClose={handleCloseReceipt}
        transaction={currentTransaction}
        onPrint={() => handlePrintReceipt(currentTransaction)}
      />
    </Dialog>
  );
};

export default PaymentDialog;
