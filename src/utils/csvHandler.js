import Papa from 'papaparse'
import { DEFAULT_PRODUCT_IMAGE } from './constants'

export const parseProductsCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error('Invalid CSV format'))
          return
        }

        const requiredFields = ['SKU', 'Name', 'Category', 'Price', 'Stock']
        const hasRequiredFields = requiredFields.every(field =>
          results.meta.fields.includes(field)
        )

        if (!hasRequiredFields) {
          reject(new Error('Missing required columns'))
          return
        }

        const products = results.data.map(row => ({
          sku: row.SKU,
          name: row.Name,
          category: row.Category,
          price: parseFloat(row.Price),
          stock: parseInt(row.Stock),
          minStock: parseInt(row.MinStock) || 5,
          description: row.Description || '',
          image: row.Image || DEFAULT_PRODUCT_IMAGE
        }))

        resolve(products)
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}

export const exportToCSV = (products, filename) => {
  const csv = Papa.unparse(products.map(product => ({
    SKU: product.sku,
    Name: product.name,
    Category: product.category,
    Price: product.price,
    Stock: product.stock,
    MinStock: product.minStock,
    Description: product.description,
    Image: product.image || ''
  })))

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}