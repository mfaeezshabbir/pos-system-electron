import { create } from 'zustand'
import { dbOperations, STORES } from '../utils/db'

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

const useSettingsStore = create((set, get) => ({
  ...defaultSettings,

  initializeSettings: async () => {
    const settings = await dbOperations.get(STORES.SETTINGS, 'appSettings')
    if (settings) {
      set(settings)
    } else {
      await dbOperations.put(STORES.SETTINGS, { 
        id: 'appSettings',
        ...defaultSettings 
      })
    }
  },

  updateSettings: async (section, settings) => {
    const currentSettings = get()
    const newSettings = {
      id: 'appSettings',
      ...currentSettings,
      [section]: {
        ...currentSettings[section],
        ...settings
      }
    }
    await dbOperations.put(STORES.SETTINGS, newSettings)
    set(newSettings)
  },

  addQuickCategory: async (category) => {
    const currentSettings = get()
    const newSettings = {
      ...currentSettings,
      posSettings: {
        ...currentSettings.posSettings,
        quickCategories: [...currentSettings.posSettings.quickCategories, category]
      }
    }
    await dbOperations.put(STORES.SETTINGS, {
      id: 'appSettings',
      ...newSettings
    })
    set(newSettings)
  },

  exportSettings: () => {
    const state = get()
    return JSON.stringify({
      businessInfo: state.businessInfo,
      receiptSettings: state.receiptSettings,
      posSettings: state.posSettings,
      systemSettings: state.systemSettings,
      notificationSettings: state.notificationSettings
    }, null, 2)
  },

  importSettings: async (settingsJson) => {
    try {
      const settings = JSON.parse(settingsJson)
      const newSettings = {
        id: 'appSettings',
        ...settings
      }
      await dbOperations.put(STORES.SETTINGS, newSettings)
      set(settings)
      return true
    } catch (error) {
      console.error('Failed to import settings:', error)
      return false
    }
  }
}))

export default useSettingsStore