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
import useNotificationStore from '../stores/useNotificationStore'
import useAuthStore, { ROLES } from '../stores/useAuthStore'

const Inventory = () => {
  const [tab, setTab] = React.useState(0)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = React.useState(false)
  const { products, addProduct, updateProduct, deleteProduct } = useInventoryStore()
  const { posSettings } = useNotificationStore()
  const { currentUser } = useAuthStore()

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
  }

  const checkLowStock = (product) => {
    if (product.quantity <= posSettings.lowStockThreshold) {
      useNotificationStore.getState().addLowStockNotification(product)
    }
  }

  // Check if user is admin or manager
  const canAccessImportExport = currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.MANAGER

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
          {/* Only admin can manage categories */}
          {currentUser?.role === ROLES.ADMIN && (
            <Button
              variant="outlined"
              startIcon={<Category />}
              onClick={() => setIsCategoryDialogOpen(true)}
            >
              Manage Categories
            </Button>
          )}
          {/* Admin and manager can add products */}
          {canAccessImportExport && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setIsFormOpen(true)}
            >
              Add Product
            </Button>
          )}
        </Stack>
      </Box>

      {canAccessImportExport ? (
        <>
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Tabs value={tab} onChange={handleTabChange}>
              <Tab label="Products" />
              <Tab label="Import/Export" />
            </Tabs>
          </Paper>

          {tab === 0 && (
            <ProductList
              products={products}
              onEdit={updateProduct}
              onDelete={deleteProduct}
              userRole={currentUser?.role}
            />
          )}

          {tab === 1 && (
            <CsvUploader />
          )}
        </>
      ) : (
        <ProductList
          products={products}
          onEdit={updateProduct}
          onDelete={deleteProduct}
          userRole={currentUser?.role}
        />
      )}

      {/* Product Form Dialog */}
      <ProductForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={addProduct}
      />

      {/* Category Dialog - Only for admin */}
      {currentUser?.role === ROLES.ADMIN && (
        <CategoryDialog
          open={isCategoryDialogOpen}
          onClose={() => setIsCategoryDialogOpen(false)}
        />
      )}
    </Box>
  )
}

export default Inventory 