import React from "react";
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
import { printReceipt } from "../../utils/printer";
import useSettingsStore from "../../stores/useSettingsStore";
import ReceiptPreviewDialog from "./ReceiptPreviewDialog";
import useTransactionStore from "../../stores/useTransactionStore";

const PaymentDialog = ({ open, onClose, total, customer }) => {
  const [paymentMethod, setPaymentMethod] = React.useState("cash");
  const [amountPaid, setAmountPaid] = React.useState("");
  const [error, setError] = React.useState("");
  const [showReceipt, setShowReceipt] = React.useState(false);
  const [currentTransaction, setCurrentTransaction] = React.useState(null);
  const { completeTransaction, items } = useCartStore();
  const { receiptSettings } = useSettingsStore();
  const { businessInfo } = useSettingsStore();

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
        total: total,
        status: paymentMethod === "khata" ? "pending" : "completed",
      };

      const success = await completeTransaction(paymentDetails);
      
      if (success) {
        const transaction = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.quantity * item.price
          })),
          total,
          paymentMethod,
          amountPaid: paymentDetails.amountPaid,
          change: paymentDetails.change,
          customerId: customer?.id,
          customerName: customer?.name,
          status: paymentDetails.status
        };

        await useTransactionStore.getState().addTransaction(transaction);
        setCurrentTransaction(transaction);
        setShowReceipt(true);

        if (receiptSettings.printAutomatically) {
          handlePrintReceipt(transaction);
        }
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePrintReceipt = async (transaction) => {
    try {
      const receiptDoc = generateReceipt(transaction);
      await printReceipt({
        printerName: receiptSettings.thermalPrinterName,
        copies: receiptSettings.copies,
        data: receiptDoc.output('arraybuffer')
      });
    } catch (error) {
      console.error('Failed to print receipt:', error);
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Paper elevation={0} sx={{ p: 3 }}>
        <DialogTitle sx={{ p: 0, mb: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" fontWeight="bold">
              Payment
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
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
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Payment Method
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Paper
                  elevation={paymentMethod === "cash" ? 3 : 1}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    bgcolor:
                      paymentMethod === "cash"
                        ? "primary.light"
                        : "background.paper",
                    "&:hover": { bgcolor: "primary.light" },
                  }}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <Typography align="center">Cash</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper
                  elevation={paymentMethod === "card" ? 3 : 1}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    bgcolor:
                      paymentMethod === "card"
                        ? "primary.light"
                        : "background.paper",
                    "&:hover": { bgcolor: "primary.light" },
                  }}
                  onClick={() => setPaymentMethod("card")}
                >
                  <Typography align="center">Card</Typography>
                </Paper>
              </Grid>
              {customer?.id !== "walk-in" && (
                <Grid item xs={4}>
                  <Paper
                    elevation={paymentMethod === "khata" ? 3 : 1}
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      bgcolor:
                        paymentMethod === "khata"
                          ? "primary.light"
                          : "background.paper",
                      "&:hover": { bgcolor: "primary.light" },
                    }}
                    onClick={() => setPaymentMethod("khata")}
                  >
                    <Typography align="center">Khata</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>

          {paymentMethod === "cash" && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
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
                variant="outlined"
                size="large"
              />
            </Box>
          )}

          {paymentMethod === "khata" && (
            <Alert severity="info" variant="outlined" sx={{ mb: 4 }}>
              Amount will be added to customer's credit
            </Alert>
          )}

          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Payment Summary
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Total Amount</Typography>
                <Typography fontWeight="bold">
                  {formatCurrency(total)}
                </Typography>
              </Stack>
              {paymentMethod === "cash" && parseFloat(amountPaid) > total && (
                <>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Change</Typography>
                    <Typography fontWeight="bold" color="success.main">
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
            sx={{ minWidth: 120 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            sx={{ minWidth: 120 }}
            disabled={
              paymentMethod === "cash" &&
              (!amountPaid || parseFloat(amountPaid) < total)
            }
          >
            Complete
          </Button>
        </DialogActions>
      </Paper>
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
