import JSZip from 'jszip'
import Papa from 'papaparse'

export const importInventoryData = async (file) => {
    if (file.type === 'application/zip') {
        return await handleZipImport(file)
    } else if (file.type === 'text/csv') {
        return await handleCsvImport(file)
    }
    throw new Error('Unsupported file format')
}

const handleZipImport = async (zipFile) => {
    const zip = await JSZip.loadAsync(zipFile)

    // Read CSV file
    const csvFile = zip.file("inventory.csv")
    if (!csvFile) throw new Error('No inventory.csv found in ZIP')

    const csvContent = await csvFile.async("string")
    const { data } = Papa.parse(csvContent, { header: true })

    // Process each product and load its image
    const products = await Promise.all(data.map(async (row) => {
        const product = {
            sku: row.SKU,
            name: row.Name,
            category: row.Category,
            price: parseFloat(row.Price),
            stock: parseInt(row.Stock),
            minStock: parseInt(row.MinStock) || 5,
            description: row.Description || '',
            image: null
        }

        if (row.ImagePath) {
            const imageFile = zip.file(row.ImagePath)
            if (imageFile) {
                const imageBlob = await imageFile.async("blob")
                product.image = await blobToBase64(imageBlob)
            }
        }

        return product
    }))

    return products
}

const handleCsvImport = async (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    reject(new Error('Invalid CSV format'))
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
                    image: row.Image || null
                }))

                resolve(products)
            },
            error: (error) => {
                reject(error)
            }
        })
    })
}

const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}