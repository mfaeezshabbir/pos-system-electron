import React from 'react'
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  LinearProgress
} from '@mui/material'
import { Upload, Download } from '@mui/icons-material'
import { parseProductsCSV, exportToCSV } from '../../utils/csvHandler'
import useInventoryStore from '../../stores/useInventoryStore'

const CsvUploader = () => {
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const { products, addBulkProducts } = useInventoryStore()

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const parsedProducts = await parseProductsCSV(file)
      addBulkProducts(parsedProducts)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleExport = () => {
    exportToCSV(products, 'inventory_export.csv')
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Import/Export Products
      </Typography>

      <Box sx={{ mb: 3 }}>
        <input
          accept=".csv"
          style={{ display: 'none' }}
          id="csv-file-upload"
          type="file"
          onChange={handleFileUpload}
        />
        <label htmlFor="csv-file-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<Upload />}
            disabled={uploading}
          >
            Import CSV
          </Button>
        </label>

        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExport}
          sx={{ ml: 2 }}
        >
          Export CSV
        </Button>
      </Box>

      {uploading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="textSecondary">
        CSV file should contain the following columns: SKU, Name, Category, Price, Stock, MinStock, Description
      </Typography>
    </Paper>
  )
}

export default CsvUploader 