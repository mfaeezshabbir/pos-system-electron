import { format } from 'date-fns'
import useSettingsStore from '../stores/useSettingsStore'

const currencies = [
  { symbol: "Rs.", code: "PKR", name: "Pakistani Rupee" },
  { symbol: "$", code: "USD", name: "US Dollar" },
  { symbol: "€", code: "EUR", name: "Euro" },
  { symbol: "£", code: "GBP", name: "British Pound" },
  { symbol: "¥", code: "JPY", name: "Japanese Yen" },
  { symbol: "₹", code: "INR", name: "Indian Rupee" },
]

// Currency formatter
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PKR'
  }).format(amount);
}

// Date formatter
export const formatDate = (date) => {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    return format(dateObj, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
}

// Time formatter
export const formatTime = (date) => {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Time';
    }
    return format(dateObj, 'HH:mm:ss');
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'Invalid Time';
  }
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