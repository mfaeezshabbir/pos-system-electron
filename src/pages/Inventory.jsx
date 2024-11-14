import React from 'react'
import { 
  Box, 
  Paper, 
  Typography,
  Button,
  Tabs,
  Tab,
  Stack
} from '@mui/material'
import { Add, Category } from '@mui/icons-material'
import ProductList from '../components/Inventory/ProductList'
import ProductForm from '../components/Inventory/ProductForm'
import CsvUploader from '../components/Inventory/CsvUploader'
import CategoryDialog from '../components/Inventory/CategoryDialog'
import useInventoryStore from '../stores/useInventoryStore'
import { Permission } from '../components/Auth/Permission'
import { PERMISSIONS } from '../hooks/usePermissions'

const Inventory = () => {
  const [tab, setTab] = React.useState(0)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = React.useState(false)
  const { products, addProduct, updateProduct, deleteProduct } = useInventoryStore()

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4">Inventory Management</Typography>
        <Stack direction="row" spacing={2}>
          <Permission permission={PERMISSIONS.MANAGE_CATEGORIES}>
            <Button 
              variant="outlined"
              startIcon={<Category />}
              onClick={() => setIsCategoryDialogOpen(true)}
            >
              Manage Categories
            </Button>
          </Permission>
          <Permission permission={PERMISSIONS.MANAGE_INVENTORY}>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => setIsFormOpen(true)}
            >
              Add Product
            </Button>
          </Permission>
        </Stack>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab label="Products" />
          <Permission permission={PERMISSIONS.IMPORT_EXPORT}>
            <Tab label="Import/Export" />
          </Permission>
        </Tabs>
      </Paper>

      {tab === 0 && (
        <ProductList
          products={products}
          onEdit={updateProduct}
          onDelete={deleteProduct}
        />
      )}

      {tab === 1 && (
        <CsvUploader />
      )}

      {/* Product Form Dialog */}
      <ProductForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={addProduct}
      />

      <CategoryDialog
        open={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
      />
    </Box>
  )
}

export default Inventory 