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
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp,
  Inventory,
  ShoppingCart,
  Warning,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  Refresh,
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
  icon,
  trend,
  color = "primary",
  loading = false,
}) => (
  <Card
    elevation={0}
    sx={{
      bgcolor: "background.paper",
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
    }}
  >
    <CardContent>
      {loading ? (
        <LinearProgress color={color} sx={{ mb: 2 }} />
      ) : (
        <Stack spacing={2.5}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: `${color}.lighter`,
                color: `${color}.dark`,
                p: 1.5,
              }}
            >
              {icon}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h4" fontWeight={600} sx={{ mb: 0.5 }}>
                {value}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {title}
              </Typography>
            </Box>
          </Stack>

          {trend !== undefined && (
            <Box>
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{
                  bgcolor: trend >= 0 ? "success.lighter" : "error.lighter",
                  color: trend >= 0 ? "success.dark" : "error.dark",
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  width: "fit-content",
                }}
              >
                {trend >= 0 ? (
                  <ArrowUpward sx={{ fontSize: 16 }} />
                ) : (
                  <ArrowDownward sx={{ fontSize: 16 }} />
                )}
                <Typography variant="caption" fontWeight={600}>
                  {Math.abs(trend)}%
                </Typography>
              </Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                vs. last month
              </Typography>
            </Box>
          )}
        </Stack>
      )}
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

      const currentMonthData = transactionStore.getSalesSummary(
        today.startOf("month"),
        today.endOf("month")
      );

      const lastMonthData = transactionStore.getSalesSummary(
        lastMonth.startOf("month"),
        lastMonth.endOf("month")
      );

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
        transactions: Number(transactionsTrend.toFixed(1)),
      });
    };

    calculateTrends();

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
      try {
        await useDashboardStore.getState().initializeDashboard();

        const transactionStore = useTransactionStore.getState();
        if (!transactionStore.transactions.length) {
          await transactionStore.loadTransactions();
        }

        setRecentTransactions(transactionStore.transactions.slice(0, 5));
      } catch (error) {
        console.error("Failed to initialize dashboard:", error);
      } finally {
        setLoading(false);
      }
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

  // Handle transaction data updates
  React.useEffect(() => {
    const loadTransactionData = async () => {
      setLoading(true);
      try {
        const transactionStore = useTransactionStore.getState();
        await transactionStore.loadTransactions();

        const transactions = transactionStore.transactions.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        setRecentTransactions(transactions.slice(0, 5));
        await updateSalesData();
      } catch (error) {
        console.error("Error loading transaction data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactionData();

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
    <Box sx={{ p: 2, height: "100%", overflow: "hidden" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h3" fontWeight="700">
          Dashboard
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={() => updateSalesData()}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <IconButton>
            <MoreVert />
          </IconButton>
        </Stack>
      </Stack>

      <Box sx={{ height: "calc(100% - 80px)", overflow: "auto" }}>
        <Grid container spacing={3}>
          {!isCashier && (
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Today's Sales"
                value={formatCurrency(todaySales)}
                icon={<TrendingUp />}
                trend={trends.sales}
                color="primary"
                loading={loading}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Products"
              value={products.length}
              icon={<Inventory />}
              trend={trends.products}
              color="info"
              loading={loading}
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
                loading={loading}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Low Stock Items"
              value={lowStockItems.length}
              icon={<Warning />}
              color="error"
              loading={loading}
            />
          </Grid>

          {!isCashier && (
            <Grid item xs={12} md={8}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  maxHeight: "calc(100vh - 300px)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Typography variant="h5" fontWeight="700">
                    Recent Transactions
                  </Typography>
                  <Chip
                    label={`${recentTransactions.length} transactions`}
                    color="primary"
                    size="small"
                  />
                </Stack>

                {loading ? (
                  <LinearProgress />
                ) : (
                  <List sx={{ overflow: "auto", flex: 1 }}>
                    {recentTransactions.map((transaction) => (
                      <React.Fragment key={transaction.id}>
                        <ListItem
                          sx={{
                            transition: "background-color 0.2s",
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                            borderRadius: 2,
                            mb: 1,
                          }}
                          secondaryAction={
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              <Typography variant="subtitle1" fontWeight="600">
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
                              variant="rounded"
                              sx={{
                                bgcolor:
                                  transaction.paymentMethod === "khata"
                                    ? transaction.status === "completed"
                                      ? "success.lighter"
                                      : "warning.lighter"
                                    : "primary.lighter",
                                color:
                                  transaction.paymentMethod === "khata"
                                    ? transaction.status === "completed"
                                      ? "success.dark"
                                      : "warning.dark"
                                    : "primary.dark",
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
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="600"
                                >
                                  Order #
                                  {(transaction.id?.toString() || "").slice(-4)}
                                </Typography>
                                <Chip
                                  label={transaction.paymentMethod}
                                  size="small"
                                  variant="outlined"
                                />
                              </Stack>
                            }
                            secondary={
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {new Date(
                                    transaction.timestamp
                                  ).toLocaleString()}
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
                        <Divider component="li" sx={{ my: 1 }} />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
