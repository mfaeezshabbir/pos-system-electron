import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  Divider,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  TrendingUp,
  Inventory,
  ShoppingCart,
  Warning,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import useTransactionStore from "../stores/useTransactionStore";
import useInventoryStore from "../stores/useInventoryStore";
import { formatCurrency } from "../utils/formatters";
import useAuthStore, { ROLES } from "../stores/useAuthStore";
import useDashboardStore from "../stores/useDashboardStore";
import dayjs from "dayjs";

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "primary",
}) => (
  <Card
    elevation={2}
    sx={{
      bgcolor: "background.paper",
      borderRadius: 2,
      transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: 4,
      },
    }}
  >
    <CardContent>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              p: 2,
              boxShadow: 1,
            }}
          >
            {icon}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {value}
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {title}
            </Typography>
          </Box>
        </Stack>

        {trend && (
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                bgcolor: trend > 0 ? "success.lighter" : "error.lighter",
                color: trend > 0 ? "success.dark" : "error.dark",
                py: 0.5,
                px: 1,
                borderRadius: 1,
                width: "fit-content",
              }}
            >
              {trend > 0 ? (
                <ArrowUpward fontSize="small" />
              ) : (
                <ArrowDownward fontSize="small" />
              )}
              <Typography variant="body2" fontWeight="medium">
                {Math.abs(trend)}%
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              vs last month
            </Typography>
          </Box>
        )}
      </Stack>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { currentUser } = useAuthStore();
  const { todaySales, todayTransactions, updateSalesData } =
    useDashboardStore();
  const { products, getLowStockProducts } = useInventoryStore();
  const [recentTransactions, setRecentTransactions] = React.useState([]);
  const [trends, setTrends] = React.useState({
    sales: 0,
    products: 0,
    transactions: 0,
  });
  const [loading, setLoading] = React.useState(true);

  const lowStockItems = getLowStockProducts();
  const isCashier = currentUser?.role === ROLES.CASHIER;

  // Calculate trends
  React.useEffect(() => {
    const calculateTrends = async () => {
      const transactionStore = useTransactionStore.getState();
      const today = dayjs();
      const lastMonth = today.subtract(1, "month");

      // Get current month's data
      const currentMonthData = transactionStore.getSalesSummary(
        today.startOf("month"),
        today.endOf("month")
      );

      // Get last month's data
      const lastMonthData = transactionStore.getSalesSummary(
        lastMonth.startOf("month"),
        lastMonth.endOf("month")
      );

      // Calculate trends
      const salesTrend =
        lastMonthData.totalRevenue === 0
          ? 100
          : ((currentMonthData.totalRevenue - lastMonthData.totalRevenue) /
              lastMonthData.totalRevenue) *
            100;

      const transactionsTrend =
        lastMonthData.transactionCount === 0
          ? 100
          : ((currentMonthData.transactionCount -
              lastMonthData.transactionCount) /
              lastMonthData.transactionCount) *
            100;

      // Calculate product trend
      const previousProducts = await useInventoryStore
        .getState()
        .getProductCountByDate(lastMonth.endOf("month"));
      const currentProducts = products.length;
      const productsTrend =
        previousProducts === 0
          ? 100
          : ((currentProducts - previousProducts) / previousProducts) * 100;

      setTrends({
        sales: Number(salesTrend.toFixed(1)),
        products: Number(productsTrend.toFixed(1)),
        transactions: Number(transactionsTrend.toFixed(1))
      });
    };

    calculateTrends();
    
    // Recalculate trends when transactions change
    const unsubscribe = useTransactionStore.subscribe(
      (state) => state.transactions,
      () => calculateTrends()
    );

    return () => unsubscribe();
  }, [products.length]);

  // Load initial data and subscribe to updates
  React.useEffect(() => {
    const init = async () => {
      setLoading(true);

      // Initialize dashboard first
      await useDashboardStore.getState().initializeDashboard();

      // Load transactions only if not already loaded
      const transactionStore = useTransactionStore.getState();
      if (!transactionStore.transactions.length) {
        await transactionStore.loadTransactions();
      }

      // Set recent transactions
      setRecentTransactions(transactionStore.transactions.slice(0, 5));
      setLoading(false);
    };

    init();

    const unsubscribe = useTransactionStore.subscribe((state, prevState) => {
      if (state.transactions !== prevState?.transactions) {
        setRecentTransactions(state.transactions.slice(0, 5));
      }
    });

    return () => unsubscribe();
  }, []);

  // Reset stats at midnight
  React.useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow - now;

    const timer = setTimeout(() => {
      useDashboardStore.getState().resetDailyStats();
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  // Add this effect after the existing useEffects
  React.useEffect(() => {
    const loadTransactionData = async () => {
      setLoading(true);
      try {
        // Load initial transactions
        const transactionStore = useTransactionStore.getState();
        await transactionStore.loadTransactions();
        
        // Get recent transactions
        const transactions = transactionStore.transactions
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5);
        
        setRecentTransactions(transactions);
        
        // Update sales data
        await updateSalesData();
        
      } catch (error) {
        console.error('Error loading transaction data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactionData();

    // Subscribe to transaction store changes
    const unsubscribe = useTransactionStore.subscribe(
      (state) => state.transactions,
      (transactions) => {
        const recentTxs = transactions
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5);
        setRecentTransactions(recentTxs);
        updateSalesData();
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
        <IconButton>
          <MoreVert />
        </IconButton>
      </Stack>

      <Grid container spacing={3}>
        {!isCashier && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Today's Sales"
              value={formatCurrency(todaySales)}
              icon={<TrendingUp />}
              trend={trends.sales}
              color="primary"
            />
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={products.length}
            icon={<Inventory />}
            trend={trends.products}
            color="secondary"
          />
        </Grid>

        {!isCashier && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Today's Transactions"
              value={todayTransactions}
              icon={<ShoppingCart />}
              trend={trends.transactions}
              color="success"
            />
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={lowStockItems.length}
            icon={<Warning />}
            color="error"
          />
        </Grid>

        {!isCashier && (
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Recent Transactions
              </Typography>
              <List>
                {recentTransactions.map((transaction) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem
                      secondaryAction={
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="subtitle1" fontWeight="bold">
                            {formatCurrency(transaction.total)}
                          </Typography>
                          {transaction.paymentMethod === "khata" && (
                            <Chip
                              size="small"
                              label={
                                transaction.status === "completed"
                                  ? "Paid"
                                  : "Unpaid"
                              }
                              color={
                                transaction.status === "completed"
                                  ? "success"
                                  : "warning"
                              }
                              sx={{ minWidth: 80 }}
                            />
                          )}
                        </Stack>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor:
                              transaction.paymentMethod === "khata"
                                ? transaction.status === "completed"
                                  ? "success.light"
                                  : "warning.light"
                                : "primary.light",
                          }}
                        >
                          <ShoppingCart />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography variant="subtitle2">
                              Order #{(transaction.id?.toString() || '').slice(-4)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ({transaction.paymentMethod})
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography variant="body2" color="text.secondary">
                              {new Date(transaction.timestamp).toLocaleString()}
                            </Typography>
                            {transaction.paymentMethod === "khata" && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ({transaction.status})
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
