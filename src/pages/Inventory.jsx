import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Stack,
} from "@mui/material";
import { Add, Category } from "@mui/icons-material";
import ProductList from "../components/Inventory/ProductList";
import ProductForm from "../components/Inventory/ProductForm";
import CsvUploader from "../components/Inventory/CsvUploader";
import CategoryDialog from "../components/Inventory/CategoryDialog";
import useInventoryStore from "../stores/useInventoryStore";
import { Permission } from "../components/Auth/Permission";
import { PERMISSIONS } from "../hooks/usePermissions";
import useNotificationStore from "../stores/useNotificationStore";
import useAuthStore, { ROLES } from "../stores/useAuthStore";
import SearchBar from "../components/common/SearchBar";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useSettingsStore from "../stores/useSettingsStore";

const Inventory = () => {
  const [tab, setTab] = React.useState(0);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = React.useState(false);
  const { products, addProduct, updateProduct, deleteProduct } =
    useInventoryStore();
  const { currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState(null);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const { posSettings } = useSettingsStore();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const checkLowStock = (product) => {
    if (
      posSettings.showLowStockWarning &&
      product.stock <= posSettings.lowStockThreshold
    ) {
      useNotificationStore.getState().addLowStockNotification(product);
    }
  };

  // Check if user is admin or manager
  const canAccessImportExport =
    currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.MANAGER;

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      const success = await deleteProduct(productToDelete.id);
      if (success) {
        setDeleteConfirmOpen(false);
        setProductToDelete(null);
        useNotificationStore.getState().addNotification({
          type: "success",
          message: "Product deleted successfully",
        });
      } else {
        useNotificationStore.getState().addNotification({
          message: "Failed to delete product",
          type: "error",
        });
      }
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Inventory Management</Typography>
        <Stack direction="row" spacing={2}>
          {/* Only admin can manage categories */}
          {currentUser?.role === ROLES.ADMIN && (
            <Button
              variant="outlined"
              startIcon={<Category />}
              onClick={() => setIsCategoryDialogOpen(true)}
              inert={
                isFormOpen || isCategoryDialogOpen || deleteConfirmOpen
                  ? ""
                  : undefined
              }
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
              inert={
                isFormOpen || isCategoryDialogOpen || deleteConfirmOpen
                  ? ""
                  : undefined
              }
            >
              Add Product
            </Button>
          )}
        </Stack>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery("")}
          placeholder="Search products..."
          inert={
            isFormOpen || isCategoryDialogOpen || deleteConfirmOpen
              ? ""
              : undefined
          }
        />
      </Box>

      {canAccessImportExport ? (
        <>
          <Paper sx={{ width: "100%", mb: 2 }}>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              inert={
                isFormOpen || isCategoryDialogOpen || deleteConfirmOpen
                  ? ""
                  : undefined
              }
            >
              <Tab label="Products" />
              <Tab label="Import/Export" />
            </Tabs>
          </Paper>

          {tab === 0 && (
            <ProductList
              products={products.filter(
                (product) =>
                  product.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  product.sku.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              userRole={currentUser?.role}
              inert={
                isFormOpen || isCategoryDialogOpen || deleteConfirmOpen
                  ? ""
                  : undefined
              }
            />
          )}

          {tab === 1 && (
            <CsvUploader
              inert={
                isFormOpen || isCategoryDialogOpen || deleteConfirmOpen
                  ? ""
                  : undefined
              }
            />
          )}
        </>
      ) : (
        <ProductList
          products={products.filter(
            (product) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.sku.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          userRole={currentUser?.role}
          inert={
            isFormOpen || isCategoryDialogOpen || deleteConfirmOpen
              ? ""
              : undefined
          }
        />
      )}

      {/* Product Form Dialog */}
      <ProductForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={async (formData) => {
          try {
            const success = selectedProduct
              ? await updateProduct(selectedProduct.id, formData)
              : await addProduct(formData);

            if (success) {
              setIsFormOpen(false);
              setSelectedProduct(null);
              useNotificationStore.getState().addNotification({
                type: "success",
                message: `Product ${selectedProduct ? "updated" : "added"} successfully`,
              });
            } else {
              console.error('Failed to save product');
              useNotificationStore.getState().addNotification({
                message: `Failed to ${selectedProduct ? "update" : "add"} product`,
                type: "error",
              });
            }
          } catch (error) {
            console.error('Error saving product:', error);
            useNotificationStore.getState().addNotification({
              message: `Error: ${error.message}`,
              type: "error",
            });
          }
        }}
        initialData={selectedProduct}
      />

      {/* Category Dialog - Only for admin */}
      {currentUser?.role === ROLES.ADMIN && (
        <CategoryDialog
          open={isCategoryDialogOpen}
          onClose={() => setIsCategoryDialogOpen(false)}
        />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete ${productToDelete?.name}?`}
        severity="error"
        confirmText="Delete"
      />
    </Box>
  );
};

export default Inventory;
