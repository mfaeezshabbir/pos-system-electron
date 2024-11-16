import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useSettingsStore from "./stores/useSettingsStore";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ROLES } from "./stores/useAuthStore";
import { PERMISSIONS } from "./hooks/usePermissions";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pos from "./pages/Pos";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Customers from "./pages/Customers";
import Profile from "./pages/Profile";

// Components
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Toast from "./components/common/Toast";
import React from "react";
import useCustomerStore from "./stores/useCustomerStore";
import useDashboardStore from "./stores/useDashboardStore";
import useInventoryStore from "./stores/useInventoryStore";
import { initDB } from "./utils/db";
import { CircularProgress, Box } from "@mui/material";
import useTransactionStore from "./stores/useTransactionStore";
import { dbOperations } from "./utils/db";
import useSyncStore from "./stores/useSyncStore";

function App() {
  const [dbInitialized, setDbInitialized] = React.useState(false);
  const { systemSettings } = useSettingsStore();

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: systemSettings?.theme || "light",
        },
      }),
    [systemSettings?.theme]
  );

  React.useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        // Initialize database and wait for completion
        const db = await initDB();

        if (!mounted) return;

        // Initialize stores sequentially
        await useSettingsStore.getState().initializeSettings();
        if (!mounted) return;

        await useCustomerStore.getState().initializeCustomers();
        if (!mounted) return;

        await useDashboardStore.getState().initializeDashboard();
        if (!mounted) return;

        await useInventoryStore.getState().initializeInventory();
        if (!mounted) return;

        await useDashboardStore.getState().scheduleDailyReset();
        if (!mounted) return;

        await dbOperations.getAllUsers();

        setDbInitialized(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    useSyncStore.getState().initSync();
    
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
          type: 'classic'
        }).then(registration => {
          console.log('ServiceWorker registration successful');
        }).catch(error => {
          console.error('ServiceWorker registration failed:', error);
        });
      });
    }
  }, []);

  if (!dbInitialized) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/pos"
                element={
                  <ProtectedRoute requiredRole={ROLES.CASHIER}>
                    <Pos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute requiredRole={ROLES.MANAGER}>
                    <Inventory />
                  </ProtectedRoute>
                }
              />
              <Route path="/reports" element={<Reports />} />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute
                    requiredPermission={PERMISSIONS.MANAGE_BUSINESS_INFO}
                  >
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute roles={[ROLES.ADMIN, ROLES.MANAGER]}>
                    <Customers />
                  </ProtectedRoute>
                }
              />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toast />
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
