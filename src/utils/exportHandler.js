import JSZip from 'jszip'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'

export const exportInventoryData = async (products) => {
  const zip = new JSZip()
  const images = zip.folder("images")
  
  // Prepare products data for CSV (without image data)
  const productsForCsv = products.map(product => {
    const { image, ...productWithoutImage } = product
    return {
      ...productWithoutImage,
      imagePath: image ? `images/${product.sku}.png` : ''
    }
  })

  // Add CSV file to ZIP
  const csv = Papa.unparse(productsForCsv.map(product => ({
    SKU: product.sku,
    Name: product.name,
    Category: product.category,
    Price: product.price,
    Stock: product.stock,
    MinStock: product.minStock,
    Description: product.description,
    ImagePath: product.imagePath
  })))
  
  zip.file("inventory.csv", csv)

  // Add images to ZIP
  for (const product of products) {
    if (product.image) {
      try {
        // Convert base64 to blob
        const imageData = product.image.split(',')[1]
        const imageBlob = await fetch(`data:image/png;base64,${imageData}`).then(r => r.blob())
        images.file(`${product.sku}.png`, imageBlob)
      } catch (error) {
        console.error(`Failed to process image for ${product.sku}:`, error)
      }
    }
  }

  // Generate and save ZIP file
  const content = await zip.generateAsync({ type: "blob" })
  saveAs(content, "inventory_export.zip")
} 