import React from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
  Divider
} from '@mui/material'
import {
  Dashboard,
  ShoppingCart,
  Inventory,
  Assessment,
  Settings
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import useSettingsStore from '../stores/useSettingsStore'
import useAuthStore from '../stores/useAuthStore'
import { ROLES } from '../stores/useAuthStore'
import { usePermissions } from '../hooks/usePermissions'

const DRAWER_WIDTH = 240

const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <Dashboard />, 
    path: '/dashboard',
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] 
  },
  { 
    text: 'POS', 
    icon: <ShoppingCart />, 
    path: '/pos',
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] 
  },
  { 
    text: 'Inventory', 
    icon: <Inventory />, 
    path: '/inventory',
    roles: [ROLES.ADMIN, ROLES.MANAGER] 
  },
  { 
    text: 'Reports', 
    icon: <Assessment />, 
    path: '/reports',
    roles: [ROLES.ADMIN, ROLES.MANAGER] 
  },
  { 
    text: 'Settings', 
    icon: <Settings />, 
    path: '/settings',
    roles: [ROLES.ADMIN, ROLES.MANAGER] 
  }
]

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuthStore()
  const businessInfo = useSettingsStore(state => state.businessInfo)

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(currentUser?.role)
  )

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {businessInfo.logo ? (
          <img 
            src={businessInfo.logo} 
            alt="Business Logo" 
            style={{ width: '100%', height: 'auto', maxHeight: 60 }}
          />
        ) : (
          <Typography variant="h6" noWrap component="div">
            {businessInfo.name || 'POS System'}
          </Typography>
        )}
      </Box>

      <Divider />

      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  )
}

export default Sidebar 