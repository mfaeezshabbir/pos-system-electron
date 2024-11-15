import { create } from 'zustand'
import { dbOperations, STORES } from '../utils/db'
import dayjs from 'dayjs'

const useTransactionStore = create((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  // Load transactions
  loadTransactions: async () => {
    set({ loading: true })
    try {
      const transactions = await dbOperations.getAll(STORES.TRANSACTIONS)
      set({ transactions, loading: false, error: null })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // Add transaction
  addTransaction: async (transaction) => {
    set({ loading: true })
    try {
      await dbOperations.add(STORES.TRANSACTIONS, transaction)
      set(state => ({
        transactions: [transaction, ...state.transactions],
        loading: false,
        error: null
      }))
      return true
    } catch (error) {
      set({ error: error.message, loading: false })
      return false
    }
  },

  // Get recent transactions
  getRecentTransactions: async (limit = 5) => {
    try {
      const transactions = await dbOperations.query(STORES.TRANSACTIONS, {
        sort: (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
        limit
      })
      return transactions
    } catch (error) {
      set({ error: error.message })
      return []
    }
  },

  // Get transactions by date range
  getTransactionsByDateRange: async (startDate, endDate) => {
    try {
      const range = IDBKeyRange.bound(startDate.toISOString(), endDate.toISOString())
      return await dbOperations.query(STORES.TRANSACTIONS, {
        index: 'timestamp',
        range
      })
    } catch (error) {
      set({ error: error.message })
      return []
    }
  },

  // Get customer transactions
  getCustomerTransactions: async (customerId) => {
    try {
      return await dbOperations.getByIndex(STORES.TRANSACTIONS, 'customerId', customerId)
    } catch (error) {
      set({ error: error.message })
      return []
    }
  },

  // Clear old transactions
  clearOldTransactions: async (daysToKeep = 30) => {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const transactions = await dbOperations.getAll(STORES.TRANSACTIONS)
      const recentTransactions = transactions.filter(
        t => new Date(t.timestamp) >= cutoffDate
      )

      await dbOperations.clear(STORES.TRANSACTIONS)
      await Promise.all(recentTransactions.map(t => 
        dbOperations.add(STORES.TRANSACTIONS, t)
      ))

      set({ transactions: recentTransactions, error: null })
    } catch (error) {
      set({ error: error.message })
    }
  },

  getSalesSummary: (startDate, endDate) => {
    const transactions = get().transactions;
    const filteredTransactions = transactions.filter(t => {
      const date = dayjs(t.timestamp);
      return date.isAfter(startDate, 'day') && date.isBefore(endDate, 'day');
    });

    return {
      totalRevenue: filteredTransactions.reduce((sum, t) => sum + t.total, 0),
      netSales: filteredTransactions.reduce((sum, t) => sum + t.subtotal, 0),
      taxAmount: filteredTransactions.reduce((sum, t) => sum + t.taxAmount, 0),
      discountAmount: filteredTransactions.reduce((sum, t) => sum + (t.discountAmount || 0), 0),
      transactionCount: filteredTransactions.length
    };
  },

  getPaymentMethodSummary: (startDate, endDate) => {
    const transactions = get().transactions;
    const filteredTransactions = transactions.filter(t => {
      const date = dayjs(t.timestamp);
      return date.isAfter(startDate, 'day') && date.isBefore(endDate, 'day');
    });

    return filteredTransactions.reduce((summary, t) => {
      const method = t.paymentMethod;
      if (!summary[method]) {
        summary[method] = { total: 0, count: 0 };
      }
      summary[method].total += t.total;
      summary[method].count += 1;
      return summary;
    }, {});
  }
}))

export default useTransactionStore 