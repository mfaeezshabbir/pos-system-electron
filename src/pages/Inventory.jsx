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

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + N to add new product
      if ((e.ctrlKey || e.metaKey) && e.key === "n" && canAccessImportExport) {
        e.preventDefault();
        setIsFormOpen(true);
      }
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        document.querySelector('input[type="search"]')?.focus();
      }
      // Esc to close dialogs
      if (e.key === "Escape") {
        if (isFormOpen) setIsFormOpen(false);
        if (isCategoryDialogOpen) setIsCategoryDialogOpen(false);
        if (deleteConfirmOpen) setDeleteConfirmOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFormOpen, isCategoryDialogOpen, deleteConfirmOpen]);

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
    <Box
      sx={{
        height: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="h4" fontWeight="700">
            Inventory Management
          </Typography>

          <Stack direction="row" spacing={2}>
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
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                }}
              >
                Manage Categories
                <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                  Alt+C
                </Typography>
              </Button>
            )}

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
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                }}
              >
                Add Product
                <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                  Ctrl+N
                </Typography>
              </Button>
            )}
          </Stack>
        </Stack>

        <Box sx={{ mt: 3 }}>
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
            placeholder="Search products (Ctrl+F)..."
            inert={
              isFormOpen || isCategoryDialogOpen || deleteConfirmOpen
                ? ""
                : undefined
            }
          />
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        {canAccessImportExport ? (
          <Box sx={{ height: "100%" }}>
            <Paper
              elevation={0}
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Tabs
                value={tab}
                onChange={handleTabChange}
                inert={
                  isFormOpen || isCategoryDialogOpen || deleteConfirmOpen
                    ? ""
                    : undefined
                }
                sx={{
                  px: 2,
                  "& .MuiTab-root": {
                    minHeight: 48,
                    fontWeight: 600,
                  },
                }}
              >
                <Tab label="Products" />
                <Tab label="Import/Export" />
              </Tabs>
            </Paper>

            <Box sx={{ height: "calc(100% - 49px)", overflow: "auto", p: 3 }}>
              {tab === 0 && (
                <ProductList
                  products={products.filter(
                    (product) =>
                      product.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      product.sku
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
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
            </Box>
          </Box>
        ) : (
          <Box sx={{ height: "100%", p: 3, overflow: "auto" }}>
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
          </Box>
        )}
      </Box>

      {/* Dialogs */}
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
                message: `Product ${
                  selectedProduct ? "updated" : "added"
                } successfully`,
              });
            } else {
              console.error("Failed to save product");
              useNotificationStore.getState().addNotification({
                message: `Failed to ${
                  selectedProduct ? "update" : "add"
                } product`,
                type: "error",
              });
            }
          } catch (error) {
            console.error("Error saving product:", error);
            useNotificationStore.getState().addNotification({
              message: `Error: ${error.message}`,
              type: "error",
            });
          }
        }}
        initialData={selectedProduct}
      />

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
