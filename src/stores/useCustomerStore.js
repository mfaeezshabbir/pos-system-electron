import { create } from 'zustand'
import { dbOperations, STORES } from '../utils/db'
import useTransactionStore from './useTransactionStore'

// Move helper functions to the top of the file
const validateCNIC = (cnic) => {
  if (!cnic) return true;
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  return cnicRegex.test(cnic);
};

const validateCustomer = (customer) => {
  const errors = [];
  if (!customer.name) errors.push('Name is required');
  if (!customer.phone) errors.push('Phone is required');
  if (customer.cnic && !validateCNIC(customer.cnic)) {
    errors.push('Invalid CNIC format (e.g., 12345-1234567-1)');
  }
  return errors;
};

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
    set({ loading: true });
    try {
      console.log('Validating customer:', customer);
      const errors = validateCustomer(customer);
      if (errors.length > 0) {
        console.error('Validation errors:', errors);
        set({ error: errors.join(', '), loading: false });
        return null;
      }

      const newCustomer = {
        ...customer,
        id: Date.now().toString(),
        creditLimit: customer.creditLimit || 0,
        currentCredit: customer.currentCredit || 0,
        transactions: customer.transactions || [],
        createdAt: new Date().toISOString()
      };

      console.log('Attempting to add customer:', newCustomer);
      await dbOperations.add(STORES.CUSTOMERS, newCustomer);
      
      set(state => ({
        customers: [...state.customers, newCustomer],
        loading: false,
        error: null
      }));
      
      console.log('Customer added successfully:', newCustomer);
      return newCustomer;
    } catch (error) {
      console.error('Failed to add customer:', error);
      set({ error: error.message, loading: false });
      return null;
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
    const customer = await dbOperations.get(STORES.CUSTOMERS, customerId);
    if (!customer) return false;

    try {
      const updatedCustomer = {
        ...customer,
        currentCredit: customer.currentCredit + transaction.total,
        transactions: [...customer.transactions, {
          ...transaction,
          type: 'khata',
          timestamp: new Date().toISOString(),
          status: 'unpaid',
          isPaid: false
        }]
      };

      await dbOperations.put(STORES.CUSTOMERS, updatedCustomer);
      set(state => ({
        customers: state.customers.map(c =>
          c.id === customerId ? updatedCustomer : c
        )
      }));
      return true;
    } catch (error) {
      console.error('Failed to add khata transaction:', error);
      return false;
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
          totalPaid: transactions
            .filter(t => t.status === 'completed' || t.paymentMethod !== 'khata')
            .reduce((sum, t) => sum + t.total, 0),
          totalUnpaid: transactions
            .filter(t => t.status !== 'completed' && t.paymentMethod === 'khata')
            .reduce((sum, t) => sum + t.total, 0),
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
  },

  deleteCustomer: async (id) => {
    set({ loading: true });
    try {
      await dbOperations.delete(STORES.CUSTOMERS, id);
      set(state => ({
        customers: state.customers.filter(c => c.id !== id),
        loading: false,
        error: null
      }));
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  makePayment: async (customerId, amount) => {
    try {
      const customer = await dbOperations.get(STORES.CUSTOMERS, customerId);
      if (!customer) return false;

      const updatedCustomer = {
        ...customer,
        currentCredit: Math.max(0, customer.currentCredit - amount),
        transactions: [...customer.transactions, {
          type: 'payment',
          amount,
          timestamp: new Date().toISOString(),
          status: 'completed'
        }]
      };

      await dbOperations.put(STORES.CUSTOMERS, updatedCustomer);
      set(state => ({
        customers: state.customers.map(c =>
          c.id === customerId ? updatedCustomer : c
        )
      }));
      return true;
    } catch (error) {
      console.error('Payment failed:', error);
      return false;
    }
  },

  updateTransactionPaymentStatus: async (customerId, transactionId, isPaid) => {
    try {
      const customer = await dbOperations.get(STORES.CUSTOMERS, customerId);
      if (!customer) return false;

      const transaction = customer.transactions.find(t => t.id === transactionId);
      if (!transaction) return false;

      const updatedCustomer = {
        ...customer,
        currentCredit: isPaid ?
          customer.currentCredit - transaction.total :
          customer.currentCredit + transaction.total,
        transactions: customer.transactions.map(t =>
          t.id === transactionId ?
            { ...t, status: isPaid ? 'completed' : 'unpaid', isPaid } :
            t
        )
      };

      await dbOperations.put(STORES.CUSTOMERS, updatedCustomer);
      set(state => ({
        customers: state.customers.map(c =>
          c.id === customerId ? updatedCustomer : c
        )
      }));

      return true;
    } catch (error) {
      console.error('Failed to update payment status:', error);
      return false;
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