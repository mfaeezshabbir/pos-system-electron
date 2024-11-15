import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_PRODUCT_IMAGE } from '../utils/constants'

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

const useInventoryStore = create(
  persist(
    (set, get) => ({
      products: [],
      categories: [],
      loading: false,
      error: null,
      previousState: null, // For error recovery

      addProduct: (product) => {
        const errors = validateProduct(product)
        if (errors.length > 0) {
          set({ error: errors.join(', ') })
          return false
        }

        const newProduct = {
          ...product,
          id: Date.now() + Math.random(),
          image: product.image || DEFAULT_PRODUCT_IMAGE,
          createdAt: new Date().toISOString()
        }

        set(state => ({
          products: [...state.products, newProduct],
          error: null
        }))
        return true
      },

      updateProduct: (updatedProduct) => {
        const errors = validateProduct(updatedProduct)
        if (errors.length > 0) {
          set({ error: errors.join(', ') })
          return false
        }

        const previousState = get()
        set({ previousState, loading: true })

        try {
          set(state => ({
            products: state.products.map(product =>
              product.id === updatedProduct.id ? updatedProduct : product
            ),
            loading: false,
            error: null
          }))
          return true
        } catch (error) {
          set({ ...previousState, error: error.message })
          return false
        }
      },

      // Recovery function
      recoverPreviousState: () => {
        const { previousState } = get()
        if (previousState) {
          set({ ...previousState, error: null })
          return true
        }
        return false
      },

      // Add multiple products (for CSV import)
      addBulkProducts: (productsArray) => {
        set(state => ({
          products: [...state.products, ...productsArray.map(product => ({
            ...product,
            id: Date.now() + Math.random(),
            image: product.image || DEFAULT_PRODUCT_IMAGE
          }))],
          error: null
        }))
      },

      // Delete product
      deleteProduct: (productId) => {
        set(state => ({
          products: state.products.filter(product => product.id !== productId),
          error: null
        }))
      },

      // Update stock
      updateStock: (productId, quantity, type = 'add') => {
        set(state => ({
          products: state.products.map(product => {
            if (product.id === productId) {
              const currentStock = parseInt(product.stock) || 0
              const updateValue = parseInt(quantity) || 0
              const newStock = type === 'add'
                ? currentStock + updateValue
                : currentStock - updateValue

              return {
                ...product,
                stock: Math.max(0, newStock) // Prevent negative stock
              }
            }
            return product
          }),
          error: null
        }))
      },

      // Add category
      addCategory: (category) => {
        set(state => ({
          categories: [...state.categories, category],
          error: null
        }))
      },

      // Delete category
      deleteCategory: (category) => {
        set(state => ({
          categories: state.categories.filter(cat => cat !== category),
          error: null
        }))
      },

      // Update category
      updateCategory: (oldCategory, newCategory) => {
        set(state => ({
          categories: state.categories.map(cat =>
            cat === oldCategory ? newCategory : cat
          ),
          // Also update all products with this category
          products: state.products.map(product =>
            product.category === oldCategory
              ? { ...product, category: newCategory }
              : product
          ),
          error: null
        }))
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
      }
    }),
    {
      name: 'inventory-store',
      partialize: (state) => ({
        products: state.products,
        categories: state.categories
      })
    }
  )
)

export default useInventoryStore