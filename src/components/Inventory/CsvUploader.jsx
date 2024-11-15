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
import { parseProductsCSV } from '../../utils/csvHandler'
import useInventoryStore from '../../stores/useInventoryStore'
import { exportInventoryData } from '../../utils/exportHandler'
import { importInventoryData } from '../../utils/importHandler'

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
      const products = await importInventoryData(file)
      addBulkProducts(products)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleExport = async () => {
    try {
      await exportInventoryData(products)
    } catch (error) {
      setError('Export failed: ' + error.message)
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Import/Export Products
      </Typography>

      <Box sx={{ mb: 3 }}>
        <input
          accept=".csv,.zip"
          style={{ display: 'none' }}
          id="file-upload"
          type="file"
          onChange={handleFileUpload}
        />
        <label htmlFor="file-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<Upload />}
            disabled={uploading}
          >
            Import Data
          </Button>
        </label>

        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExport}
          sx={{ ml: 2 }}
        >
          Export Data
        </Button>
      </Box>

      {uploading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="textSecondary">
        Supported formats: CSV file or ZIP archive containing CSV and images
      </Typography>
    </Paper>
  )
}

export default CsvUploader 