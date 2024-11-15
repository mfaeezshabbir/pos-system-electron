import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import useInventoryStore from './useInventoryStore'
import useAuthStore from './useAuthStore'
import useTransactionStore from './useTransactionStore'
import useCustomerStore from './useCustomerStore'
import useNotificationStore from './useNotificationStore'
import { safeGetItem, safeSetItem } from '../utils/storage'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      customer: null,
      discount: 0,
      tax: 0,
      error: null,
      onHold: false,

      // Add item to cart
      addItem: (item) => {
        const inventory = useInventoryStore.getState()
        const stockItem = inventory.getItem(item.id)

        if (!stockItem || stockItem.stock <= 0) {
          useNotificationStore.getState().addNotification({
            type: 'error',
            message: `${item.name} is out of stock`
          })
          return false
        }

        set(state => {
          const existingItem = state.items.find(i => i.id === item.id)

          if (existingItem) {
            const newQuantity = existingItem.quantity + 1
            if (newQuantity > stockItem.stock) {
              useNotificationStore.getState().addNotification({
                type: 'error',
                message: `No Stock Available`
              })
              return state
            }

            return {
              items: state.items.map(i =>
                i.id === item.id
                  ? { ...i, quantity: newQuantity }
                  : i
              ),
              error: null
            }
          }

          return {
            items: [...state.items, { ...item, quantity: 1 }],
            error: null
          }
        })
        return true
      },

      // Update item quantity
      updateItemQuantity: (itemId, newQuantity) => {
        const inventory = useInventoryStore.getState()
        const stockItem = inventory.getItem(itemId)

        if (!stockItem || newQuantity > stockItem.stock) {
          useNotificationStore.getState().addNotification({
            type: 'error',
            message: `No Stock Available`
          })
          return false
        }

        set(state => ({
          items: state.items.map(item =>
            item.id === itemId
              ? { ...item, quantity: newQuantity }
              : item
          ),
          error: null
        }))
        return true
      },

      // Remove item from cart
      removeItem: (productId) => {
        set(state => ({
          items: state.items.filter(item => item.id !== productId),
          error: null
        }))
      },

      // Set customer
      setCustomer: (customer) => {
        set({ customer, error: null })
      },

      // Apply discount
      applyDiscount: (discountPercent) => {
        set({
          discount: Math.min(Math.max(0, discountPercent), 100),
          error: null
        })
      },

      // Set tax rate
      setTaxRate: (taxPercent) => {
        set({
          tax: Math.min(Math.max(0, taxPercent), 100),
          error: null
        })
      },

      // Calculate totals
      getCartTotals: () => {
        const state = get()
        const subtotal = state.items.reduce((sum, item) => {
          return sum + (item.price * item.quantity || 0)
        }, 0)
        
        const discountAmount = (subtotal * (state.discount || 0)) / 100
        const taxableAmount = subtotal - discountAmount
        const taxAmount = (taxableAmount * (state.tax || 0)) / 100
        const total = taxableAmount + taxAmount

        return {
          subtotal: subtotal || 0,
          discountAmount: discountAmount || 0,
          taxAmount: taxAmount || 0,
          total: total || 0,
          taxRate: state.tax || 0,
          discountRate: state.discount || 0
        }
      },

      // Complete transaction
      completeTransaction: async (paymentDetails) => {
        const state = get();
        if (state.items.length === 0) {
          set({ error: 'Cart is empty' });
          return false;
        }

        const totals = state.getCartTotals();
        
        // Create minimal transaction data
        const transactionData = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          items: state.items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.quantity * item.price
          })),
          customerId: state.customer?.id,
          customerName: state.customer?.name,
          paymentMethod: paymentDetails.method,
          amountPaid: paymentDetails.amountPaid,
          change: paymentDetails.change,
          subtotal: totals.subtotal,
          total: totals.total,
          status: paymentDetails.method === 'khata' ? 'pending' : 'completed',
          cashierId: useAuthStore.getState().currentUser.id
        };

        try {
          if (paymentDetails.method === 'khata') {
            if (!state.customer) {
              set({ error: 'Please select a customer for khata payment' });
              return false;
            }

            // Add to pending payments
            const customerStore = useCustomerStore.getState();
            const success = customerStore.addPendingPayment(
              state.customer.id,
              {
                ...transactionData,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              }
            );

            if (!success) {
              set({ error: 'Credit limit exceeded' });
              return false;
            }
          }

          // Update inventory
          const inventory = useInventoryStore.getState();
          state.items.forEach(item => {
            inventory.updateStock(item.id, item.quantity, 'subtract');
          });

          // Add transaction to store
          useTransactionStore.getState().addTransaction(transactionData);

          // Clear cart
          set({
            items: [],
            customer: null,
            discount: 0,
            tax: 0,
            error: null
          });

          return true;
        } catch (error) {
          set({ error: error.message });
          return false;
        }
      },

      // Clear cart
      clearCart: () => {
        set({
          items: [],
          customer: null,
          discount: 0,
          tax: 0,
          error: null
        })
      },

      // Clear error
      clearError: () => set({ error: null }),

      putOrderOnHold: () => {
        const state = get()
        if (!state.customer) {
          set({ error: 'Please select a customer first' })
          return false
        }

        const totals = state.getCartTotals()
        const customer = useCustomerStore.getState().getCustomer(state.customer.id)

        if (customer.currentCredit + totals.total > customer.creditLimit) {
          set({ error: 'Credit limit exceeded' })
          return false
        }

        const holdTransaction = {
          id: Date.now().toString(),
          items: state.items,
          total: totals.total,
          timestamp: new Date().toISOString(),
          status: 'on_hold'
        }

        useCustomerStore.getState().addCustomerTransaction(state.customer.id, holdTransaction)

        set({
          items: [],
          customer: null,
          discount: 0,
          tax: 0,
          error: null
        })

        return true
      },

      cleanupOldTransactions: () => {
        try {
          const transactions = JSON.parse(localStorage.getItem('transaction-storage') || '[]');
          // Keep only last 100 transactions or transactions from last 30 days
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const filteredTransactions = transactions
            .filter(t => new Date(t.timestamp) > thirtyDaysAgo)
            .slice(-100);
          localStorage.setItem('transaction-storage', JSON.stringify(filteredTransactions));
        } catch (error) {
          console.error('Failed to cleanup transactions:', error);
        }
      },

      addTransaction: (transaction) => {
        try {
          const currentPage = localStorage.getItem('current-transaction-page') || '1';
          const pageKey = `transactions-page-${currentPage}`;
          const transactions = JSON.parse(localStorage.getItem(pageKey) || '[]');
          
          if (transactions.length >= 50) { // Max 50 transactions per page
            const newPage = parseInt(currentPage) + 1;
            localStorage.setItem('current-transaction-page', newPage.toString());
            localStorage.setItem(`transactions-page-${newPage}`, JSON.stringify([transaction]));
          } else {
            transactions.push(transaction);
            localStorage.setItem(pageKey, JSON.stringify(transactions));
          }
        } catch (error) {
          console.error('Failed to store transaction:', error);
        }
      }
    }),
    {
      name: 'cart-storage',
      version: 1,
    }
  )
)

export default useCartStore 