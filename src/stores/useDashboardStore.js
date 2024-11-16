import { create } from 'zustand'
import { dbOperations, STORES } from '../utils/db'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import isToday from 'dayjs/plugin/isToday'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isoWeek)
dayjs.extend(isToday)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const useDashboardStore = create((set, get) => ({
  todaySales: 0,
  todayTransactions: 0,
  recentTransactions: [],
  salesTrends: {
    daily: [],
    weekly: [],
    monthly: []
  },
  initialized: false,

  initializeDashboard: async () => {
    if (get().initialized) return;
    
    const currentStats = await dbOperations.get(STORES.DASHBOARD, 'dailyStats') || {
      todaySales: 0,
      todayTransactions: 0
    };
    
    set({ 
      ...currentStats,
      initialized: true 
    });
  },

  resetDailyStats: async () => {
    const resetStats = {
      todaySales: 0,
      todayTransactions: 0
    };
    
    await dbOperations.put(STORES.DASHBOARD, {
      id: 'dailyStats',
      ...resetStats
    });
    
    set(resetStats);
  },

  updateSalesData: async (transaction) => {
    const today = dayjs();
    const transactionDate = dayjs(transaction.timestamp);
    
    if (transactionDate.isSame(today, 'day')) {
      const currentStats = await dbOperations.get(STORES.DASHBOARD, 'dailyStats') || {
        todaySales: 0,
        todayTransactions: 0
      };
      
      const updatedStats = {
        todaySales: currentStats.todaySales + transaction.total,
        todayTransactions: currentStats.todayTransactions + 1
      };
      
      await dbOperations.put(STORES.DASHBOARD, {
        id: 'dailyStats',
        ...updatedStats
      });
      
      set(updatedStats);
    }
  },

  scheduleDailyReset: async () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow - now;

    // Schedule the first reset
    setTimeout(async () => {
      await get().resetDailyStats();
      
      // Schedule subsequent resets every 24 hours
      setInterval(async () => {
        await get().resetDailyStats();
      }, 24 * 60 * 60 * 1000);
      
    }, timeUntilMidnight);
  }
}));

export default useDashboardStore; 