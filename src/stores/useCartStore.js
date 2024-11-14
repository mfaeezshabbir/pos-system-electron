import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import useInventoryStore from './useInventoryStore'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      customer: null,
      discount: 0,
      tax: 0,
      error: null,

      // Add item to cart
      addItem: (product, quantity = 1) => {
        const inventoryProduct = useInventoryStore.getState().products
          .find(p => p.id === product.id)

        if (!inventoryProduct) {
          set({ error: 'Product not found in inventory' })
          return false
        }

        if (inventoryProduct.stock < quantity) {
          set({ error: 'Not enough stock available' })
          return false
        }

        set(state => {
          const existingItem = state.items.find(item => item.id === product.id)
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.id === product.id
                  ? { 
                      ...item, 
                      quantity: item.quantity + quantity,
                      subtotal: (item.quantity + quantity) * item.price
                    }
                  : item
              ),
              error: null
            }
          }

          return {
            items: [...state.items, {
              id: product.id,
              name: product.name,
              price: product.price,
              quantity,
              subtotal: quantity * product.price
            }],
            error: null
          }
        })

        return true
      },

      // Update item quantity
      updateItemQuantity: (productId, quantity) => {
        const inventoryProduct = useInventoryStore.getState().products
          .find(p => p.id === productId)

        if (inventoryProduct.stock < quantity) {
          set({ error: 'Not enough stock available' })
          return false
        }

        set(state => ({
          items: state.items.map(item =>
            item.id === productId
              ? {
                  ...item,
                  quantity,
                  subtotal: quantity * item.price
                }
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
        const subtotal = state.items.reduce((sum, item) => sum + item.subtotal, 0)
        const discountAmount = (subtotal * state.discount) / 100
        const taxableAmount = subtotal - discountAmount
        const taxAmount = (taxableAmount * state.tax) / 100
        const total = taxableAmount + taxAmount

        return {
          subtotal,
          discountAmount,
          taxAmount,
          total
        }
      },

      // Complete transaction
      completeTransaction: async () => {
        const state = get()
        if (state.items.length === 0) {
          set({ error: 'Cart is empty' })
          return false
        }

        // Update inventory
        const inventory = useInventoryStore.getState()
        state.items.forEach(item => {
          inventory.updateStock(item.id, item.quantity, 'subtract')
        })

        // Clear cart
        set({
          items: [],
          customer: null,
          discount: 0,
          tax: 0,
          error: null
        })

        return true
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
      clearError: () => set({ error: null })
    }),
    {
      name: 'cart-storage',
      version: 1,
    }
  )
)

export default useCartStore 