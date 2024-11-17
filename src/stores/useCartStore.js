import { create } from 'zustand'
import { dbOperations, STORES } from '../utils/db'
import useInventoryStore from './useInventoryStore'
import useAuthStore from './useAuthStore'
import useTransactionStore from './useTransactionStore'
import useCustomerStore from './useCustomerStore'
import useNotificationStore from './useNotificationStore'
import useSettingsStore from './useSettingsStore'
import useSyncStore from './useSyncStore'

const useCartStore = create((set, get) => ({
  items: [],
  customer: null,
  discount: 0,
  tax: 0,
  error: null,
  onHold: false,

  // Initialize cart
  initializeCart: async () => {
    const cart = await dbOperations.get(STORES.SETTINGS, "currentCart");

    // Check if cart exists and has valid items
    if (cart && cart.items && Array.isArray(cart.items) && cart.items.length > 0) {
      // Verify if the cart is from the same day
      const cartDate = new Date(cart.timestamp || 0)
      const today = new Date()

      if (cartDate.toDateString() === today.toDateString()) {
        set(cart)
        return
      }
    }

    // If no valid cart exists or it's from a different day, start with empty cart
    await dbOperations.put(STORES.SETTINGS, {
      id: 'currentCart',
      items: [],
      customer: null,
      discount: 0,
      tax: 0,
      onHold: false,
      timestamp: new Date().toISOString()
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

  // Save cart state
  saveCartState: async () => {
    const state = get()
    await dbOperations.put(STORES.SETTINGS, {
      id: 'currentCart',
      items: state.items,
      customer: state.customer,
      discount: state.discount,
      tax: state.tax,
      onHold: state.onHold,
      timestamp: new Date().toISOString()
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
      const { businessInfo } = useSettingsStore.getState();

      // Calculate total
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const totalAmount = subtotal + tax - (discount || 0);

      // Update inventory stock for each item
      for (const item of items) {
        const success = await inventoryStore.adjustStock(
          item.id,
          -item.quantity,
          'Sale transaction',
          'sale'
        );

        if (!success) {
          throw new Error(`Failed to update stock for ${item.name}`);
        }
      }

      // Create transaction record with business details
      const transaction = {
        id: Date.now().toString(),
        items: items.map(item => ({
          ...item,
          subtotal: item.quantity * item.price
        })),
        businessDetails: {
          name: businessInfo.name,
          address: businessInfo.address,
          phone: businessInfo.phone,
          email: businessInfo.email,
          website: businessInfo.website,
          taxId: businessInfo.taxId
        },
        subtotal,
        taxAmount: tax,
        taxRate: tax ? ((tax / subtotal) * 100).toFixed(2) : 0,
        discount: discount || 0,
        total: totalAmount,
        timestamp: new Date(),
        customerId: customer?.id || 'walk-in',
        customerName: customer?.name || 'Walk-in Customer',
        customerPhone: customer?.phone || '',
        customerAddress: customer?.address || '',
        paymentMethod: paymentDetails.method,
        amountPaid: paymentDetails.amountPaid,
        change: paymentDetails.change,
        status: paymentDetails.method === 'khata' ? 'unpaid' : 'completed'
      };

      // Add transaction to store
      await transactionStore.addTransaction(transaction);

      // Clear the cart after successful transaction
      await get().clearCart();

      // Broadcast inventory update
      useSyncStore.getState().broadcastUpdate('INVENTORY_UPDATE', {
        action: 'sale',
        items: items
      });

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

    const holdTransaction = {
      id: Date.now().toString(),
      items: state.items,
      total: state.getCartTotals().total,
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