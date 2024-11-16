import { create } from 'zustand'
import { dbOperations, STORES } from '../utils/db'
import useInventoryStore from './useInventoryStore'
import useAuthStore from './useAuthStore'
import useTransactionStore from './useTransactionStore'
import useCustomerStore from './useCustomerStore'
import useNotificationStore from './useNotificationStore'

const useCartStore = create((set, get) => ({
  items: [],
  customer: null,
  discount: 0,
  tax: 0,
  error: null,
  onHold: false,

  // Initialize cart
  initializeCart: async () => {
    const cart = await dbOperations.get(STORES.SETTINGS, 'currentCart')
    if (cart) {
      set(cart)
    }
  },

  // Save cart state
  saveCartState: async () => {
    const state = get()
    await dbOperations.put(STORES.SETTINGS, {
      id: 'currentCart',
      items: state.items,
      customer: state.customer,
      discount: state.discount,
      tax: state.tax,
      onHold: state.onHold
    })
  },

  // Add item to cart
  addItem: async (item) => {
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
    const success = true
    if (success) {
      await get().saveCartState()
    }
    return success
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
  getCartTotals: (taxRate = 0) => {
    const state = get();
    const subtotal = state.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity || 0);
    }, 0);
    
    const discountAmount = (subtotal * (state.discount || 0)) / 100;
    const taxableAmount = subtotal - discountAmount;
    // Ensure tax rate is a number and within valid range
    const validTaxRate = Math.min(Math.max(0, parseFloat(taxRate) || 0), 100);
    const taxAmount = (taxableAmount * validTaxRate) / 100;
    const total = taxableAmount + taxAmount;

    return {
      subtotal: subtotal || 0,
      discountAmount: discountAmount || 0,
      taxAmount: taxAmount || 0,
      total: total || 0,
      taxRate: validTaxRate,
      discountRate: state.discount || 0
    };
  },

  // Complete transaction
  completeTransaction: async (paymentDetails) => {
    try {
      const { items, customer, discount, tax } = get();
      const inventoryStore = useInventoryStore.getState();
      const transactionStore = useTransactionStore.getState();
      
      // Update stock
      for (const item of items) {
        await inventoryStore.adjustStock(item.id, -item.quantity, 'Sale transaction', 'sale');
      }

      // Create transaction record
      const transaction = {
        id: Date.now().toString(),
        items: [...items],
        customer: customer || { id: 'walk-in', name: 'Walk-in Customer' },
        total: paymentDetails.total,
        subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        discount,
        tax,
        paymentMethod: paymentDetails.method,
        amountPaid: paymentDetails.amountPaid,
        change: paymentDetails.change,
        status: paymentDetails.method === 'khata' ? 'unpaid' : 'completed',
        timestamp: new Date().toISOString(),
        userId: useAuthStore.getState().currentUser?.id
      };

      await transactionStore.addTransaction(transaction);

      if (customer && paymentDetails.method === 'khata') {
        const success = await useCustomerStore.getState().addKhataTransaction(
          customer.id,
          {
            total: transaction.total,
            items: transaction.items,
            timestamp: transaction.timestamp,
            status: 'unpaid'
          }
        );
        if (!success) {
          throw new Error('Failed to add Khata transaction');
        }
      }

      await get().clearCart();
      return true;
    } catch (error) {
      console.error('Error completing transaction:', error);
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    await dbOperations.put(STORES.SETTINGS, {
      id: 'currentCart',
      items: [],
      customer: null,
      discount: 0,
      tax: 0,
      onHold: false
    })
    set({
      items: [],
      customer: null,
      discount: 0,
      tax: 0,
      error: null,
      onHold: false
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
  }
}))

export default useCartStore 