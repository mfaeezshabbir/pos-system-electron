import { create } from 'zustand'
import { dbOperations, STORES } from '../utils/db'
import { DEFAULT_PRODUCT_IMAGE } from '../utils/constants'
import useTransactionStore from './useTransactionStore'
import useAuthStore from './useAuthStore'
import useNotificationStore from './useNotificationStore'
import useSettingsStore from './useSettingsStore'
import useSyncStore from './useSyncStore'

const validateProduct = (product) => {
  const errors = []
  if (!product.name?.trim()) errors.push('Product name is required')
  if (!product.sku?.trim()) errors.push('SKU is required')
  if (!product.category) errors.push('Category is required')
  if (!product.price || parseFloat(product.price) <= 0) errors.push('Invalid price')
  if (!product.stock || parseInt(product.stock) < 0) errors.push('Invalid stock')
  if (!product.minStock || parseInt(product.minStock) < 0) errors.push('Invalid minimum stock')
  return errors
}

const useInventoryStore = create((set, get) => ({
  products: [],
  categories: [],
  loading: false,
  error: null,
  previousState: null, // For error recovery

  // Initialize inventory
  initializeInventory: async () => {
    set({ loading: true })
    try {
      // Load products
      const products = await dbOperations.getAll(STORES.PRODUCTS)
      console.log('Loaded products from DB:', products)

      // Load categories from settings
      const settings = await dbOperations.get(STORES.SETTINGS, 'appSettings')
      console.log('Loaded settings from DB:', settings)
      const categories = settings?.categories || []
      console.log('Extracted categories:', categories)

      set({ 
        products: products || [], 
        categories: categories,
        loading: false, 
        error: null 
      })
    } catch (error) {
      console.error('Failed to initialize inventory:', error)
      set({ error: error.message, loading: false })
    }
  },

  // Add product
  addProduct: async (product) => {
    console.log('Starting product addition:', product)
    const errors = validateProduct(product)
    if (errors.length > 0) {
      console.log('Validation errors:', errors)
      set({ error: errors.join(', ') })
      return false
    }

    set({ loading: true })
    try {
      const newProduct = {
        ...product,
        id: Date.now() + Math.random(),
        image: product.image || DEFAULT_PRODUCT_IMAGE,
        createdAt: new Date().toISOString()
      }
      console.log('Attempting to save product to DB:', newProduct)

      await dbOperations.add(STORES.PRODUCTS, newProduct)
      console.log('Product saved to DB successfully')

      set(state => {
        console.log('Updating store state with new product')
        return {
          products: [...state.products, newProduct],
          loading: false,
          error: null
        }
      })

      console.log('Broadcasting update')
      useSyncStore.getState().broadcastUpdate('INVENTORY_UPDATE', {
        action: 'add',
        productId: newProduct.id
      })

      return true
    } catch (error) {
      console.error('Error adding product:', error)
      set({ error: error.message, loading: false })
      return false
    }
  },

  // Update product
  updateProduct: async (id, updates) => {
    set({ loading: true })
    try {
      const product = await dbOperations.get(STORES.PRODUCTS, id)
      const updatedProduct = { ...product, ...updates }

      await dbOperations.put(STORES.PRODUCTS, updatedProduct)
      set(state => ({
        products: state.products.map(p => p.id === id ? updatedProduct : p),
        loading: false,
        error: null
      }))
      useSyncStore.getState().broadcastUpdate('INVENTORY_UPDATE', {
        action: 'update',
        productId: id
      })
      return true
    } catch (error) {
      set({ error: error.message, loading: false })
      return false
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    set({ loading: true })
    try {
      await dbOperations.delete(STORES.PRODUCTS, id)
      set(state => ({
        products: state.products.filter(p => p.id !== id),
        loading: false,
        error: null
      }))
      useSyncStore.getState().broadcastUpdate('INVENTORY_UPDATE', {
        action: 'delete',
        productId: id
      })
      return true
    } catch (error) {
      set({ error: error.message, loading: false })
      return false
    }
  },

  // Category operations
  addCategory: async (category) => {
    console.log('Starting addCategory with:', category)
    try {
      const categories = get().categories || []
      const updatedCategories = [...categories, category]
      console.log('Saving categories to DB:', updatedCategories)
      
      // First get existing settings
      const existingSettings = await dbOperations.get(STORES.SETTINGS, 'appSettings') || {}
      console.log('Existing settings:', existingSettings)
      
      // Update settings with new categories
      const updatedSettings = {
        ...existingSettings,
        id: 'appSettings',
        categories: updatedCategories
      }
      
      // Save to database
      await dbOperations.put(STORES.SETTINGS, updatedSettings)
      console.log('Saved settings to DB:', updatedSettings)
      
      // Update local state
      set(state => ({
        categories: updatedCategories,
        error: null
      }))
      
      // Broadcast update
      useSyncStore.getState().broadcastUpdate('INVENTORY_UPDATE', {
        action: 'updateCategories'
      })
      
      return true
    } catch (error) {
      console.error('Error in addCategory:', error)
      set({ error: error.message })
      return false
    }
  },

  deleteCategory: async (category) => {
    console.log('Starting deleteCategory with:', category)
    try {
      const categories = get().categories || []
      const updatedCategories = categories.filter(cat => cat !== category)
      
      // First get existing settings
      const existingSettings = await dbOperations.get(STORES.SETTINGS, 'appSettings') || {}
      
      // Update settings with new categories
      const updatedSettings = {
        ...existingSettings,
        id: 'appSettings',
        categories: updatedCategories
      }
      
      // Save to database
      await dbOperations.put(STORES.SETTINGS, updatedSettings)
      
      // Update local state
      set(state => ({
        categories: updatedCategories,
        error: null
      }))
      
      // Broadcast update
      useSyncStore.getState().broadcastUpdate('INVENTORY_UPDATE', {
        action: 'updateCategories'
      })
      
      return true
    } catch (error) {
      console.error('Error in deleteCategory:', error)
      set({ error: error.message })
      return false
    }
  },

  // Update category
  updateCategory: async (oldCategory, newCategory) => {
    try {
      // First update the categories list
      const categories = get().categories
      const updatedCategories = categories.map(cat =>
        cat === oldCategory ? newCategory : cat
      )

      await dbOperations.put(STORES.SETTINGS, {
        id: 'categories',
        value: updatedCategories
      })

      // Then update all products with this category
      const products = get().products
      const productsToUpdate = products.filter(p => p.category === oldCategory)

      // Update each product individually
      for (const product of productsToUpdate) {
        const updatedProduct = { ...product, category: newCategory }
        await dbOperations.put(STORES.PRODUCTS, updatedProduct)
      }

      // Update local state
      set(state => ({
        categories: updatedCategories,
        products: state.products.map(p =>
          p.category === oldCategory
            ? { ...p, category: newCategory }
            : p
        ),
        error: null
      }))
      return true
    } catch (error) {
      set({ error: error.message })
      return false
    }
  },

  // Search products
  searchProducts: (query) => {
    const products = get().products
    const searchTerm = query.toLowerCase()

    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    )
  },

  // Get low stock products
  getLowStockProducts: (threshold = 10) => {
    const products = get().products
    return products.filter(product => product.stock <= threshold)
  },

  // Clear all errors
  clearError: () => set({ error: null }),

  // Reset store
  resetStore: () => set({ products: [], categories: [], error: null }),

  // Add getItem function
  getItem: (productId) => {
    const state = get()
    return state.products.find(product => product.id === productId)
  },

  // Add this method to your store
  getProductCountByDate: async (date) => {
    try {
      const products = await dbOperations.getAll(STORES.PRODUCTS)
      return products.filter(p => new Date(p.createdAt) <= date).length
    } catch (error) {
      console.error('Error getting product count:', error)
      return 0
    }
  },

  bulkUpdateProducts: async (products) => {
    set({ loading: true })
    try {
      // Update each product in the database
      for (const product of products) {
        await dbOperations.put(STORES.PRODUCTS, product)
      }

      // Update local state
      set(state => ({
        products: state.products.map(p => {
          const updated = products.find(up => up.id === p.id)
          return updated || p
        }),
        loading: false,
        error: null
      }))
      return true
    } catch (error) {
      set({ error: error.message, loading: false })
      return false
    }
  },

  adjustStock: async (productId, quantity, reason, type = 'adjustment') => {
    set({ loading: true })
    try {
      const product = await dbOperations.get(STORES.PRODUCTS, productId)
      if (!product) throw new Error('Product not found')

      const adjustment = {
        id: Date.now().toString(),
        productId,
        quantity,
        type,
        reason,
        previousStock: product.stock,
        newStock: product.stock + quantity,
        timestamp: new Date().toISOString(),
        userId: useAuthStore.getState().currentUser?.id
      }

      // Update product stock
      const updatedProduct = {
        ...product,
        stock: product.stock + quantity
      }

      // Save adjustment history
      await dbOperations.add(STORES.STOCK_ADJUSTMENTS, adjustment)
      await dbOperations.put(STORES.PRODUCTS, updatedProduct)

      set(state => ({
        products: state.products.map(p => 
          p.id === productId ? updatedProduct : p
        ),
        loading: false,
        error: null
      }))

      // Check for low stock after adjustment
      if (updatedProduct.stock <= updatedProduct.minStock) {
        useNotificationStore.getState().addNotification({
          type: 'warning',
          message: `Low stock alert for ${updatedProduct.name}`
        })
      }

      return true
    } catch (error) {
      set({ error: error.message, loading: false })
      return false
    }
  },

  getStockHistory: async (productId) => {
    try {
      const adjustments = await dbOperations.getByIndex(
        STORES.STOCK_ADJUSTMENTS,
        'productId',
        productId
      )
      return adjustments.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )
    } catch (error) {
      console.error('Failed to get stock history:', error)
      return []
    }
  },

  checkLowStockProducts: async () => {
    const state = get()
    const { lowStockThreshold } = useSettingsStore.getState().posSettings
    const lowStockProducts = state.products.filter(p => 
      p.stock <= (p.minStock || lowStockThreshold)
    )

    if (lowStockProducts.length > 0) {
      const { notificationSettings } = useSettingsStore.getState()
      
      if (notificationSettings.lowStockAlerts) {
        lowStockProducts.forEach(product => {
          useNotificationStore.getState().addNotification({
            type: 'warning',
            message: `Low stock alert: ${product.name} (${product.stock} remaining)`,
            duration: 10000
          })
        })
      }

      // If email notifications are enabled, send email alert
      if (notificationSettings.emailNotifications) {
        // Implement email notification logic here
        console.log('Email notifications for low stock products:', lowStockProducts)
      }
    }

    return lowStockProducts
  },

  trackProductHistory: async (productId, action, changes) => {
    try {
      const historyEntry = {
        id: Date.now().toString(),
        productId,
        action,
        changes,
        timestamp: new Date().toISOString(),
        userId: useAuthStore.getState().currentUser?.id
      }

      await dbOperations.add(STORES.PRODUCT_HISTORY, historyEntry)
      return true
    } catch (error) {
      console.error('Failed to track product history:', error)
      return false
    }
  },

  getProductHistory: async (productId) => {
    try {
      const history = await dbOperations.getByIndex(
        STORES.PRODUCT_HISTORY,
        'productId',
        productId
      )
      return history.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )
    } catch (error) {
      console.error('Failed to get product history:', error)
      return []
    }
  },

  // Add this method to help with debugging
  getCategories: () => {
    const state = get()
    console.log('Current categories in state:', state.categories)
    return state.categories
  }
}))

export default useInventoryStore