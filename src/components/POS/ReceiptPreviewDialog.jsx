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
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { Print, Save, Close, Receipt } from "@mui/icons-material";
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters";
import { generateReceipt } from "../../utils/pdfGenerator";
import useSettingsStore from "../../stores/useSettingsStore";

const ReceiptPreviewDialog = ({ open, onClose, transaction, onPrint }) => {
  if (!transaction) return null;

  const businessDetails = transaction.businessDetails || {};
  const items = transaction.items || [];

  const {
    customerName = "Guest",
    customerPhone = "",
    customerAddress = "",
    subtotal = 0,
    taxAmount = 0,
    discount = 0,
    total = 0,
    paymentMethod = "cash",
    amountPaid = 0,
    change = 0,
    timestamp = new Date(),
    id = "",
  } = transaction;

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
            {/* Business Header */}
            <Box textAlign="center">
              <Typography variant="h5" color="primary.main" gutterBottom>
                {businessDetails.name || "Business Name"}
              </Typography>
              {businessDetails.address && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {businessDetails.address}
                </Typography>
              )}
              {businessDetails.phone && (
                <Typography variant="body2" color="text.secondary">
                  Tel: {businessDetails.phone}
                </Typography>
              )}
              {/* {businessDetails.email && (
                <Typography variant="body2" color="text.secondary">
                  Email: {businessDetails.email}
                </Typography>
              )}
              {businessDetails.website && (
                <Typography variant="body2" color="text.secondary">
                  Web: {businessDetails.website}
                </Typography>
              )} */}
              {businessDetails.taxId && (
                <Typography variant="body2" color="text.secondary">
                  Tax ID: {businessDetails.taxId}
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Transaction Details */}
            <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="primary">
                      Transaction Info
                    </Typography>
                    <Typography variant="body2">Receipt #: {id}</Typography>
                    <Typography variant="body2">
                      Date: {formatDate(timestamp)}
                    </Typography>
                    <Typography variant="body2">
                      Time: {formatTime(timestamp)}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="primary">
                      Customer Details
                    </Typography>
                    <Typography variant="body2">
                      Name: {customerName}
                    </Typography>
                    {customerPhone && (
                      <Typography variant="body2">
                        Phone: {customerPhone}
                      </Typography>
                    )}
                    {customerAddress && (
                      <Typography variant="body2">
                        Address: {customerAddress}
                      </Typography>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            {/* Items */}
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Items Purchased
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell>Item</TableCell>
                      <TableCell align="center">Qty</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.quantity * item.price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Payment Summary */}
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 1, borderColor: "primary.main" }}
            >
              <Stack spacing={2}>
                <Typography variant="subtitle2" color="primary">
                  Payment Summary
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Subtotal</Typography>
                    <Typography variant="body2">
                      {formatCurrency(subtotal)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Tax</Typography>
                    <Typography variant="body2">
                      {formatCurrency(taxAmount)}
                    </Typography>
                  </Stack>
                  {discount > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Discount</Typography>
                      <Typography variant="body2">
                        {formatCurrency(discount)}
                      </Typography>
                    </Stack>
                  )}
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle1">Total</Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {formatCurrency(total)}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>

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
                    {paymentMethod.toUpperCase()}
                  </Typography>
                </Stack>
                {paymentMethod === "cash" && (
                  <>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Amount Paid</Typography>
                      <Typography variant="body2">
                        {formatCurrency(amountPaid)}
                      </Typography>
                    </Stack>
                    {change > 0 && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Change</Typography>
                        <Typography variant="body2" color="success.main">
                          {formatCurrency(change)}
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
        {/* <Button
          onClick={onPrint}
          variant="contained"
          startIcon={<Print />}
          sx={{ borderRadius: 2 }}
        >
          Print Receipt
        </Button> */}
        <Button
          onClick={() => {
            try {
              const { businessInfo = {}, receiptSettings = {} } =
                useSettingsStore.getState();
              const enrichedTransaction = {
                ...transaction,
                businessName: businessInfo.name || "",
                businessAddress: businessInfo.address || "",
                businessPhone: businessInfo.phone || "",
                businessEmail: businessInfo.email || "",
                businessWebsite: businessInfo.website || "",
                businessTaxId: businessInfo.taxId || "",
              };
              const receiptDoc = generateReceipt(
                enrichedTransaction,
                receiptSettings
              );
              receiptDoc.save(`Receipt-${transaction.id || "unknown"}.pdf`);
            } catch (error) {
              console.error("Error generating PDF:", error);
              // You might want to show an error notification here
            }
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
