import React from 'react'
import { 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material'
import {
  TrendingUp,
  Inventory,
  ShoppingCart,
  Warning
} from '@mui/icons-material'
import useTransactionStore from '../stores/useTransactionStore'
import useInventoryStore from '../stores/useInventoryStore'
import { formatCurrency } from '../utils/formatters'
import useAuthStore, { ROLES } from '../stores/useAuthStore'
import useDashboardStore from '../stores/useDashboardStore'

const DashboardCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography color="textSecondary" variant="h6">
          {title}
        </Typography>
        {icon}
      </Box>
      <Typography variant="h4">{value}</Typography>
    </CardContent>
  </Card>
)

const Dashboard = () => {
  const { currentUser } = useAuthStore()
  const { todaySales, todayTransactions, recentTransactions } = useDashboardStore()
  const { products, getLowStockProducts } = useInventoryStore()
  
  const lowStockItems = getLowStockProducts()
  const isCashier = currentUser?.role === ROLES.CASHIER

  // Reset daily stats at midnight
  React.useEffect(() => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const timeUntilMidnight = tomorrow - now
    
    const timer = setTimeout(() => {
      useDashboardStore.getState().resetDailyStats()
    }, timeUntilMidnight)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Dashboard</Typography>
      
      <Grid container spacing={3}>
        {/* Sales Summary - Only visible to admin and manager */}
        {!isCashier && (
          <Grid item xs={12} md={3}>
            <DashboardCard
              title="Today's Sales"
              value={formatCurrency(todaySales)}
              icon={<TrendingUp color="primary" />}
            />
          </Grid>
        )}

        <Grid item xs={12} md={3}>
          <DashboardCard
            title="Total Products"
            value={products.length}
            icon={<Inventory color="secondary" />}
          />
        </Grid>

        {!isCashier && (
          <Grid item xs={12} md={3}>
            <DashboardCard
              title="Today's Transactions"
              value={todayTransactions}
              icon={<ShoppingCart color="success" />}
            />
          </Grid>
        )}

        <Grid item xs={12} md={3}>
          <DashboardCard
            title="Low Stock Items"
            value={lowStockItems.length}
            icon={<Warning color="error" />}
          />
        </Grid>

        {/* Recent Transactions - Only visible to admin and manager */}
        {!isCashier && (
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Transactions
              </Typography>
              {recentTransactions.map(transaction => (
                <Box 
                  key={transaction.id}
                  sx={{ 
                    p: 2, 
                    mb: 1, 
                    border: '1px solid #eee',
                    borderRadius: 1
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        ID: #{transaction.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2">
                        {formatCurrency(transaction.total)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2">
                        {transaction.timestamp.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default Dashboard 