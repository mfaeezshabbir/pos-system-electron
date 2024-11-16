import { create } from 'zustand'
import { dbOperations, STORES } from '../utils/db'
import defaultLogo from '../assets/default-business-logo';

const DEFAULT_BUSINESS_INFO = {
  name: 'SNS ZARAI MARKAZ',
  address: 'Fedar Adda, Minchinabad',
  phone: '03421590004',
  email: 'snszaraimarkaz@gmail.com',
  website: 'www.snszaraimarkaz.com',
  taxId: '',
  logo: defaultLogo
};

const useSettingsStore = create((set, get) => ({
  businessInfo: DEFAULT_BUSINESS_INFO,
  receiptSettings: {
    footer: 'Thank you for your business!',
    returnPolicy: 'Returns accepted within 7 days with receipt',
    showQR: false
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
  },

  initializeSettings: async () => {
    try {
      const settings = await dbOperations.get(STORES.SETTINGS, 'appSettings');
      if (settings) {
        set({
          businessInfo: settings.businessInfo || DEFAULT_BUSINESS_INFO,
          receiptSettings: settings.receiptSettings || get().receiptSettings,
          posSettings: settings.posSettings || get().posSettings,
          systemSettings: settings.systemSettings || get().systemSettings,
          notificationSettings: settings.notificationSettings || get().notificationSettings
        });
      } else {
        // If no settings exist, save defaults
        const defaultSettings = {
          id: 'appSettings',
          businessInfo: DEFAULT_BUSINESS_INFO,
          receiptSettings: get().receiptSettings,
          posSettings: get().posSettings,
          systemSettings: get().systemSettings,
          notificationSettings: get().notificationSettings
        };
        await dbOperations.put(STORES.SETTINGS, defaultSettings);
        set(defaultSettings);
      }
    } catch (error) {
      console.error('Failed to initialize settings:', error);
    }
  },

  updateBusinessInfo: async (info) => {
    try {
      const settings = await dbOperations.get(STORES.SETTINGS, 'appSettings');
      const currentState = get();
      const updatedSettings = {
        ...settings,
        businessInfo: { ...info },
        receiptSettings: currentState.receiptSettings,
        posSettings: currentState.posSettings,
        systemSettings: currentState.systemSettings,
        notificationSettings: currentState.notificationSettings
      };
      await dbOperations.put(STORES.SETTINGS, updatedSettings);
      set({ businessInfo: info });
    } catch (error) {
      console.error('Failed to update business info:', error);
    }
  },

  updateSettings: async (section, settings) => {
    const sanitizedSettings = Object.entries(settings).reduce((acc, [key, value]) => {
      if (key === 'defaultTaxRate') {
        acc[key] = parseFloat(value) || 0;
      } else {
        acc[key] = typeof value === 'function' ? value.toString() : value;
      }
      return acc;
    }, {});

    const currentSettings = get();
    const newSettings = {
      ...currentSettings,
      [section]: {
        ...currentSettings[section],
        ...sanitizedSettings
      }
    };

    const settingsToStore = {
      id: 'appSettings',
      businessInfo: newSettings.businessInfo,
      receiptSettings: newSettings.receiptSettings,
      posSettings: newSettings.posSettings,
      systemSettings: newSettings.systemSettings,
      notificationSettings: newSettings.notificationSettings
    };

    await dbOperations.put(STORES.SETTINGS, settingsToStore);
    set(newSettings);
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