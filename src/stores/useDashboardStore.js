import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'

const storage = createJSONStorage(() => localStorage)

const useDashboardStore = create(
    persist(
        (set, get) => ({
            todaySales: 0,
            todayTransactions: 0,
            recentTransactions: [],

            updateSalesData: (transaction) => {
                set(state => ({
                    todaySales: state.todaySales + transaction.total,
                    todayTransactions: state.todayTransactions + 1,
                    recentTransactions: [transaction, ...state.recentTransactions].slice(0, 5)
                }))
            },

            resetDailyStats: () => {
                set({
                    todaySales: 0,
                    todayTransactions: 0,
                    recentTransactions: []
                })
            }
        }),
        {
            name: 'dashboard-storage',
            storage
        }
    )
)

export default useDashboardStore 