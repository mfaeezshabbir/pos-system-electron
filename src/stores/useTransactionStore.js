import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'
import dayjs from 'dayjs'
import useDashboardStore from './useDashboardStore'

const storage = createJSONStorage(() => localStorage)

const useTransactionStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      creditTransactions: [],
      
      addTransaction: (transaction) => {
        set(state => ({
          transactions: [...state.transactions, {
            ...transaction,
            timestamp: new Date().toISOString()
          }]
        }))
        useDashboardStore.getState().updateSalesData(transaction)
      },

      addCreditTransaction: (transaction) => {
        set(state => ({
          creditTransactions: [...state.creditTransactions, {
            ...transaction,
            timestamp: new Date().toISOString(),
            status: 'pending',
            paidAmount: 0
          }]
        }))
      },

      updateCreditPayment: (transactionId, amount) => {
        set(state => ({
          creditTransactions: state.creditTransactions.map(t => {
            if (t.id === transactionId) {
              const newPaidAmount = (t.paidAmount || 0) + amount
              const newStatus = newPaidAmount >= t.total ? 'completed' : 'pending'
              
              if (newStatus === 'completed') {
                get().addTransaction({
                  ...t,
                  status: 'completed',
                  paymentMethod: 'credit',
                  amountPaid: t.total
                })
              }

              return {
                ...t,
                paidAmount: newPaidAmount,
                status: newStatus
              }
            }
            return t
          })
        }))
      },

      getSalesSummary: (startDate, endDate) => {
        const transactions = get().transactions.filter(t => {
          const transDate = dayjs(t.timestamp)
          return transDate.isAfter(startDate, 'day') && 
                 transDate.isBefore(endDate, 'day') && 
                 t.status === 'completed'
        })

        return {
          totalRevenue: transactions.reduce((sum, t) => sum + t.total, 0),
          netSales: transactions.reduce((sum, t) => sum + t.total - t.taxAmount - t.discountAmount, 0),
          taxAmount: transactions.reduce((sum, t) => sum + (t.taxAmount || 0), 0),
          discountAmount: transactions.reduce((sum, t) => sum + (t.discountAmount || 0), 0),
          transactionCount: transactions.length
        }
      },

      getPaymentMethodSummary: (startDate, endDate) => {
        const transactions = get().transactions.filter(t => {
          const transDate = dayjs(t.timestamp)
          return transDate.isAfter(startDate, 'day') && 
                 transDate.isBefore(endDate, 'day') && 
                 t.status === 'completed'
        })

        return transactions.reduce((summary, t) => {
          const method = t.paymentMethod || 'unknown'
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

      getTodayStats: () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const transactions = get().transactions.filter(t => {
          const transDate = new Date(t.timestamp)
          return transDate >= today && t.status === 'completed'
        })

        return {
          totalSales: transactions.reduce((sum, t) => sum + t.total, 0),
          transactionCount: transactions.length,
          transactions: transactions.slice(0, 5)
        }
      }
    }),
    {
      name: 'transaction-storage',
      storage
    }
  )
)

export default useTransactionStore 