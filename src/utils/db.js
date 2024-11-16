import { openDB, deleteDB } from 'idb'
import { MOCK_USERS } from '../stores/useAuthStore';

// Database constants
const DB_NAME = 'posDB'
const DB_VERSION = 2

// Store names
export const STORES = {
  SETTINGS: 'settings',
  PRODUCTS: 'products',
  TRANSACTIONS: 'transactions',
  CUSTOMERS: 'customers',
  USERS: 'users',
  DASHBOARD: 'dashboard',
  STOCK_ADJUSTMENTS: 'stockAdjustments',
  PRODUCT_HISTORY: 'productHistory'
}

let db = null;

export const initDB = async () => {
  try {
    if (db) return db;

    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        console.log('Running database upgrade...');
        
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          const settingsStore = db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
          
          // Initialize default settings with empty categories
          settingsStore.put({
            id: 'appSettings',
            categories: [],
            // ... other settings
          });
        }
        
        // Create all stores and their indexes in the upgrade transaction
        Object.values(STORES).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });

            // Add indexes based on store type
            switch (storeName) {
              case STORES.PRODUCTS:
                store.createIndex('sku', 'sku', { unique: true });
                store.createIndex('category', 'category');
                store.createIndex('name', 'name');
                break;
              case STORES.TRANSACTIONS:
                store.createIndex('timestamp', 'timestamp');
                store.createIndex('customerId', 'customerId');
                store.createIndex('status', 'status');
                break;
              case STORES.CUSTOMERS:
                store.createIndex('phone', 'phone', { unique: true });
                store.createIndex('name', 'name');
                break;
              case STORES.USERS:
                store.createIndex('username', 'username', { unique: true });
                store.createIndex('role', 'role');
                break;
            }

            // Initialize default data for dashboard
            if (storeName === STORES.DASHBOARD) {
              store.put({
                id: 'dailyStats',
                todaySales: 0,
                todayTransactions: 0,
                recentTransactions: []
              });
            }

            // Initialize categories if they don't exist
            store.get('categories').then(categories => {
              if (!categories) {
                store.put({
                  id: 'categories',
                  value: []
                });
              }
            });
          }
        });
      },
      blocked() {
        console.log('Database upgrade blocked. Please close other tabs.');
      },
      blocking() {
        if (db) {
          db.close();
          db = null;
        }
      },
      terminated() {
        db = null;
      }
    });

    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Database operations
export const dbOperations = {
  getAllUsers: async () => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.USERS, 'readonly');
      const store = tx.objectStore(STORES.USERS);
      const users = await store.getAll();
      
      // If no users exist yet, initialize with mock users
      if (!users || users.length === 0) {
        const usersWithoutPasswords = MOCK_USERS.map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });
        
        // Add mock users to database
        const writeTx = db.transaction(STORES.USERS, 'readwrite');
        const writeStore = writeTx.objectStore(STORES.USERS);
        await Promise.all(usersWithoutPasswords.map(user => writeStore.add(user)));
        
        return usersWithoutPasswords;
      }
      
      return users;
    } catch (err) {
      console.error('Failed to get users:', err);
      throw new Error('Failed to load users');
    }
  },

  addUser: async (userData) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.USERS, 'readwrite');
      const store = tx.objectStore(STORES.USERS);
      await store.add(userData);
      return true;
    } catch (err) {
      console.error('Failed to add user:', err);
      throw err;
    }
  },

  updateUser: async (userData) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.USERS, 'readwrite');
      const store = tx.objectStore(STORES.USERS);
      await store.put(userData);
      return true;
    } catch (err) {
      console.error('Failed to update user:', err);
      throw err;
    }
  },

  deleteUser: async (userId) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.USERS, 'readwrite');
      const store = tx.objectStore(STORES.USERS);
      await store.delete(userId);
      return true;
    } catch (err) {
      console.error('Failed to delete user:', err);
      throw err;
    }
  },

  async add(storeName, item) {
    console.log(`Adding item to ${storeName}:`, item);
    const db = await initDB();
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const result = await store.add(item);
      await tx.done; // Wait for transaction to complete
      console.log(`Successfully added item to ${storeName}:`, result);
      return result;
    } catch (error) {
      console.error(`Failed to add item to ${storeName}:`, error);
      throw error;
    }
  },

  async get(storeName, id) {
    const db = await initDB();
    return db.get(storeName, id);
  },

  async getAll(storeName) {
    const db = await initDB();
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const results = await store.getAll();
      await tx.done;
      return results;
    } catch (error) {
      console.error(`Failed to get all items from ${storeName}:`, error);
      throw error;
    }
  },

  async put(storeName, item) {
    const db = await initDB();
    return db.put(storeName, item);
  },

  async delete(storeName, id) {
    const db = await initDB();
    return db.delete(storeName, id);
  },

  async clear(storeName) {
    const db = await initDB();
    return db.clear(storeName);
  },

  async getByIndex(storeName, indexName, value) {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    return index.getAll(value);
  },

  async query(storeName, { index, range, sort, limit } = {}) {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    
    let results = index 
      ? await store.index(index).getAll(range)
      : await store.getAll();
      
    if (sort) results = results.sort(sort);
    if (limit) results = results.slice(0, limit);
    
    return results;
  }
}; 