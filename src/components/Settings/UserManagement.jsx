import React from 'react'
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Typography,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import useAuthStore, { ROLES } from '../../stores/useAuthStore'
import { dbOperations } from '../../utils/db'

const UserManagement = () => {
    const { currentUser } = useAuthStore()
    const [users, setUsers] = React.useState([])
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [editingUser, setEditingUser] = React.useState(null)
    const [formData, setFormData] = React.useState({
        username: '',
        name: '',
        password: '',
        role: ROLES.CASHIER
    })
    const [error, setError] = React.useState('')

    // Check if current user is manager
    const isManager = currentUser?.role === ROLES.MANAGER

    // Filter users based on role
    const filteredUsers = users.filter(user => {
        if (isManager) {
            return user.role === ROLES.CASHIER
        }
        return true
    })

    // Fetch users on component mount
    React.useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            const allUsers = await dbOperations.getAllUsers()
            if (!Array.isArray(allUsers)) {
                throw new Error('Invalid users data received')
            }
            setUsers(allUsers)
            setError('')
        } catch (err) {
            console.error('Error loading users:', err)
            setError('Failed to load users. Please try again later.')
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditingUser(user)
            setFormData({
                username: user.username,
                name: user.name,
                password: '',
                role: user.role
            })
        } else {
            setEditingUser(null)
            setFormData({
                username: '',
                name: '',
                password: '',
                role: ROLES.CASHIER
            })
        }
        setDialogOpen(true)
        setError('')
    }

    const handleCloseDialog = () => {
        setDialogOpen(false)
        setEditingUser(null)
        setFormData({
            username: '',
            name: '',
            password: '',
            role: ROLES.CASHIER
        })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (!formData.username || !formData.name || (!editingUser && !formData.password)) {
                setError('Please fill in all required fields')
                return
            }

            const userData = {
                ...formData,
                id: editingUser?.id || Date.now().toString()
            }

            if (editingUser) {
                if (!formData.password) {
                    delete userData.password
                }
                await dbOperations.updateUser(userData)
            } else {
                await dbOperations.addUser(userData)
            }

            await loadUsers()
            handleCloseDialog()
        } catch (err) {
            setError(err.message || 'Failed to save user')
        }
    }

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await dbOperations.deleteUser(userId)
                await loadUsers()
            } catch (err) {
                setError('Failed to delete user')
            }
        }
    }

    const getRoleColor = (role) => {
        switch (role) {
            case ROLES.ADMIN:
                return 'error'
            case ROLES.MANAGER:
                return 'primary'
            case ROLES.CASHIER:
                return 'success'
            default:
                return 'default'
        }
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">User Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Add {isManager ? 'Cashier' : 'User'}
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.role}
                                        color={getRoleColor(user.role)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(user)}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {editingUser ? 'Edit User' : `Add New ${isManager ? 'Cashier' : 'User'}`}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                            <TextField
                                fullWidth
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                disabled={!!editingUser}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                            <TextField
                                fullWidth
                                type="password"
                                label={editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required={!editingUser}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    name="role"
                                    value={isManager ? ROLES.CASHIER : formData.role}
                                    onChange={handleInputChange}
                                    label="Role"
                                    required
                                    disabled={isManager}
                                >
                                    {!isManager && <MenuItem value={ROLES.ADMIN}>Admin</MenuItem>}
                                    {!isManager && <MenuItem value={ROLES.MANAGER}>Manager</MenuItem>}
                                    <MenuItem value={ROLES.CASHIER}>Cashier</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            {editingUser ? 'Save Changes' : 'Add User'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    )
}

export default UserManagement 