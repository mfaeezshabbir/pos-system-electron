import { create } from 'zustand'
import { dbOperations } from '../utils/db'
import useInventoryStore from './useInventoryStore'
import useTransactionStore from './useTransactionStore'
import useCustomerStore from './useCustomerStore'
import useDashboardStore from './useDashboardStore'

const useSyncStore = create((set, get) => ({
  lastSync: null,
  syncInProgress: false,
  
  initSync: () => {
    // Listen for BroadcastChannel events for cross-tab communication
    const channel = new BroadcastChannel('pos_sync_channel')
    
    channel.onmessage = (event) => {
      const { type, data } = event.data
      if (!get().syncInProgress) {
        get().handleStateUpdate(type, data)
      }
    }
  },

  handleStateUpdate: async (type, data) => {
    set({ syncInProgress: true })
    
    try {
      switch (type) {
        case 'INVENTORY_UPDATE':
          await useInventoryStore.getState().initializeInventory()
          break
          
        case 'TRANSACTION_UPDATE':
          await useTransactionStore.getState().loadTransactions()
          await useDashboardStore.getState().updateSalesData()
          break
          
        case 'CUSTOMER_UPDATE':
          await useCustomerStore.getState().initializeCustomers()
          break
      }
      
      set({ 
        lastSync: new Date().toISOString(),
        syncInProgress: false 
      })
    } catch (error) {
      console.error('Sync failed:', error)
      set({ syncInProgress: false })
    }
  },

  broadcastUpdate: (type, data) => {
    const channel = new BroadcastChannel('pos_sync_channel')
    channel.postMessage({ type, data })
  }
}))

export default useSyncStore 