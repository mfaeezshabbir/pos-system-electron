// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone
export const isValidPhone = (phone) => {
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
  return phoneRegex.test(phone)
}

// Validate price
export const isValidPrice = (price) => {
  return !isNaN(price) && parseFloat(price) >= 0
}

// Validate quantity
export const isValidQuantity = (quantity) => {
  return Number.isInteger(quantity) && quantity >= 0
}

// Validate SKU
export const isValidSKU = (sku) => {
  const skuRegex = /^[A-Z]{3}\d{7}$/
  return skuRegex.test(sku)
} 