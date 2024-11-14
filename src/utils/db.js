import { openDB } from 'idb'

const DB_NAME = 'posDB'
const DB_VERSION = 1

export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Products store
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { keyPath: 'id' })
        productStore.createIndex('sku', 'sku', { unique: true })
        productStore.createIndex('category', 'category')
      }

      // Transactions store
      if (!db.objectStoreNames.contains('transactions')) {
        const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' })
        transactionStore.createIndex('date', 'timestamp')
        transactionStore.createIndex('cashierId', 'cashierId')
      }

      // Users store
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' })
        userStore.createIndex('username', 'username', { unique: true })
        userStore.createIndex('role', 'role')
      }
    }
  })

  return db
}

export const dbOperations = {
  // Product operations
  async addProduct(product) {
    const db = await initDB()
    return db.add('products', product)
  },

  async updateProduct(product) {
    const db = await initDB()
    return db.put('products', product)
  },

  async deleteProduct(id) {
    const db = await initDB()
    return db.delete('products', id)
  },

  async getProduct(id) {
    const db = await initDB()
    return db.get('products', id)
  },

  async getAllProducts() {
    const db = await initDB()
    return db.getAll('products')
  },

  // Transaction operations
  async addTransaction(transaction) {
    const db = await initDB()
    return db.add('transactions', transaction)
  },

  async getTransaction(id) {
    const db = await initDB()
    return db.get('transactions', id)
  },

  async getTransactionsByDateRange(startDate, endDate) {
    const db = await initDB()
    const index = db.transaction('transactions').store.index('date')
    return index.getAll(IDBKeyRange.bound(startDate, endDate))
  },

  // User operations
  async addUser(user) {
    const db = await initDB()
    return db.add('users', user)
  },

  async updateUser(user) {
    const db = await initDB()
    return db.put('users', user)
  },

  async deleteUser(id) {
    const db = await initDB()
    return db.delete('users', id)
  },

  async getUserByUsername(username) {
    const db = await initDB()
    const index = db.transaction('users').store.index('username')
    return index.get(username)
  },

  async getAllUsers() {
    const db = await initDB()
    return db.getAll('users')
  },

  async getUser(id) {
    const db = await initDB()
    return db.get('users', id)
  }
} 