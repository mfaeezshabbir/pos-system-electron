import React from 'react'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Tooltip,
  ListItemIcon,
  Divider,
  Popover,
  List,
  ListItem,
  ListItemText,
  Button
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications,
  DarkMode,
  LightMode,
  Settings,
  Logout,
  Person,
  MarkEmailRead,
  CheckCircleOutline
} from '@mui/icons-material'
import useAuthStore from '../stores/useAuthStore'
import useSettingsStore from '../stores/useSettingsStore'
import { useNavigate } from 'react-router-dom'
import useNotificationStore from '../stores/useNotificationStore'

const Header = () => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [notificationAnchor, setNotificationAnchor] = React.useState(null)
  const { currentUser, logout } = useAuthStore()
  const { systemSettings, updateSystemSettings } = useSettingsStore()
  const navigate = useNavigate()
  const { notifications, markAsRead, markAllAsRead, getVisibleNotifications } = useNotificationStore()
  const visibleNotifications = getVisibleNotifications()
  const unreadCount = notifications.filter(n => !n.read).length

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationClose = () => {
    setNotificationAnchor(null)
  }

  const handleLogout = () => {
    logout()
    handleClose()
    navigate('/login')
  }

  const handleProfile = () => {
    navigate('/profile')
    handleClose()
  }

  const handleSettings = () => {
    navigate('/settings')
    handleClose()
  }

  const toggleTheme = () => {
    updateSystemSettings({
      ...systemSettings,
      theme: systemSettings.theme === 'light' ? 'dark' : 'light'
    })
  }

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          POS System
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Toggle theme">
            <IconButton color="inherit" onClick={toggleTheme}>
              {systemSettings.theme === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Account settings">
            <IconButton onClick={handleMenu} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {currentUser?.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
          >
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>

          <Popover
            open={Boolean(notificationAnchor)}
            anchorEl={notificationAnchor}
            onClose={handleNotificationClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Box sx={{ width: 300, maxHeight: 400 }}>
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                borderBottom: 1, 
                borderColor: 'divider' 
              }}>
                <Typography variant="subtitle1">Notifications</Typography>
                {unreadCount > 0 && (
                  <Button
                    size="small"
                    startIcon={<MarkEmailRead />}
                    onClick={() => {
                      markAllAsRead()
                      handleNotificationClose()
                    }}
                  >
                    Mark all as read
                  </Button>
                )}
              </Box>
              <List sx={{ maxHeight: 320, overflow: 'auto' }}>
                {visibleNotifications.length > 0 ? (
                  visibleNotifications.map((notification) => (
                    <ListItem
                      key={notification.id}
                      sx={{
                        bgcolor: notification.read ? 'inherit' : 'action.hover',
                        borderBottom: 1,
                        borderColor: 'divider'
                      }}
                      secondaryAction={
                        !notification.read && (
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircleOutline />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemText
                        primary={notification.message}
                        secondary={new Date(notification.timestamp).toLocaleString()}
                        sx={{
                          '& .MuiListItemText-secondary': {
                            fontSize: '0.75rem',
                          }
                        }}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No notifications"
                      sx={{ textAlign: 'center', color: 'text.secondary' }}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          </Popover>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header 