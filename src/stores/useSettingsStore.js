import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const defaultSettings = {
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
    thermalPrinterName: "",
  },
  posSettings: {
    defaultTaxRate: 0,
    currencySymbol: "Rs.",
    currencyCode: "PKR",
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
}

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      ...defaultSettings,

      updateSettings: (section, settings) => {
        set(state => ({
          [section]: {
            ...state[section],
            ...settings
          }
        }))
      },

      addQuickCategory: (category) => {
        set(state => ({
          posSettings: {
            ...state.posSettings,
            quickCategories: [...state.posSettings.quickCategories, category]
          }
        }))
      },

      removeQuickCategory: (categoryId) => {
        set(state => ({
          posSettings: {
            ...state.posSettings,
            quickCategories: state.posSettings.quickCategories.filter(cat => cat.id !== categoryId)
          }
        }))
      },

      addEmailRecipient: (email) => {
        set(state => ({
          notificationSettings: {
            ...state.notificationSettings,
            emailRecipients: [...state.notificationSettings.emailRecipients, email]
          }
        }))
      },

      removeEmailRecipient: (email) => {
        set(state => ({
          notificationSettings: {
            ...state.notificationSettings,
            emailRecipients: state.notificationSettings.emailRecipients.filter(e => e !== email)
          }
        }))
      },

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

      resetToDefaults: () => set(defaultSettings),

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