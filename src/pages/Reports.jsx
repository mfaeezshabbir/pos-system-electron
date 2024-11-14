import React from 'react'
import { 
  Box, 
  Paper, 
  Typography,
  Grid,
  TextField,
  Button
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import useTransactionStore from '../stores/useTransactionStore'
import { formatCurrency } from '../utils/formatters'
import { generatePDF } from '../utils/pdfGenerator'

const Reports = () => {
  const [startDate, setStartDate] = React.useState(dayjs())
  const [endDate, setEndDate] = React.useState(dayjs())
  
  const { getSalesSummary, getPaymentMethodSummary } = useTransactionStore()
  
  const salesData = getSalesSummary(startDate, endDate)
  const paymentData = getPaymentMethodSummary(startDate, endDate)

  const handleExport = () => {
    generatePDF({
      salesData,
      paymentData,
      dateRange: { startDate, endDate }
    })
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Sales Reports</Typography>

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
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              onClick={handleExport}
            >
              Export Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Sales Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Sales Summary</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography color="textSecondary">Total Revenue</Typography>
              <Typography variant="h4">
                {formatCurrency(salesData.totalRevenue)}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography color="textSecondary">Net Sales</Typography>
              <Typography variant="h5">
                {formatCurrency(salesData.netSales)}
              </Typography>
            </Box>
            <Box>
              <Typography color="textSecondary">Transaction Count</Typography>
              <Typography variant="h5">
                {salesData.transactionCount}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Payment Methods</Typography>
            {Object.entries(paymentData).map(([method, data]) => (
              <Box key={method} sx={{ mb: 2 }}>
                <Typography color="textSecondary">{method}</Typography>
                <Typography>
                  {formatCurrency(data.total)} ({data.count} transactions)
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Reports 