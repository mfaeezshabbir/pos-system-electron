import React from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    TextField,
    Box,
    Alert,
    DialogContentText
} from '@mui/material'
import { Delete, Edit, Save, Cancel } from '@mui/icons-material'
import useInventoryStore from '../../stores/useInventoryStore'

const CategoryDialog = ({ open, onClose }) => {
    const [newCategory, setNewCategory] = React.useState('')
    const [editingId, setEditingId] = React.useState(null)
    const [editValue, setEditValue] = React.useState('')
    const [error, setError] = React.useState('')
    
    const { categories, addCategory, deleteCategory, updateCategory } = useInventoryStore()

    const handleClose = () => {
        setNewCategory('')
        setEditingId(null)
        setEditValue('')
        setError('')
        onClose()
    }

    const handleAddCategory = () => {
        if (!newCategory.trim()) {
            setError('Category name cannot be empty')
            return
        }
        if (categories.includes(newCategory.trim())) {
            setError('Category already exists')
            return
        }
        addCategory(newCategory.trim())
        setNewCategory('')
        setError('')
    }

    const handleStartEdit = (category) => {
        setEditingId(category)
        setEditValue(category)
    }

    const handleSaveEdit = (oldCategory) => {
        if (!editValue.trim()) {
            setError('Category name cannot be empty')
            return
        }
        if (categories.includes(editValue.trim()) && editValue.trim() !== oldCategory) {
            setError('Category already exists')
            return
        }
        updateCategory(oldCategory, editValue.trim())
        setEditingId(null)
        setEditValue('')
        setError('')
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditValue('')
        setError('')
    }

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            aria-labelledby="category-dialog-title"
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle id="category-dialog-title">Manage Categories</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
                <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        label="New Category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <Button
                        variant="contained"
                        onClick={handleAddCategory}
                    >
                        Add
                    </Button>
                </Box>

                <List>
                    {categories.map((category) => (
                        <ListItem key={category}>
                            {editingId === category ? (
                                <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(category)}
                                        autoFocus
                                    />
                                    <IconButton onClick={() => handleSaveEdit(category)} color="primary">
                                        <Save />
                                    </IconButton>
                                    <IconButton onClick={handleCancelEdit} color="error">
                                        <Cancel />
                                    </IconButton>
                                </Box>
                            ) : (
                                <>
                                    <ListItemText primary={category} />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => handleStartEdit(category)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => deleteCategory(category)} color="error">
                                            <Delete />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </>
                            )}
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CategoryDialog