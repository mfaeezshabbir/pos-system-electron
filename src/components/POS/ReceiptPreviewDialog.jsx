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
                {transaction.businessDetails?.name}
              </Typography>
              {transaction.businessDetails?.address && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {transaction.businessDetails.address}
                </Typography>
              )}
              {transaction.businessDetails?.phone && (
                <Typography variant="body2" color="text.secondary">
                  Tel: {transaction.businessDetails.phone}
                </Typography>
              )}
              {transaction.businessDetails?.email && (
                <Typography variant="body2" color="text.secondary">
                  Email: {transaction.businessDetails.email}
                </Typography>
              )}
              {transaction.businessDetails?.website && (
                <Typography variant="body2" color="text.secondary">
                  Web: {transaction.businessDetails.website}
                </Typography>
              )}
              {transaction.businessDetails?.taxId && (
                <Typography variant="body2" color="text.secondary">
                  Tax ID: {transaction.businessDetails.taxId}
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
                    <Typography variant="body2">
                      Receipt #: {transaction.id}
                    </Typography>
                    <Typography variant="body2">
                      Date: {formatDate(transaction.timestamp)}
                    </Typography>
                    <Typography variant="body2">
                      Time: {formatTime(transaction.timestamp)}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="primary">
                      Customer Details
                    </Typography>
                    <Typography variant="body2">
                      Name: {transaction.customerName}
                    </Typography>
                    {transaction.customerPhone && (
                      <Typography variant="body2">
                        Phone: {transaction.customerPhone}
                      </Typography>
                    )}
                    {transaction.paymentMethod === "khata" &&
                      transaction.customerAddress && (
                        <Typography variant="body2">
                          Address: {transaction.customerAddress}
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
                    {transaction.items.map((item, index) => (
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
                      {formatCurrency(transaction.subtotal)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Tax</Typography>
                    <Typography variant="body2">
                      {formatCurrency(transaction.taxAmount)}
                    </Typography>
                  </Stack>
                  {transaction.discount > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Discount</Typography>
                      <Typography variant="body2">
                        {formatCurrency(transaction.discount)}
                      </Typography>
                    </Stack>
                  )}
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle1">Total</Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {formatCurrency(transaction.total)}
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
          onClick={async () => {
            const { businessInfo, receiptSettings } =
              useSettingsStore.getState();
            const enrichedTransaction = {
              ...transaction,
              businessName: businessInfo.name,
              businessAddress: businessInfo.address,
              businessPhone: businessInfo.phone,
              businessEmail: businessInfo.email,
              businessWebsite: businessInfo.website,
              businessTaxId: businessInfo.taxId,
            };
            const receiptDoc = generateReceipt(
              enrichedTransaction,
              receiptSettings
            );
            receiptDoc.save(`Receipt-${transaction.id}.pdf`);
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
