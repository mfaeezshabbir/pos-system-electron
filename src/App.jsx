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

function App() {
  const { systemSettings } = useSettingsStore();

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: systemSettings.theme,
        },
      }),
    [systemSettings.theme]
  );

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
