import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    CASHIER: 'cashier'
}

// Mock users for testing - replace with API in production
const MOCK_USERS = [
    {
        id: '1',
        username: 'a',
        password: '123',
        name: 'Administrator',
        role: ROLES.ADMIN
    },
    {
        id: '2',
        username: 'm',
        password: '123',
        name: 'Manager',
        role: ROLES.MANAGER
    },
    {
        id: '3',
        username: 'c',
        password: '123',
        name: 'Cashier',
        role: ROLES.CASHIER
    }
]

const useAuthStore = create(
    persist(
        (set, get) => ({
            currentUser: null,
            token: null,
            error: null,
            isAuthenticated: false,

            login: async (username, password) => {
                try {
                    // Mock authentication - replace with real API call
                    const user = MOCK_USERS.find(
                        u => u.username === username && u.password === password
                    )

                    if (user) {
                        const { password: _, ...userWithoutPassword } = user
                        set({
                            currentUser: userWithoutPassword,
                            token: 'mock-jwt-token',
                            isAuthenticated: true,
                            error: null
                        })
                        return true
                    }

                    set({ error: 'Invalid credentials' })
                    return false
                } catch (error) {
                    set({ error: 'Authentication failed' })
                    return false
                }
            },

            logout: () => {
                set({
                    currentUser: null,
                    token: null,
                    isAuthenticated: false,
                    error: null
                })
            },

            hasPermission: (requiredRole) => {
                const { currentUser } = get()
                if (!currentUser) return false

                const roleHierarchy = {
                    [ROLES.ADMIN]: 3,
                    [ROLES.MANAGER]: 2,
                    [ROLES.CASHIER]: 1
                }

                const userRoleLevel = roleHierarchy[currentUser.role] || 0
                const requiredRoleLevel = roleHierarchy[requiredRole] || 0

                return userRoleLevel >= requiredRoleLevel
            },

            checkAuth: () => {
                const { currentUser, token, isAuthenticated } = get()
                return !!(currentUser && token && isAuthenticated)
            },

            clearError: () => set({ error: null }),

            updateUserProfile: async (userData) => {
                try {
                    const { currentUser } = get()
                    set({ loading: true, error: null })

                    // Here you would typically make an API call to update the user profile
                    // For now, we'll just update the local state
                    set({
                        currentUser: {
                            ...currentUser,
                            name: userData.name,
                            profilePic: userData.profilePic
                        },
                        loading: false
                    })

                    return true
                } catch (error) {
                    set({ error: error.message, loading: false })
                    throw error
                }
            }
        }),
        {
            name: 'auth-store',
            partialize: (state) => ({
                currentUser: state.currentUser,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
)

export default useAuthStore