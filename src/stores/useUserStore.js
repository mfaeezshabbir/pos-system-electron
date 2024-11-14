import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// This would be moved to an API service in the future
const mockAuthService = {
    async login(username, password) {
        // Temporary mock implementation
        const defaultUser = {
            username: '123',
            password: '123',
            name: 'Administrator',
            role: 'admin'
        }

        if (username === defaultUser.username && password === defaultUser.password) {
            const { password: _, ...userWithoutPassword } = defaultUser
            return { success: true, user: userWithoutPassword }
        }
        return { success: false, error: 'Invalid username or password' }
    }
}

const useUserStore = create(
    persist(
        (set, get) => ({
            currentUser: null,
            error: null,

            login: async (username, password) => {
                try {
                    // This would call the real API endpoint in production
                    const response = await mockAuthService.login(username, password)

                    if (response.success) {
                        set({
                            currentUser: response.user,
                            error: null
                        })
                        return true
                    }

                    set({
                        currentUser: null,
                        error: response.error
                    })
                    return false

                } catch (err) {
                    set({
                        currentUser: null,
                        error: 'Authentication failed. Please try again.'
                    })
                    return false
                }
            },

            logout: () => {
                // Could add API call here to invalidate session
                set({ currentUser: null, error: null })
            },

            isAuthenticated: () => {
                return get().currentUser !== null
            }
        }),
        {
            name: 'user-store',
            partialize: (state) => ({ currentUser: state.currentUser })
        }
    )
)

export default useUserStore