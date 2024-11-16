import { create } from 'zustand'
import { dbOperations, STORES } from '../utils/db'

const useCustomerStore = create((set, get) => ({
  customers: [],
  loading: false,
  error: null,

  // Initialize customers
  initializeCustomers: async () => {
    set({ loading: true })
    try {
      const customers = await dbOperations.getAll(STORES.CUSTOMERS)
      set({ customers: customers || [], loading: false, error: null })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  addCustomer: async (customer) => {
    set({ loading: true })
    try {
      const newCustomer = {
        id: Date.now().toString(),
        name: customer.name,
        phone: customer.phone,
        creditLimit: customer.creditLimit || 0,
        currentCredit: 0,
        transactions: [],
        createdAt: new Date().toISOString()
      }
      
      await dbOperations.add(STORES.CUSTOMERS, newCustomer)
      set(state => ({
        customers: [...state.customers, newCustomer],
        loading: false,
        error: null
      }))
      return newCustomer
    } catch (error) {
      set({ error: error.message, loading: false })
      return null
    }
  },

  updateCustomer: async (id, updates) => {
    set({ loading: true })
    try {
      const customer = await dbOperations.get(STORES.CUSTOMERS, id)
      const updatedCustomer = { ...customer, ...updates }
      await dbOperations.put(STORES.CUSTOMERS, updatedCustomer)
      
      set(state => ({
        customers: state.customers.map(c => c.id === id ? updatedCustomer : c),
        loading: false,
        error: null
      }))
      return true
    } catch (error) {
      set({ error: error.message, loading: false })
      return false
    }
  },

  addKhataTransaction: async (customerId, transaction) => {
    const customer = await dbOperations.get(STORES.CUSTOMERS, customerId)
    if (!customer) return false

    const newTotal = customer.currentCredit + transaction.total
    if (newTotal > customer.creditLimit) return false

    try {
      const updatedCustomer = {
        ...customer,
        currentCredit: newTotal,
        transactions: [...customer.transactions, {
          ...transaction,
          type: 'khata',
          timestamp: new Date().toISOString(),
          status: 'pending'
        }]
      }

      await dbOperations.put(STORES.CUSTOMERS, updatedCustomer)
      set(state => ({
        customers: state.customers.map(c =>
          c.id === customerId ? updatedCustomer : c
        )
      }))
      return true
    } catch (error) {
      set({ error: error.message })
      return false
    }
  },

  // Get customer purchase history with detailed analytics
  getCustomerHistory: async (customerId) => {
    try {
      const customer = await dbOperations.get(STORES.CUSTOMERS, customerId)
      if (!customer) return null

      const transactions = await dbOperations.getByIndex(
        STORES.TRANSACTIONS,
        'customerId',
        customerId
      )

      const history = {
        transactions: transactions.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        ),
        analytics: {
          totalSpent: transactions.reduce((sum, t) => sum + t.total, 0),
          averageTransaction: transactions.length ? 
            transactions.reduce((sum, t) => sum + t.total, 0) / transactions.length : 0,
          totalVisits: transactions.length,
          lastVisit: transactions.length ? 
            transactions[0].timestamp : null,
          frequentItems: getFrequentItems(transactions),
          paymentMethods: getPaymentMethodStats(transactions)
        }
      }

      return history
    } catch (error) {
      console.error('Failed to get customer history:', error)
      return null
    }
  },

  // Customer loyalty system
  updateLoyaltyPoints: async (customerId, points, type = 'add') => {
    try {
      const customer = await dbOperations.get(STORES.CUSTOMERS, customerId)
      if (!customer) return false

      const currentPoints = customer.loyaltyPoints || 0
      const updatedPoints = type === 'add' ? 
        currentPoints + points : 
        currentPoints - points

      const updatedCustomer = {
        ...customer,
        loyaltyPoints: Math.max(0, updatedPoints),
        loyaltyTier: calculateLoyaltyTier(updatedPoints),
        pointsHistory: [
          ...(customer.pointsHistory || []),
          {
            points,
            type,
            timestamp: new Date().toISOString(),
            balance: updatedPoints
          }
        ]
      }

      await dbOperations.put(STORES.CUSTOMERS, updatedCustomer)
      set(state => ({
        customers: state.customers.map(c =>
          c.id === customerId ? updatedCustomer : c
        )
      }))
      return true
    } catch (error) {
      console.error('Failed to update loyalty points:', error)
      return false
    }
  },

  // Customer categories/groups management
  addCustomerToGroup: async (customerId, groupName) => {
    try {
      const customer = await dbOperations.get(STORES.CUSTOMERS, customerId)
      if (!customer) return false

      const updatedCustomer = {
        ...customer,
        groups: [...new Set([...(customer.groups || []), groupName])]
      }

      await dbOperations.put(STORES.CUSTOMERS, updatedCustomer)
      set(state => ({
        customers: state.customers.map(c =>
          c.id === customerId ? updatedCustomer : c
        )
      }))
      return true
    } catch (error) {
      console.error('Failed to add customer to group:', error)
      return false
    }
  },

  removeCustomerFromGroup: async (customerId, groupName) => {
    try {
      const customer = await dbOperations.get(STORES.CUSTOMERS, customerId)
      if (!customer) return false

      const updatedCustomer = {
        ...customer,
        groups: (customer.groups || []).filter(g => g !== groupName)
      }

      await dbOperations.put(STORES.CUSTOMERS, updatedCustomer)
      set(state => ({
        customers: state.customers.map(c =>
          c.id === customerId ? updatedCustomer : c
        )
      }))
      return true
    } catch (error) {
      console.error('Failed to remove customer from group:', error)
      return false
    }
  }
}))

// Helper functions
const getFrequentItems = (transactions) => {
  const itemCounts = {}
  transactions.forEach(t => {
    t.items.forEach(item => {
      itemCounts[item.id] = (itemCounts[item.id] || 0) + item.quantity
    })
  })
  return Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
}

const getPaymentMethodStats = (transactions) => {
  return transactions.reduce((stats, t) => {
    stats[t.paymentMethod] = (stats[t.paymentMethod] || 0) + 1
    return stats
  }, {})
}

const calculateLoyaltyTier = (points) => {
  if (points >= 1000) return 'PLATINUM'
  if (points >= 500) return 'GOLD'
  if (points >= 200) return 'SILVER'
  return 'BRONZE'
}

export default useCustomerStore 