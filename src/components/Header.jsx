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
  Tooltip,
  ListItemIcon,
  Divider
} from '@mui/material'
import {
  Menu as MenuIcon,
  DarkMode,
  LightMode,
  Settings,
  Logout,
  Person
} from '@mui/icons-material'
import useAuthStore, { ROLES } from '../stores/useAuthStore'
import useSettingsStore from '../stores/useSettingsStore'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const { currentUser, logout } = useAuthStore()
  const { systemSettings, updateSystemSettings } = useSettingsStore()
  const navigate = useNavigate()

  const isAuthorizedForSettings = currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.MANAGER

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
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

          <Tooltip title="Account settings">
            <IconButton onClick={handleMenu} size="small">
              <Avatar 
                src={currentUser?.profilePic}
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: 'primary.main',
                  fontSize: '1rem'
                }}
              >
                {!currentUser?.profilePic && currentUser?.name?.[0]?.toUpperCase()}
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
          >
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            {isAuthorizedForSettings && (
              <MenuItem onClick={handleSettings}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header