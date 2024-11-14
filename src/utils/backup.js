import { dbOperations } from './db'
import { logger } from './logger'

export const backupManager = {
  async createBackup() {
    try {
      const data = {
        products: await dbOperations.getAllProducts(),
        timestamp: new Date().toISOString(),
        version: '1.0'
      }

      const result = await window.electron.backupData(data)
      
      if (result.success) {
        logger.info('Backup created successfully')
        return { success: true, data }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      logger.error('Backup creation failed', error)
      return { success: false, error: error.message }
    }
  },

  async restoreBackup(backupData) {
    try {
      // Validate backup data
      if (!backupData.products || !backupData.timestamp) {
        throw new Error('Invalid backup data')
      }

      const result = await window.electron.restoreData(backupData)
      
      if (result.success) {
        logger.info('Backup restored successfully')
        return { success: true }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      logger.error('Backup restoration failed', error)
      return { success: false, error: error.message }
    }
  }
} 