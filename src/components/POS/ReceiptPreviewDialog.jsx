import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Stack,
  Paper,
  IconButton,
  Grid,
} from "@mui/material";
import { Print, Save, Close, Receipt } from "@mui/icons-material";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters";
import { generateReceipt } from "../../utils/pdfGenerator";

const ReceiptPreviewDialog = ({ open, onClose, transaction, onPrint }) => {
  if (!transaction) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: "grey.50",
        },
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
            <Typography variant="h6">Payment Receipt</Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Paper elevation={0} sx={{ p: 3, bgcolor: "white", borderRadius: 2 }}>
          <Stack spacing={3}>
            {/* Header */}
            <Box textAlign="center">
              <Typography variant="h5" color="primary.main" gutterBottom>
                {transaction.businessName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {transaction.businessAddress}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {transaction.businessPhone}
              </Typography>
            </Box>

            <Divider />

            {/* Transaction Info */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Date: {formatDate(transaction.timestamp)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Time: {formatTime(transaction.timestamp)}
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  Receipt #: {transaction.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customer: {transaction.customerName || "Walk-in"}
                </Typography>
              </Grid>
            </Grid>

            <Divider />

            {/* Items */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Items
              </Typography>
              <Stack spacing={1.5}>
                {transaction.items.map((item, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box flex={1}>
                      <Typography variant="body2">{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.quantity} x {formatCurrency(item.price)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(item.quantity * item.price)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Divider />

            {/* Totals */}
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography>{formatCurrency(transaction.subtotal)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Tax</Typography>
                <Typography>{formatCurrency(transaction.taxAmount)}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle1">Total</Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {formatCurrency(transaction.total)}
                </Typography>
              </Stack>
            </Stack>

            {/* Payment Details */}
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 1, borderColor: "primary.main" }}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="primary">
                  Payment Details
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Method</Typography>
                  <Typography variant="body2">
                    {transaction.paymentMethod.toUpperCase()}
                  </Typography>
                </Stack>
                {transaction.paymentMethod === "cash" && (
                  <>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Amount Paid</Typography>
                      <Typography variant="body2">
                        {formatCurrency(transaction.amountPaid)}
                      </Typography>
                    </Stack>
                    {transaction.change > 0 && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Change</Typography>
                        <Typography variant="body2" color="success.main">
                          {formatCurrency(transaction.change)}
                        </Typography>
                      </Stack>
                    )}
                  </>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: "grey.50" }}>
        <Button
          onClick={onPrint}
          variant="contained"
          startIcon={<Print />}
          sx={{ borderRadius: 2 }}
        >
          Print Receipt
        </Button>
        <Button
          onClick={() => {
            const receiptDoc = generateReceipt(transaction);
            receiptDoc.save(`receipt_${transaction.id}.pdf`);
          }}
          variant="outlined"
          startIcon={<Save />}
          sx={{ borderRadius: 2 }}
        >
          Save as PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptPreviewDialog;
