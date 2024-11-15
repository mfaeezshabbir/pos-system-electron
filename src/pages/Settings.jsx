import React from "react";
import { Box, Paper, Tabs, Tab, Typography, Divider } from "@mui/material";
import BusinessSettings from "../components/Settings/BusinessSettings";
import SystemSettings from "../components/Settings/SystemSettings";
import UserManagement from "../components/Settings/UserManagement";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../hooks/usePermissions";
import useAuthStore, { ROLES } from "../stores/useAuthStore";
import useNotificationStore from "../stores/useNotificationStore";
import PosSettings from "../components/Settings/PosSettings";

const Settings = () => {
  const { hasPermission } = usePermissions();
  const { currentUser } = useAuthStore();
  const [tab, setTab] = React.useState(0);

  const availableTabs = [
    {
      label: "Business Information",
      permission: PERMISSIONS.MANAGE_BUSINESS_INFO,
      component: BusinessSettings,
      roles: [ROLES.ADMIN],
    },
    {
      label: "System Settings",
      permission: PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
      component: SystemSettings,
      roles: [ROLES.ADMIN, ROLES.MANAGER],
    },
    {
      label: "POS Settings",
      permission: PERMISSIONS.MANAGE_POS_SETTINGS,
      component: PosSettings,
      roles: [ROLES.ADMIN, ROLES.MANAGER],
    },
    {
      label: "User Management",
      permission: PERMISSIONS.MANAGE_USERS,
      component: UserManagement,
      roles: [ROLES.ADMIN, ROLES.MANAGER],
    },
  ].filter((tab) => {
    return (
      hasPermission(tab.permission) && tab.roles.includes(currentUser?.role)
    );
  });

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const CurrentTabComponent = availableTabs[tab]?.component;

  const handleSystemSettingsUpdate = (settings) => {
    updateSystemSettings(settings);
    useNotificationStore
      .getState()
      .addSystemUpdateNotification("settings", "System settings updated");
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Settings
      </Typography>

      <Paper>
        <Tabs value={tab} onChange={handleTabChange}>
          {availableTabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>

        <Divider />

        <Box sx={{ p: 3 }}>
          {CurrentTabComponent && <CurrentTabComponent />}
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;
