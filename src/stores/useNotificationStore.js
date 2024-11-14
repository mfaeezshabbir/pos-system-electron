import { create } from 'zustand'

const useNotificationStore = create((set, get) => ({
    notifications: [
        {
            id: 1,
            message: 'Low stock alert: Item XYZ',
            read: false,
            timestamp: new Date().getTime(),
            readAt: null
        },
        {
            id: 2,
            message: 'Daily sales report available',
            read: false,
            timestamp: new Date().getTime() - 30 * 60 * 1000, // 30 minutes ago
            readAt: null
        },
        {
            id: 3,
            message: 'New order received',
            read: false,
            timestamp: new Date().getTime() - 45 * 60 * 1000, // 45 minutes ago
            readAt: null
        }
    ],

    addNotification: (notification) => {
        set(state => ({
            notifications: [...state.notifications, {
                ...notification,
                read: false,
                timestamp: new Date().getTime(),
                readAt: null
            }]
        }))
    },

    markAsRead: (notificationId) => {
        set(state => ({
            notifications: state.notifications.map(n =>
                n.id === notificationId ? {
                    ...n,
                    read: true,
                    readAt: new Date().getTime()
                } : n
            )
        }))
    },

    markAllAsRead: () => {
        const now = new Date().getTime()
        set(state => ({
            notifications: state.notifications.map(n => ({
                ...n,
                read: true,
                readAt: now
            }))
        }))
    },

    getVisibleNotifications: () => {
        const now = new Date().getTime()
        const oneHour = 60 * 60 * 1000
        return get().notifications.filter(n => {
            if (!n.read) return true
            if (!n.readAt) return true
            return (now - n.readAt) < oneHour
        })
    },

    getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length
    }
}))

export default useNotificationStore 