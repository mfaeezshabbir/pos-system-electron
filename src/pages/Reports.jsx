import React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  TrendingUp,
  Inventory,
  Receipt,
  Download,
  Category,
  DeleteForever,
  CheckCircle,
  Payment,
} from "@mui/icons-material";
import dayjs from "dayjs";
import useTransactionStore from "../stores/useTransactionStore";
import useInventoryStore from "../stores/useInventoryStore";
import { formatCurrency } from "../utils/formatters";
import { generatePDF, generateReceipt } from "../utils/pdfGenerator";
import useDashboardStore from "../stores/useDashboardStore";
import useNotificationStore from "../stores/useNotificationStore";
import ReceiptPreviewDialog from "../components/POS/ReceiptPreviewDialog";
import useSettingsStore from "../stores/useSettingsStore";
import { handleTransactionStatusUpdate } from "../utils/transactionHelpers";
import useSyncStore from "../stores/useSyncStore";

const Reports = () => {
  const [tab, setTab] = React.useState(0);
  const [startDate, setStartDate] = React.useState(dayjs().subtract(7, "day"));
  const [endDate, setEndDate] = React.useState(dayjs());
  const [filteredTransactions, setFilteredTransactions] = React.useState([]);
  const [stockAdjustmentDialog, setStockAdjustmentDialog] = React.useState({
    open: false,
    product: null,
  });
  const [adjustmentQuantity, setAdjustmentQuantity] = React.useState(0);
  const [adjustmentReason, setAdjustmentReason] = React.useState("");
  const [selectedReceipt, setSelectedReceipt] = React.useState(null);
  const [groupedTransactions, setGroupedTransactions] = React.useState({});

  const {
    getSalesSummary,
    getPaymentMethodSummary,
    transactions,
    loadTransactions,
    clearAllTransactions,
    updateTransactionStatus,
  } = useTransactionStore();
  const { products, categories } = useInventoryStore();

  // Load initial transactions and handle updates
  React.useEffect(() => {
    const init = async () => {
      await loadTransactions();
      const initialTransactions = useTransactionStore.getState().transactions;
      const grouped = filterAndSetTransactions(initialTransactions);
      setGroupedTransactions(grouped);
    };
    init();

    const unsubscribe = useTransactionStore.subscribe((state, prevState) => {
      if (state.transactions !== prevState?.transactions) {
        const grouped = filterAndSetTransactions(state.transactions);
        setGroupedTransactions(grouped);
      }
    });

    return () => unsubscribe();
  }, [startDate, endDate]);

  // Helper function to filter transactions
  const filterAndSetTransactions = React.useCallback(
    (transactions) => {
      const filtered = transactions.filter((transaction) => {
        const transactionDate = dayjs(transaction.timestamp);
        return (
          transactionDate.isSameOrAfter(startDate, "day") &&
          transactionDate.isSameOrBefore(endDate, "day")
        );
      });

      // Group transactions by payment status
      const grouped = filtered.reduce((acc, transaction) => {
        const status = transaction.status;
        acc[status] = acc[status] || [];
        acc[status].push(transaction);
        return acc;
      }, {});

      setFilteredTransactions(filtered);
      return grouped;
    },
    [startDate, endDate]
  );

  const salesData = getSalesSummary(startDate, endDate) || {
    totalRevenue: 0,
    netSales: 0,
    taxAmount: 0,
    discountAmount: 0,
    transactionCount: 0,
  };

  const paymentData = getPaymentMethodSummary(startDate, endDate) || {};

  // Get low stock products
  const lowStockProducts = products.filter((p) => p.stock <= 10);

  // Get top selling products
  const topSellingProducts = products
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    .slice(0, 5);

  const handleExport = () => {
    generatePDF({
      salesData,
      paymentData,
      dateRange: { startDate, endDate },
    });
  };

  const handleClearTransactions = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear ALL transaction records? This action cannot be undone."
    );

    if (confirmed) {
      const success = await clearAllTransactions();
      if (success) {
        // Reset dashboard stats
        const dashboardStore = useDashboardStore.getState();
        await dashboardStore.resetDailyStats();
        await dashboardStore.updateSalesData();

        // Broadcast the update to other tabs
        useSyncStore.getState().broadcastUpdate("TRANSACTION_UPDATE", {
          action: "clear",
        });

        // Clear local state
        setFilteredTransactions([]);

        // Show notification
        useNotificationStore.getState().addNotification({
          message: "All transactions have been cleared",
          type: "success",
        });
      }
    }
  };

  const handleStockAdjustment = (product) => {
    setStockAdjustmentDialog({
      open: true,
      product,
    });
  };

  const handleStockAdjustmentClose = () => {
    setStockAdjustmentDialog({
      open: false,
      product: null,
    });
  };

  const handleStockAdjustmentSubmit = async (productId, quantity, reason) => {
    const success = await useInventoryStore
      .getState()
      .adjustStock(productId, quantity, reason);

    if (success) {
      useNotificationStore.getState().addNotification({
        type: "success",
        message: "Stock adjusted successfully",
      });
      handleStockAdjustmentClose();
    }
  };

  const handleToggleStatus = async (transaction) => {
    if (!transaction?.id) {
      useNotificationStore.getState().addNotification({
        type: "error",
        message: "Invalid transaction",
      });
      return;
    }

    const newStatus =
      transaction.status === "completed" ? "unpaid" : "completed";
    const success = await updateTransactionStatus(transaction.id, newStatus);

    if (success) {
      useNotificationStore.getState().addNotification({
        type: "success",
        message: `Transaction marked as ${newStatus}`,
      });
    } else {
      useNotificationStore.getState().addNotification({
        type: "error",
        message: "Failed to update transaction status",
      });
    }
  };

  const handleViewReceipt = (transaction) => {
    setSelectedReceipt(transaction);
  };

  const handlePrint = async (transaction) => {
    try {
      if (!transaction) {
        console.error("Transaction is undefined");
        useNotificationStore.getState().addNotification({
          type: "error",
          message: "Invalid transaction data",
        });
        return;
      }

      const { receiptSettings } = useSettingsStore.getState();

      // Use business details from transaction with safe access
      const enrichedTransaction = {
        ...transaction,
        items: transaction?.items || [],
        timestamp: transaction?.timestamp
          ? new Date(transaction.timestamp)
          : new Date(),
        businessName: transaction?.businessDetails?.name || "Business Name",
        businessAddress: transaction?.businessDetails?.address || "",
        businessPhone: transaction?.businessDetails?.phone || "",
        businessEmail: transaction?.businessDetails?.email || "",
        businessWebsite: transaction?.businessDetails?.website || "",
        businessTaxId: transaction?.businessDetails?.taxId || "",
      };

      const doc = generateReceipt(enrichedTransaction, receiptSettings);
      const fileName = `Receipt-${transaction?.id || Date.now()}.pdf`;
      doc.save(fileName);

      useNotificationStore.getState().addNotification({
        type: "success",
        message: "Receipt generated successfully",
      });
    } catch (error) {
      console.error("Error printing receipt:", error);
      useNotificationStore.getState().addNotification({
        type: "error",
        message: "Failed to generate receipt",
      });
    }
  };

  const renderSalesReport = () => (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={1}>
            <TrendingUp color="primary" />
            <Typography variant="h6">
              {formatCurrency(salesData.totalRevenue)}
            </Typography>
            <Typography color="text.secondary">Total Revenue</Typography>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Receipt color="success" />
            <Typography variant="h6">{salesData.transactionCount}</Typography>
            <Typography color="text.secondary">Transactions</Typography>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Category color="warning" />
            <Typography variant="h6">{categories.length}</Typography>
            <Typography color="text.secondary">Categories</Typography>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Inventory color="error" />
            <Typography variant="h6">{lowStockProducts.length}</Typography>
            <Typography color="text.secondary">Low Stock Items</Typography>
          </Stack>
        </Paper>
      </Grid>

      {/* Transaction History */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Transactions
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.slice(0, 10).map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    onClick={() => handleViewReceipt(transaction)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <TableCell>
                      {dayjs(transaction.timestamp).format("DD/MM/YYYY HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">
                          {transaction.customerName}
                        </Typography>
                        {transaction.customerPhone && (
                          <Typography variant="caption" color="text.secondary">
                            {transaction.customerPhone}
                          </Typography>
                        )}
                        {transaction.paymentMethod === "khata" &&
                          transaction.customerAddress && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {transaction.customerAddress}
                            </Typography>
                          )}
                      </Stack>
                    </TableCell>
                    <TableCell>{transaction.items.length} items</TableCell>
                    <TableCell align="right">
                      {formatCurrency(transaction.total)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.paymentMethod}
                        color={
                          transaction.paymentMethod === "khata"
                            ? "warning"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={
                          transaction.status === "completed"
                            ? "success"
                            : "warning"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {transaction.paymentMethod === "khata" && (
                        <Button
                          size="small"
                          variant={
                            transaction.status === "completed"
                              ? "outlined"
                              : "contained"
                          }
                          color={
                            transaction.status === "completed"
                              ? "success"
                              : "primary"
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(transaction);
                          }}
                          startIcon={
                            transaction.status === "completed" ? (
                              <CheckCircle />
                            ) : (
                              <Payment />
                            )
                          }
                        >
                          {transaction.status === "completed"
                            ? "Paid"
                            : "Mark as Paid"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      <PaymentStatusSummary />
    </Grid>
  );

  const PaymentStatusSummary = () => {
    return (
      <Grid item xs={12}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Payment Status Summary
          </Typography>
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="subtitle2" color="success.main">
                Paid Transactions
              </Typography>
              <Typography variant="h4">
                {groupedTransactions.completed?.length || 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="warning.main">
                Pending Payments
              </Typography>
              <Typography variant="h4">
                {groupedTransactions.unpaid?.length || 0}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Grid>
    );
  };

  const renderInventoryReport = () => (
    <Grid container spacing={3}>
      {/* Top Selling Products */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Top Selling Products
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Units Sold</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topSellingProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell align="right">
                      {product.soldCount || 0}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency((product.soldCount || 0) * product.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {/* Low Stock Products */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Low Stock Alert</Typography>
            <Chip
              label={`${lowStockProducts.length} items`}
              color="warning"
              size="small"
            />
          </Box>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Current Stock</TableCell>
                  <TableCell align="right">Min Stock</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lowStockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell align="right">
                      <Typography
                        color={product.stock === 0 ? "error" : "warning.main"}
                        fontWeight="medium"
                      >
                        {product.stock}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{product.minStock}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStockAdjustment(product)}
                      >
                        Adjust Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const StockAdjustmentDialog = () => (
    <Dialog
      open={stockAdjustmentDialog.open}
      onClose={handleStockAdjustmentClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Adjust Stock</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="subtitle2">
            Product: {stockAdjustmentDialog.product?.name}
          </Typography>
          <Typography variant="body2">
            Current Stock: {stockAdjustmentDialog.product?.stock}
          </Typography>
          <TextField
            label="Adjustment Quantity"
            type="number"
            fullWidth
            helperText="Use negative values for stock reduction"
            value={adjustmentQuantity}
            onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value))}
          />
          <TextField
            label="Reason"
            fullWidth
            multiline
            rows={2}
            value={adjustmentReason}
            onChange={(e) => setAdjustmentReason(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleStockAdjustmentClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() =>
            handleStockAdjustmentSubmit(
              stockAdjustmentDialog.product?.id,
              adjustmentQuantity,
              adjustmentReason
            )
          }
        >
          Adjust Stock
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Typography variant="h4">Reports</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForever />}
            onClick={handleClearTransactions}
          >
            Clear All Transactions
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
          >
            Export Report
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Sales Report" />
        <Tab label="Inventory Report" />
      </Tabs>

      {tab === 0 ? renderSalesReport() : renderInventoryReport()}

      <StockAdjustmentDialog />

      <ReceiptPreviewDialog
        open={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        transaction={selectedReceipt}
        onPrint={handlePrint}
      />
    </Box>
  );
};

export default Reports;
