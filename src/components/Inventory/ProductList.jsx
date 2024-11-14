import React from 'react'
import {
  Box,
  Grid,
  TextField,
  InputAdornment,
  Pagination,
  Stack,
  Dialog
} from '@mui/material'
import { Search } from '@mui/icons-material'
import useSettingsStore from '../../stores/useSettingsStore'
import ProductCard from './ProductCard'
import ProductForm from './ProductForm'

const ProductList = ({ products, onEdit, onDelete }) => {
  const [page, setPage] = React.useState(1)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [editingProduct, setEditingProduct] = React.useState(null)
  const itemsPerPage = 12

  const handleEdit = (product) => {
    setEditingProduct(product)
  }

  const handleEditSubmit = (updatedProduct) => {
    onEdit(updatedProduct)
    setEditingProduct(null)
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage)
  const displayedProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  return (
    <Box>
      <TextField
        fullWidth
        margin="normal"
        placeholder="Search products by name, SKU or category..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {displayedProducts.map(product => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <ProductCard
              product={product}
              onEdit={() => handleEdit(product)}
              onDelete={onDelete}
            />
          </Grid>
        ))}
      </Grid>

      {pageCount > 1 && (
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Stack>
      )}

      <ProductForm
        open={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSubmit={handleEditSubmit}
        initialData={editingProduct}
      />
    </Box>
  )
}

export default ProductList 