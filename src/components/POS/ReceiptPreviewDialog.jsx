import React from 'react';
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
  Paper
} from '@mui/material';
import { Print, Save, Close } from '@mui/icons-material';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import { generateReceipt } from '../../utils/pdfGenerator';

const ReceiptPreviewDialog = ({ open, onClose, transaction, onPrint }) => {
  if (!transaction) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Receipt Preview</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            #{transaction.id}
          </Typography>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Stack spacing={2}>
            {/* Header */}
            <Box textAlign="center">
              <Typography variant="h6">{transaction.businessName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {transaction.businessAddress}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {transaction.businessPhone}
              </Typography>
            </Box>

            <Divider />

            {/* Transaction Info */}
            <Box>
              <Typography variant="body2">
                Date: {formatDate(transaction.timestamp)}
              </Typography>
              <Typography variant="body2">
                Time: {formatTime(transaction.timestamp)}
              </Typography>
              <Typography variant="body2">
                Customer: {transaction.customerName}
              </Typography>
            </Box>

            <Divider />

            {/* Items */}
            <Stack spacing={1}>
              {transaction.items.map((item, index) => (
                <Box key={index}>
                  <Typography variant="body2">{item.name}</Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {item.quantity} x {formatCurrency(item.price)}
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(item.quantity * item.price)}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>

            <Divider />

            {/* Totals */}
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Subtotal</Typography>
                <Typography>{formatCurrency(transaction.subtotal)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Tax</Typography>
                <Typography>{formatCurrency(transaction.taxAmount)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">{formatCurrency(transaction.total)}</Typography>
              </Stack>
            </Stack>

            {/* Payment Details */}
            <Box>
              <Typography variant="body2">
                Payment Method: {transaction.paymentMethod.toUpperCase()}
              </Typography>
              {transaction.paymentMethod === 'cash' && (
                <>
                  <Typography variant="body2">
                    Amount Paid: {formatCurrency(transaction.amountPaid)}
                  </Typography>
                  {transaction.change > 0 && (
                    <Typography variant="body2">
                      Change: {formatCurrency(transaction.change)}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Stack>
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<Close />}>
          Close
        </Button>
        <Button
          onClick={onPrint}
          variant="contained"
          startIcon={<Print />}
          color="primary"
        >
          Print
        </Button>
        <Button
          onClick={() => {
            const receiptDoc = generateReceipt(transaction);
            receiptDoc.save(`receipt_${transaction.id}.pdf`);
          }}
          variant="outlined"
          startIcon={<Save />}
        >
          Save PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptPreviewDialog; 