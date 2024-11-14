import React from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Box,
    IconButton,
    Avatar,
    Alert,
    DialogContentText
} from '@mui/material'
import { PhotoCamera, Refresh } from '@mui/icons-material'
import useSettingsStore from '../../stores/useSettingsStore'
import useInventoryStore from '../../stores/useInventoryStore'

const ProductForm = ({ open, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = React.useState({
        name: '',
        sku: '',
        category: '',
        price: '',
        stock: '',
        minStock: '',
        description: '',
        image: null
    })
    const [imagePreview, setImagePreview] = React.useState(null)
    const [errors, setErrors] = React.useState({})
    const [showConfirmation, setShowConfirmation] = React.useState(false)

    React.useEffect(() => {
        if (initialData) {
            setFormData(initialData)
            setImagePreview(initialData.image)
        } else {
            setFormData({
                name: '',
                sku: '',
                category: '',
                price: '',
                stock: '',
                minStock: '',
                description: '',
                image: null
            })
            setImagePreview(null)
        }
    }, [initialData, open])

    const currencySymbol = useSettingsStore(state => state.posSettings.currencySymbol)
    const { categories } = useInventoryStore()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
                setFormData(prev => ({
                    ...prev,
                    image: reader.result
                }))
            }
            reader.readAsDataURL(file)
        }
    }

    const generateSKU = () => {
        const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PRD'
        const timestamp = Date.now().toString().slice(-4)
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
        const sku = `${prefix}-${timestamp}-${random}`

        setFormData(prev => ({
            ...prev,
            sku
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateForm()) {
            setShowConfirmation(true)
        }
    }

    const handleConfirm = () => {
        const submitData = initialData ? { ...formData, id: initialData.id } : formData
        onSubmit(submitData)
        setShowConfirmation(false)
        onClose()
    }

    // Form validation
    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required'
        }

        if (!formData.sku.trim()) {
            newErrors.sku = 'SKU is required'
        }

        if (!formData.category) {
            newErrors.category = 'Category is required'
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Price must be greater than 0'
        }

        if (!formData.stock || parseInt(formData.stock) < 0) {
            newErrors.stock = 'Stock cannot be negative'
        }

        if (!formData.minStock || parseInt(formData.minStock) < 0) {
            newErrors.minStock = 'Minimum stock cannot be negative'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {initialData ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                    <DialogContent>
                        {Object.keys(errors).length > 0 && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                Please correct the following errors:
                                <ul style={{ margin: 0, paddingLeft: 20 }}>
                                    {Object.values(errors).map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </Alert>
                        )}

                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            {/* Image Upload */}
                            <Grid item xs={12} md={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar
                                        src={imagePreview}
                                        sx={{ width: 100, height: 100 }}
                                        variant="rounded"
                                    />
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="image-upload"
                                        type="file"
                                        onChange={handleImageUpload}
                                    />
                                    <label htmlFor="image-upload">
                                        <IconButton
                                            color="primary"
                                            component="span"
                                            aria-label="upload product image"
                                        >
                                            <PhotoCamera />
                                        </IconButton>
                                    </label>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Product Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.name}
                                    helperText={errors.name}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        fullWidth
                                        label="SKU"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.sku}
                                        helperText={errors.sku}
                                    />
                                    <IconButton
                                        onClick={generateSKU}
                                        color="primary"
                                        sx={{ border: 1, borderColor: 'divider' }}
                                    >
                                        <Refresh />
                                    </IconButton>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        label="Category"
                                        onChange={handleChange}
                                        required
                                        error={!!errors.category}
                                        helperText={errors.category}
                                    >
                                        {categories.map(category => (
                                            <MenuItem key={category} value={category}>
                                                {category}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Price"
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.price}
                                    helperText={errors.price}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Stock"
                                    name="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.stock}
                                    helperText={errors.stock}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Min Stock"
                                    name="minStock"
                                    type="number"
                                    value={formData.minStock}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.minStock}
                                    helperText={errors.minStock}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="contained">Save</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
            >
                <DialogTitle>Confirm Changes</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to {initialData ? 'update' : 'add'} this product?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConfirmation(false)}>Cancel</Button>
                    <Button onClick={handleConfirm} variant="contained" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ProductForm 