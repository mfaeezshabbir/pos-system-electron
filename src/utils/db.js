import { openDB } from 'idb'

const DB_NAME = 'posDB'
const DB_VERSION = 1

// Store names
const STORES = {
  PRODUCTS: 'products',
  TRANSACTIONS: 'transactions',
  CUSTOMERS: 'customers',
  SETTINGS: 'settings',
  USERS: 'users',
  FILES: 'files', // For storing images and other files
  DASHBOARD: 'dashboard'
}

// Initialize database
export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Products store
      if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
        const productStore = db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' })
        productStore.createIndex('sku', 'sku', { unique: true })
        productStore.createIndex('category', 'category')
        productStore.createIndex('name', 'name')
      }

      // Transactions store
      if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
        const transactionStore = db.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id' })
        transactionStore.createIndex('timestamp', 'timestamp')
        transactionStore.createIndex('customerId', 'customerId')
        transactionStore.createIndex('status', 'status')
      }

      // Customers store
      if (!db.objectStoreNames.contains(STORES.CUSTOMERS)) {
        const customerStore = db.createObjectStore(STORES.CUSTOMERS, { keyPath: 'id' })
        customerStore.createIndex('phone', 'phone', { unique: true })
        customerStore.createIndex('name', 'name')
      }

      // Settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' })
      }

      // Users store
      if (!db.objectStoreNames.contains(STORES.USERS)) {
        const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' })
        userStore.createIndex('username', 'username', { unique: true })
        userStore.createIndex('role', 'role')
      }

      // Files store
      if (!db.objectStoreNames.contains(STORES.FILES)) {
        const fileStore = db.createObjectStore(STORES.FILES, { keyPath: 'id' })
        fileStore.createIndex('type', 'type')
        fileStore.createIndex('relatedId', 'relatedId')
      }

      // Dashboard store
      if (!db.objectStoreNames.contains(STORES.DASHBOARD)) {
        db.createObjectStore(STORES.DASHBOARD, { keyPath: 'id' })
      }
    }
  })
}

// Generic CRUD operations
export const dbOperations = {
  async add(storeName, item) {
    const db = await initDB()
    return db.add(storeName, item)
  },

  async get(storeName, id) {
    const db = await initDB()
    return db.get(storeName, id)
  },

  async getAll(storeName) {
    const db = await initDB()
    return db.getAll(storeName)
  },

  async put(storeName, item) {
    const db = await initDB()
    return db.put(storeName, item)
  },

  async delete(storeName, id) {
    const db = await initDB()
    return db.delete(storeName, id)
  },

  async clear(storeName) {
    const db = await initDB()
    return db.clear(storeName)
  },

  // Query by index
  async getByIndex(storeName, indexName, value) {
    const db = await initDB()
    const tx = db.transaction(storeName, 'readonly')
    const index = tx.store.index(indexName)
    return index.getAll(value)
  },

  // Store file
  async storeFile(file, relatedId, type) {
    const db = await initDB()
    const id = `${type}_${relatedId}_${Date.now()}`
    
    return db.put(STORES.FILES, {
      id,
      file,
      type,
      relatedId,
      timestamp: new Date().toISOString()
    })
  },

  // Get file
  async getFile(id) {
    const db = await initDB()
    return db.get(STORES.FILES, id)
  },

  // Advanced queries
  async query(storeName, options = {}) {
    const db = await initDB()
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.store

    let results = []
    
    if (options.index) {
      const index = store.index(options.index)
      if (options.range) {
        results = await index.getAll(options.range)
      } else {
        results = await index.getAll()
      }
    } else {
      results = await store.getAll()
    }

    // Apply filters
    if (options.filter) {
      results = results.filter(options.filter)
    }

    // Apply sorting
    if (options.sort) {
      results.sort(options.sort)
    }

    // Apply pagination
    if (options.limit) {
      const start = options.offset || 0
      results = results.slice(start, start + options.limit)
    }

    return results
  }
}

// Export store names
export { STORES } 