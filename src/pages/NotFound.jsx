import React from 'react'
import {
    Box,
    Typography,
    Button,
    Container,
    Paper
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowBack } from '@mui/icons-material'

const NotFound = () => {
    const navigate = useNavigate()

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    textAlign: 'center'
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        width: '100%'
                    }}
                >
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: '6rem',
                            fontWeight: 'bold',
                            color: 'primary.main',
                            mb: 2
                        }}
                    >
                        404
                    </Typography>

                    <Typography
                        variant="h4"
                        sx={{ mb: 2 }}
                    >
                        Page Not Found
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 4 }}
                    >
                        The page you're looking for doesn't exist or has been moved.
                    </Typography>

                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <Button
                            variant="contained"
                            startIcon={<Home />}
                            onClick={() => navigate('/dashboard')}
                            sx={{ minWidth: 200 }}
                        >
                            Go to Dashboard
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<ArrowBack />}
                            onClick={() => navigate(-1)}
                            sx={{ minWidth: 200 }}
                        >
                            Go Back
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    )
}

export default NotFound