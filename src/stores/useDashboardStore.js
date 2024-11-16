import { create } from 'zustand'
import { dbOperations, STORES } from '../utils/db'
import dayjs from 'dayjs'

const useDashboardStore = create((set, get) => ({
  todaySales: 0,
  todayTransactions: 0,
  recentTransactions: [],
  salesTrends: {
    daily: [],
    weekly: [],
    monthly: []
  },

  initializeDashboard: async () => {
    try {
      const dashboard = await dbOperations.get(STORES.DASHBOARD, 'dailyStats')
      if (dashboard) {
        set(dashboard)
      } else {
        await dbOperations.put(STORES.DASHBOARD, {
          id: 'dailyStats',
          todaySales: 0,
          todayTransactions: 0,
          recentTransactions: [],
          salesTrends: {
            daily: [],
            weekly: [],
            monthly: []
          }
        })
      }
    } catch (error) {
      console.error('Failed to initialize dashboard:', error)
    }
  },

  updateRecentTransactions: async (transaction) => {
    const currentStats = await dbOperations.get(STORES.DASHBOARD, 'dailyStats')
    const updatedTransactions = [transaction, ...(currentStats?.recentTransactions || [])]
      .slice(0, 10) // Keep only last 10 transactions

    const updatedStats = {
      ...currentStats,
      recentTransactions: updatedTransactions
    }
    
    await dbOperations.put(STORES.DASHBOARD, updatedStats)
    set({ recentTransactions: updatedTransactions })
  },

  updateSalesTrends: async () => {
    const transactionStore = useTransactionStore.getState()
    const today = dayjs()

    // Calculate daily trends (last 7 days)
    const dailyTrends = []
    for (let i = 6; i >= 0; i--) {
      const date = today.subtract(i, 'day')
      const sales = transactionStore.getSalesSummary(
        date.startOf('day'),
        date.endOf('day')
      )
      dailyTrends.push({
        date: date.format('YYYY-MM-DD'),
        sales: sales.totalRevenue,
        transactions: sales.transactionCount
      })
    }

    // Calculate weekly trends (last 4 weeks)
    const weeklyTrends = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = today.subtract(i, 'week')
      const sales = transactionStore.getSalesSummary(
        weekStart.startOf('week'),
        weekStart.endOf('week')
      )
      weeklyTrends.push({
        week: weekStart.format('YYYY-[W]WW'),
        sales: sales.totalRevenue,
        transactions: sales.transactionCount
      })
    }

    // Calculate monthly trends (last 6 months)
    const monthlyTrends = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = today.subtract(i, 'month')
      const sales = transactionStore.getSalesSummary(
        monthStart.startOf('month'),
        monthStart.endOf('month')
      )
      monthlyTrends.push({
        month: monthStart.format('YYYY-MM'),
        sales: sales.totalRevenue,
        transactions: sales.transactionCount
      })
    }

    const currentStats = await dbOperations.get(STORES.DASHBOARD, 'dailyStats')
    const updatedStats = {
      ...currentStats,
      salesTrends: {
        daily: dailyTrends,
        weekly: weeklyTrends,
        monthly: monthlyTrends
      }
    }

    await dbOperations.put(STORES.DASHBOARD, updatedStats)
    set({ salesTrends: updatedStats.salesTrends })
  },

  updateSalesData: async (transaction) => {
    const today = new Date()
    const transactionDate = new Date(transaction.timestamp)
    
    if (transactionDate.toDateString() === today.toDateString()) {
      const currentStats = await dbOperations.get(STORES.DASHBOARD, 'dailyStats')
      const updatedStats = {
        ...currentStats,
        todaySales: (currentStats?.todaySales || 0) + transaction.total,
        todayTransactions: (currentStats?.todayTransactions || 0) + 1,
      }
      
      await dbOperations.put(STORES.DASHBOARD, updatedStats)
      set(updatedStats)

      // Update recent transactions and trends
      await get().updateRecentTransactions(transaction)
      await get().updateSalesTrends()
    }
  },

  resetDailyStats: async () => {
    const resetStats = {
      id: 'dailyStats',
      todaySales: 0,
      todayTransactions: 0,
      recentTransactions: get().recentTransactions,
      salesTrends: get().salesTrends
    }
    await dbOperations.put(STORES.DASHBOARD, resetStats)
    set(resetStats)
  },

  scheduleDailyReset: () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const timeUntilMidnight = tomorrow - now
    setTimeout(() => {
      get().resetDailyStats()
      // Schedule next reset
      get().scheduleDailyReset()
    }, timeUntilMidnight)
  }
}))

export default useDashboardStore 