import React from 'react'
import { Box, Paper, TextField, Button, Typography, Alert } from '@mui/material'
import useAuthStore from '../stores/useAuthStore'
import { useNavigate, useLocation } from 'react-router-dom'

const Login = () => {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const { login, error, clearError } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  React.useEffect(() => {
    clearError()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    const success = await login(username, password)
    if (success) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Login</Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button 
            fullWidth 
            variant="contained" 
            type="submit"
            sx={{ mt: 3 }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  )
}

export default Login 