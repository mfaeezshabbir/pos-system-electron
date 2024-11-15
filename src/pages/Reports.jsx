import React from 'react'
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
  Chip
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { 
  TrendingUp, 
  Inventory, 
  Receipt, 
  Download,
  Category
} from '@mui/icons-material'
import dayjs from 'dayjs'
import useTransactionStore from '../stores/useTransactionStore'
import useInventoryStore from '../stores/useInventoryStore'
import { formatCurrency } from '../utils/formatters'
import { generatePDF } from '../utils/pdfGenerator'

const Reports = () => {
  const [tab, setTab] = React.useState(0)
  const [startDate, setStartDate] = React.useState(dayjs().subtract(7, 'day'))
  const [endDate, setEndDate] = React.useState(dayjs())
  const [realtimeTransactions, setRealtimeTransactions] = React.useState([])

  const { getSalesSummary, getPaymentMethodSummary, transactions } = useTransactionStore()
  const { products, categories } = useInventoryStore()

  // Subscribe to transaction updates
  React.useEffect(() => {
    setRealtimeTransactions(transactions);

    const unsubscribe = useTransactionStore.subscribe(
      (state, prevState) => {
        if (state.transactions.length !== prevState.transactions.length) {
          setRealtimeTransactions(state.transactions);
          // Recalculate sales data if the new transaction is within the selected date range
          const newTransaction = state.transactions[0];
          if (newTransaction && 
              dayjs(newTransaction.timestamp).isAfter(startDate) && 
              dayjs(newTransaction.timestamp).isBefore(endDate)) {
            // Force re-render with new data
            setRealtimeTransactions([...state.transactions]);
          }
        }
      }
    );

    return () => unsubscribe();
  }, [transactions, startDate, endDate]);

  const salesData = getSalesSummary(startDate, endDate) || {
    totalRevenue: 0,
    netSales: 0,
    taxAmount: 0,
    discountAmount: 0,
    transactionCount: 0
  }

  const paymentData = getPaymentMethodSummary(startDate, endDate) || {}

  // Get low stock products
  const lowStockProducts = products.filter(p => p.stock <= 10)

  // Get top selling products
  const topSellingProducts = products
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    .slice(0, 5)

  const handleExport = () => {
    generatePDF({
      salesData,
      paymentData,
      dateRange: { startDate, endDate }
    })
  }

  const renderSalesReport = () => (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={1}>
            <TrendingUp color="primary" />
            <Typography variant="h6">{formatCurrency(salesData.totalRevenue)}</Typography>
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
          <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {realtimeTransactions
                  .filter(transaction => 
                    dayjs(transaction.timestamp).isAfter(startDate) && 
                    dayjs(transaction.timestamp).isBefore(endDate)
                  )
                  .slice(0, 10)
                  .map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>{dayjs(transaction.timestamp).format('DD/MM/YYYY HH:mm')}</TableCell>
                      <TableCell>{transaction.customerName}</TableCell>
                      <TableCell>{transaction.items.length} items</TableCell>
                      <TableCell align="right">{formatCurrency(transaction.total)}</TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.status}
                          color={transaction.status === 'completed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  )

  const renderInventoryReport = () => (
    <Grid container spacing={3}>
      {/* Top Selling Products */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Top Selling Products</Typography>
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
                {topSellingProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell align="right">{product.soldCount || 0}</TableCell>
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
          <Typography variant="h6" gutterBottom>Low Stock Alert</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Current Stock</TableCell>
                  <TableCell>Category</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lowStockProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell align="right">
                      <Typography color="error">{product.stock}</Typography>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  )

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4">Reports</Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleExport}
        >
          Export Report
        </Button>
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

      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Sales Report" />
        <Tab label="Inventory Report" />
      </Tabs>

      {tab === 0 ? renderSalesReport() : renderInventoryReport()}
    </Box>
  )
}

export default Reports