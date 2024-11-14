import Papa from 'papaparse'
import { isValidPrice, isValidQuantity, isValidSKU } from './validators'
import { generateSKU } from './formatters'

export const parseProductsCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const products = results.data.map(row => ({
          name: row.name?.trim(),
          sku: row.sku?.trim() || generateSKU(row.category, Date.now()),
          category: row.category?.trim(),
          price: parseFloat(row.price),
          stock: parseInt(row.stock),
          description: row.description?.trim(),
          minStock: parseInt(row.minStock) || 10,
          maxStock: parseInt(row.maxStock) || 100,
          unit: row.unit?.trim() || 'piece',
          barcode: row.barcode?.trim(),
          supplier: row.supplier?.trim(),
          costPrice: parseFloat(row.costPrice) || 0,
        }))

        // Validate products
        const validProducts = products.filter(product => 
          product.name &&
          product.category &&
          isValidPrice(product.price) &&
          isValidQuantity(product.stock)
        )

        resolve(validProducts)
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}

export const exportToCSV = (data, filename) => {
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
} 