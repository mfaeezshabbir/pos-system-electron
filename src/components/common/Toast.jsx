import React from 'react'
import { Snackbar, Alert } from '@mui/material'
import useNotificationStore from '../../stores/useNotificationStore'

const Toast = () => {
  const notifications = useNotificationStore(state => 
    state.notifications.filter(n => !n.read)
  )

  return (
    <>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={!notification.read}
          autoHideDuration={3000}
          onClose={() => useNotificationStore.getState().markAsRead(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ mb: index * 8 }}
        >
          <Alert 
            severity={notification.type}
            variant="filled"
            elevation={6}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  )
}

export default Toast 