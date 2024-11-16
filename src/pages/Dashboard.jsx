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

      // Calculate product trend (based on total products vs last month)
      const previousProducts = await useInventoryStore
        .getState()
        .getProductCountByDate(lastMonth.endOf("month"));
      const currentProducts = products.length;
      const productsTrend =
        previousProducts === 0
          ? 100
          : ((currentProducts - previousProducts) / previousProducts) * 100;

      setTrends({
        sales: Math.round(salesTrend),
        products: Math.round(productsTrend),
        transactions: Math.round(transactionsTrend),
      });
    };

    calculateTrends();
  }, [products]);

  // Load initial data and subscribe to updates
  React.useEffect(() => {
    const init = async () => {
      await useTransactionStore.getState().loadTransactions();
      const initialTransactions = useTransactionStore.getState().transactions;

      // Get today's transactions for stats
      const today = dayjs().startOf("day");
      const todayTransactions = initialTransactions.filter((t) =>
        dayjs(t.timestamp).isAfter(today)
      );

      // Reset and calculate fresh daily stats
      useDashboardStore.getState().resetDailyStats();
      todayTransactions.forEach((transaction) => {
        useDashboardStore.getState().updateSalesData(transaction);
      });

      // Set recent transactions
      setRecentTransactions(initialTransactions.slice(0, 5));
    };
    init();

    const unsubscribe = useTransactionStore.subscribe((state, prevState) => {
      // Only update if transactions actually changed
      if (state.transactions !== prevState?.transactions) {
        setRecentTransactions(state.transactions.slice(0, 5));

        // Update today's stats if needed
        const latestTransaction = state.transactions[0];
        if (
          latestTransaction &&
          dayjs(latestTransaction.timestamp).isAfter(dayjs().startOf("day"))
        ) {
          useDashboardStore.getState().updateSalesData(latestTransaction);
        }
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
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "primary.light" }}>
                          <ShoppingCart />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            Order #{transaction.id}
                          </Typography>
                        }
                        secondary={new Date(
                          transaction.timestamp
                        ).toLocaleString()}
                      />
                      <Typography variant="subtitle1" fontWeight="bold">
                        {formatCurrency(transaction.total)}
                      </Typography>
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
