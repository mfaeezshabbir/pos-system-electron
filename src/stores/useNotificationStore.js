import { create } from 'zustand'

const useNotificationStore = create((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const newNotification = {
      id: Date.now(),
      type: notification.type || 'info',
      message: notification.message,
      read: false,
      timestamp: new Date().getTime()
    }

    set(state => ({
      notifications: [newNotification, ...state.notifications]
    }))

    setTimeout(() => {
      get().markAsRead(newNotification.id)
    }, 3000)
  },

  markAsRead: (notificationId) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    }))
  },

  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true }))
    }))
  },

  getVisibleNotifications: () => {
    const state = get()
    return state.notifications.filter(n => !n.read)
  }
}))

export default useNotificationStore 