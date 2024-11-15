import React from 'react'
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Avatar,
    Grid,
    Alert,
    IconButton,
    Tooltip
} from '@mui/material'
import { Save, Person, PhotoCamera, Delete } from '@mui/icons-material'
import useAuthStore from '../stores/useAuthStore'

const Profile = () => {
    const { currentUser, updateUserProfile } = useAuthStore()
    const [formData, setFormData] = React.useState({
        name: currentUser?.name || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        profilePic: currentUser?.profilePic || null
    })
    const [error, setError] = React.useState('')
    const [success, setSuccess] = React.useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError('')
        setSuccess(false)
    }

    const handleImageChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    profilePic: reader.result
                }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess(false)

        if (formData.newPassword || formData.confirmPassword) {
            if (!formData.currentPassword) {
                setError('Current password is required to change password')
                return
            }
            if (formData.newPassword !== formData.confirmPassword) {
                setError('New passwords do not match')
                return
            }
        }

        try {
            await updateUserProfile({
                name: formData.name,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                profilePic: formData.profilePic
            })
            setSuccess(true)
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }))
        } catch (err) {
            setError(err.message)
        }
    }

    const handleRemoveImage = () => {
        setFormData(prev => ({
            ...prev,
            profilePic: null
        }))
    }

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h4" gutterBottom>Profile Settings</Typography>

            <Paper sx={{ p: 3, mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            src={formData.profilePic}
                            sx={{
                                width: 100,
                                height: 100,
                                mr: 2,
                                fontSize: '2.5rem'
                            }}
                        >
                            {currentUser?.name?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box sx={{
                            position: 'absolute',
                            bottom: -10,
                            right: 8,
                            display: 'flex',
                            gap: 1
                        }}>
                            <Tooltip title="Upload photo">
                                <IconButton
                                    sx={{ backgroundColor: 'background.paper' }}
                                    component="label"
                                    size="small"
                                >
                                    <input
                                        hidden
                                        accept="image/*"
                                        type="file"
                                        onChange={handleImageChange}
                                    />
                                    <PhotoCamera fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            {formData.profilePic && (
                                <Tooltip title="Remove photo">
                                    <IconButton
                                        sx={{ backgroundColor: 'background.paper' }}
                                        onClick={handleRemoveImage}
                                        size="small"
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant="h6">{currentUser?.name}</Typography>
                        <Typography color="textSecondary">{currentUser?.role}</Typography>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Change Password</Typography>
                            <TextField
                                fullWidth
                                label="Current Password"
                                name="currentPassword"
                                type="password"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="New Password"
                                name="newPassword"
                                type="password"
                                value={formData.newPassword}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Confirm New Password"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<Save />}
                                size="large"
                            >
                                Save Changes
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    )
}

export default Profile 