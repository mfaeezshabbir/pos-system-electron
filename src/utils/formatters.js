import { format } from 'date-fns'
import useSettingsStore from '../stores/useSettingsStore'

// Currency formatter
export const formatCurrency = (amount) => {
  const { currencySymbol } = useSettingsStore.getState().posSettings
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
  }).format(amount).replace('$', currencySymbol)
}

// Date formatter
export const formatDate = (date) => {
  const { dateFormat } = useSettingsStore.getState().systemSettings
  return format(new Date(date), dateFormat)
}

// Time formatter
export const formatTime = (date) => {
  const { timeFormat } = useSettingsStore.getState().systemSettings
  const format24 = "HH:mm"
  const format12 = "hh:mm a"
  return format(new Date(date), timeFormat === '24h' ? format24 : format12)
}

// Format phone number
export const formatPhoneNumber = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3]
  }
  return phoneNumber
}

// Generate SKU
export const generateSKU = (category, id) => {
  const categoryPrefix = category.substring(0, 3).toUpperCase()
  const timestamp = Date.now().toString().slice(-5)
  const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  return `${categoryPrefix}${timestamp}${randomNum}`
} 