/**
 * @typedef {import('electron')} Electron
 * @typedef {{ backupData: (data: any) => Promise<{ success: boolean, error?: string }> }} ElectronAPI
 * @typedef {Window & { electron: ElectronAPI }} CustomWindow
 */

import { dbOperations } from './db'
import { logger } from './logger'
import { validateData } from './validation'

/**
 * @typedef {Object} ElectronBackupResponse
 * @property {boolean} success
 * @property {string} [error]
 */

/**
 * @typedef {Object} ElectronAPI 
 * @property {(data: any) => Promise<ElectronBackupResponse>} backupData
 */

/** @type {ElectronAPI} */
const electron = window.Electron;

export const backupManager = {
  async createBackup(options = {}) {
    try {
      // Collect all data
      const data = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        products: await dbOperations.getAll(STORES.PRODUCTS),
        customers: await dbOperations.getAll(STORES.CUSTOMERS),
        transactions: await dbOperations.getAll(STORES.TRANSACTIONS),
        settings: await dbOperations.getAll(STORES.SETTINGS)
      }

      // Validate backup data
      const validation = validateData(data, backupSchema)
      if (!validation.isValid) {
        throw new Error(`Invalid backup data: ${validation.errors.join(', ')}`)
      }

      // Create backup with versioning
      const result = await window.Electron.backupData({
        ...data,
        checksum: calculateChecksum(data),
        compressed: options.compress
      })

      if (result.success) {
        logger.info('Backup created successfully', { timestamp: data.timestamp })
        return { success: true, data }
      }

      throw new Error(result.error)
    } catch (error) {
      logger.error('Backup creation failed', error)
      return { success: false, error: error.message }
    }
  },

  async restoreBackup(backupData, options = {}) {
    try {
      // Validate backup format and version
      if (!this.isValidBackup(backupData)) {
        throw new Error('Invalid backup format')
      }

      // Version migration if needed
      const migratedData = await this.migrateBackupVersion(backupData)

      // Create temporary backup before restoration
      if (options.createTempBackup) {
        await this.createTemporaryBackup()
      }

      // Restore data in transaction
      await dbOperations.transaction(async () => {
        await this.clearCurrentData()
        await this.restoreAllData(migratedData)
      })

      logger.info('Backup restored successfully')
      return { success: true }
    } catch (error) {
      logger.error('Backup restoration failed', error)

      // Attempt recovery if temporary backup exists
      if (options.createTempBackup) {
        await this.recoverFromTemporaryBackup()
      }

      return { success: false, error: error.message }
    }
  }
} 