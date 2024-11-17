import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  Button,
  Grid,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Receipt,
  Print,
  Payment,
  CheckCircle,
  LocalShipping,
  Store,
  AccountBalance,
} from "@mui/icons-material";
import { formatCurrency, formatDate } from "../../utils/formatters";
import useCustomerStore from "../../stores/useCustomerStore";
import useNotificationStore from "../../stores/useNotificationStore";
import { handleTransactionStatusUpdate } from "../../utils/transactionHelpers";

const TransactionHistoryDialog = ({ open, onClose, customer }) => {
  const { updateTransactionPaymentStatus, getCustomerHistory } =
    useCustomerStore();
  const { addNotification } = useNotificationStore();
  const [selectedTransaction, setSelectedTransaction] = React.useState(null);
  const [customerData, setCustomerData] = React.useState(null);

  const getStatusColor = (status, isPaid) => {
    if (status === "completed" || isPaid) {
      return "success";
    }
    switch (status) {
      case "unpaid":
        return "warning";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case "sale":
        return <Store fontSize="small" />;
      case "payment":
        return <Payment fontSize="small" />;
      case "khata":
        return <AccountBalance fontSize="small" />;
      case "delivery":
        return <LocalShipping fontSize="small" />;
      default:
        return null;
    }
  };

  React.useEffect(() => {
    if (customer) {
      setCustomerData(customer);
      refreshCustomerData();
    }
  }, [customer]);

  const refreshCustomerData = async () => {
    if (!customer) return;

    const history = await getCustomerHistory(customer.id);
    if (history) {
      setCustomerData({
        ...customer,
        transactions: history.transactions || [],
        currentCredit: history.analytics?.totalUnpaid || 0,
      });
    }
  };

  if (!customerData) return null;

  const handlePaymentStatusUpdate = async (transaction) => {
    const success = await handleTransactionStatusUpdate(
      transaction,
      customer.id,
      updateTransactionPaymentStatus,
      addNotification
    );

    if (success) {
      await refreshCustomerData();
    }
  };

  const handlePrintReceipt = (transaction) => {
    // You can implement your printing logic here
    // For example, opening a new window with receipt content
    const receiptWindow = window.open("", "_blank");
    receiptWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${transaction.id}</title>
        </head>
        <body>
          <h1>Receipt</h1>
          <p>Date: ${formatDate(transaction.timestamp)}</p>
          <p>Customer: ${customerData.name}</p>
          <p>Amount: ${formatCurrency(
            transaction.total || transaction.amount
          )}</p>
          <p>Status: ${transaction.isPaid ? "Paid" : transaction.status}</p>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.print();
  };

  const handleViewReceipt = (transaction) => {
    setSelectedTransaction(transaction);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Transaction History</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle2" color="text.secondary">
              Total Transactions: {customerData?.transactions?.length || 0}
            </Typography>
            <Typography
              variant="subtitle2"
              color={
                customerData?.currentCredit > 0 ? "error.main" : "success.main"
              }
            >
              Current Balance:{" "}
              {formatCurrency(customerData?.currentCredit || 0)}
            </Typography>
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Customer Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Name:</strong> {customerData.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {customerData.phone}
                </Typography>
                {customerData.address && (
                  <Typography variant="body2">
                    <strong>Address:</strong> {customerData.address}
                  </Typography>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                {customerData.cnic && (
                  <Typography variant="body2">
                    <strong>CNIC:</strong> {customerData.cnic}
                  </Typography>
                )}
                {customerData.email && (
                  <Typography variant="body2">
                    <strong>Email:</strong> {customerData.email}
                  </Typography>
                )}
                {customerData.notes && (
                  <Typography variant="body2">
                    <strong>Notes:</strong> {customerData.notes}
                  </Typography>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!customerData?.transactions?.length ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                customerData.transactions.map((transaction, index) => (
                  <TableRow key={transaction.id || index}>
                    <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {getTransactionTypeIcon(transaction.type)}
                        <Typography>{transaction.type}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(transaction.total || transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.isPaid ? "Paid" : transaction.status}
                        color={getStatusColor(
                          transaction.status,
                          transaction.isPaid
                        )}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        {transaction.type === "khata" && (
                          <Button
                            variant={
                              transaction.isPaid ? "outlined" : "contained"
                            }
                            size="small"
                            color={transaction.isPaid ? "success" : "primary"}
                            onClick={() =>
                              handlePaymentStatusUpdate(transaction)
                            }
                            startIcon={
                              transaction.isPaid ? <CheckCircle /> : <Payment />
                            }
                          >
                            {transaction.isPaid ? "Paid" : "Mark as Paid"}
                          </Button>
                        )}
                        <Tooltip title="Print Receipt">
                          <IconButton
                            size="small"
                            onClick={() => handlePrintReceipt(transaction)}
                          >
                            <Print fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button onClick={refreshCustomerData} color="primary">
          Refresh
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionHistoryDialog;
