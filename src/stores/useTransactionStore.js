import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format } from 'date-fns'

const useTransactionStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      loading: false,
      error: null,

      // Add new transaction
      addTransaction: (transaction) => {
        set(state => ({
          transactions: [...state.transactions, {
            id: Date.now(),
            ...transaction,
            timestamp: new Date().toISOString(),
            status: 'completed'
          }],
          error: null
        }))
      },

      // Void transaction
      voidTransaction: (transactionId, reason) => {
        set(state => ({
          transactions: state.transactions.map(trans =>
            trans.id === transactionId
              ? {
                  ...trans,
                  status: 'voided',
                  voidReason: reason,
                  voidedAt: new Date().toISOString()
                }
              : trans
          ),
          error: null
        }))
      },

      // Get transaction by ID
      getTransactionById: (transactionId) => {
        return get().transactions.find(t => t.id === transactionId)
      },

      // Get transactions by date range
      getTransactionsByDateRange: (startDate, endDate) => {
        return get().transactions.filter(transaction => {
          const transDate = new Date(transaction.timestamp)
          return transDate >= startDate && transDate <= endDate
        })
      },

      // Get transactions by cashier
      getTransactionsByCashier: (cashierId) => {
        return get().transactions.filter(t => t.cashierId === cashierId)
      },

      // Get daily sales report
      getDailySalesReport: (date = new Date()) => {
        const transactions = get().transactions
        const dayStart = new Date(date.setHours(0, 0, 0, 0))
        const dayEnd = new Date(date.setHours(23, 59, 59, 999))

        const dailyTransactions = transactions.filter(t => {
          const transDate = new Date(t.timestamp)
          return transDate >= dayStart && transDate <= dayEnd && t.status === 'completed'
        })

        return {
          date: format(date, 'yyyy-MM-dd'),
          totalSales: dailyTransactions.reduce((sum, t) => sum + t.total, 0),
          totalTransactions: dailyTransactions.length,
          transactions: dailyTransactions
        }
      },

      // Get sales summary
      getSalesSummary: (startDate, endDate) => {
        // Convert dayjs objects to native Date objects
        const start = startDate.toDate()
        const end = endDate.toDate()
        
        const transactions = get().getTransactionsByDateRange(start, end)
          .filter(t => t.status === 'completed')

        const productSales = {}
        let totalRevenue = 0
        let totalTax = 0
        let totalDiscounts = 0

        transactions.forEach(transaction => {
          totalRevenue += transaction.total
          totalTax += transaction.taxAmount || 0
          totalDiscounts += transaction.discountAmount || 0

          transaction.items.forEach(item => {
            if (!productSales[item.id]) {
              productSales[item.id] = {
                name: item.name,
                quantity: 0,
                revenue: 0
              }
            }
            productSales[item.id].quantity += item.quantity
            productSales[item.id].revenue += item.subtotal
          })
        })

        return {
          period: {
            start: format(start, 'yyyy-MM-dd'),
            end: format(end, 'yyyy-MM-dd')
          },
          totalRevenue,
          totalTax,
          totalDiscounts,
          netSales: totalRevenue - totalTax - totalDiscounts,
          transactionCount: transactions.length,
          productSales: Object.values(productSales)
        }
      },

      // Get payment method summary
      getPaymentMethodSummary: (startDate, endDate) => {
        // Convert dayjs objects to native Date objects
        const start = startDate.toDate()
        const end = endDate.toDate()
        
        const transactions = get().getTransactionsByDateRange(start, end)
          .filter(t => t.status === 'completed')

        return transactions.reduce((summary, t) => {
          const method = t.paymentMethod
          if (!summary[method]) {
            summary[method] = {
              count: 0,
              total: 0
            }
          }
          summary[method].count++
          summary[method].total += t.total
          return summary
        }, {})
      },

      // Get hourly sales distribution
      getHourlySalesDistribution: (date = new Date()) => {
        const transactions = get().transactions
          .filter(t => 
            t.status === 'completed' && 
            format(new Date(t.timestamp), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          )

        const hourlyData = Array(24).fill(0).map((_, hour) => ({
          hour,
          sales: 0,
          transactions: 0
        }))

        transactions.forEach(t => {
          const hour = new Date(t.timestamp).getHours()
          hourlyData[hour].sales += t.total
          hourlyData[hour].transactions++
        })

        return hourlyData
      },

      // Clear old transactions
      clearOldTransactions: (daysToKeep = 365) => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

        set(state => ({
          transactions: state.transactions.filter(t => 
            new Date(t.timestamp) >= cutoffDate
          )
        }))
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Reset store
      resetStore: () => set({
        transactions: [],
        error: null
      })
    }),
    {
      name: 'transaction-storage',
      version: 1,
    }
  )
)

export default useTransactionStore 