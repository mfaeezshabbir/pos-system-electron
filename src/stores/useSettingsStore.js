import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Business Information
      businessInfo: {
        name: '',
        address: '',
        phone: '',
        email: '',
        taxId: '',
        logo: null,
      },

      // Receipt Settings
      receiptSettings: {
        showLogo: true,
        footer: '',
        header: '',
        fontSize: 12,
        printAutomatically: true,
        copies: 1,
        thermalPrinterName: '',
      },

      // POS Settings
      posSettings: {
        defaultTaxRate: 0,
        currencySymbol: '$',
        currencyCode: 'USD',
        lowStockThreshold: 10,
        allowNegativeStock: false,
        requireCustomerForSale: false,
        requireCashierNote: false,
        showProductImages: true,
        itemsPerPage: 12,
        quickCategories: [],
      },

      // System Settings
      systemSettings: {
        language: 'en',
        theme: 'light',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        timezone: 'UTC',
        autoBackup: true,
        backupFrequency: 'daily',
        retentionDays: 30,
      },

      // Notification Settings
      notificationSettings: {
        lowStockAlerts: true,
        dailyReports: true,
        salesAlerts: true,
        emailNotifications: false,
        emailRecipients: [],
      },

      // Update business info
      updateBusinessInfo: (info) => {
        set(state => ({
          businessInfo: {
            ...state.businessInfo,
            ...info
          }
        }))
      },

      // Update receipt settings
      updateReceiptSettings: (settings) => {
        set(state => ({
          receiptSettings: {
            ...state.receiptSettings,
            ...settings
          }
        }))
      },

      // Update POS settings
      updatePOSSettings: (settings) => {
        set(state => ({
          posSettings: {
            ...state.posSettings,
            ...settings
          }
        }))
      },

      // Update system settings
      updateSystemSettings: (settings) => {
        set(state => ({
          systemSettings: {
            ...state.systemSettings,
            ...settings
          }
        }))
      },

      // Update notification settings
      updateNotificationSettings: (settings) => {
        set(state => ({
          notificationSettings: {
            ...state.notificationSettings,
            ...settings
          }
        }))
      },

      // Add quick category
      addQuickCategory: (category) => {
        set(state => ({
          posSettings: {
            ...state.posSettings,
            quickCategories: [...state.posSettings.quickCategories, category]
          }
        }))
      },

      // Remove quick category
      removeQuickCategory: (categoryId) => {
        set(state => ({
          posSettings: {
            ...state.posSettings,
            quickCategories: state.posSettings.quickCategories
              .filter(cat => cat.id !== categoryId)
          }
        }))
      },

      // Update logo
      updateLogo: (logoData) => {
        set(state => ({
          businessInfo: {
            ...state.businessInfo,
            logo: logoData
          }
        }))
      },

      // Add email recipient
      addEmailRecipient: (email) => {
        set(state => ({
          notificationSettings: {
            ...state.notificationSettings,
            emailRecipients: [...state.notificationSettings.emailRecipients, email]
          }
        }))
      },

      // Remove email recipient
      removeEmailRecipient: (email) => {
        set(state => ({
          notificationSettings: {
            ...state.notificationSettings,
            emailRecipients: state.notificationSettings.emailRecipients
              .filter(e => e !== email)
          }
        }))
      },

      // Export settings
      exportSettings: () => {
        const state = get()
        const settings = {
          businessInfo: state.businessInfo,
          receiptSettings: state.receiptSettings,
          posSettings: state.posSettings,
          systemSettings: state.systemSettings,
          notificationSettings: state.notificationSettings
        }
        return JSON.stringify(settings, null, 2)
      },

      // Import settings
      importSettings: (settingsJson) => {
        try {
          const settings = JSON.parse(settingsJson)
          set({
            businessInfo: settings.businessInfo || get().businessInfo,
            receiptSettings: settings.receiptSettings || get().receiptSettings,
            posSettings: settings.posSettings || get().posSettings,
            systemSettings: settings.systemSettings || get().systemSettings,
            notificationSettings: settings.notificationSettings || get().notificationSettings
          })
          return true
        } catch (error) {
          console.error('Failed to import settings:', error)
          return false
        }
      },

      // Reset settings to defaults
      resetToDefaults: () => {
        set({
          businessInfo: {
            name: '',
            address: '',
            phone: '',
            email: '',
            taxId: '',
            logo: null,
          },
          receiptSettings: {
            showLogo: true,
            footer: '',
            header: '',
            fontSize: 12,
            printAutomatically: true,
            copies: 1,
            thermalPrinterName: '',
          },
          posSettings: {
            defaultTaxRate: 0,
            currencySymbol: '$',
            currencyCode: 'USD',
            lowStockThreshold: 10,
            allowNegativeStock: false,
            requireCustomerForSale: false,
            requireCashierNote: false,
            showProductImages: true,
            itemsPerPage: 12,
            quickCategories: [],
          },
          systemSettings: {
            language: 'en',
            theme: 'light',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
            timezone: 'UTC',
            autoBackup: true,
            backupFrequency: 'daily',
            retentionDays: 30,
          },
          notificationSettings: {
            lowStockAlerts: true,
            dailyReports: true,
            salesAlerts: true,
            emailNotifications: false,
            emailRecipients: [],
          }
        })
      },

      setCurrency: (currencySymbol, currencyCode) => {
        set(state => ({
          posSettings: {
            ...state.posSettings,
            currencySymbol,
            currencyCode
          }
        }))
      }
    }),
    {
      name: 'settings-storage',
      version: 1,
    }
  )
)

export default useSettingsStore 