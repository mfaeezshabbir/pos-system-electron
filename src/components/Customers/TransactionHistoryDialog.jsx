import React from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Typography,
    Box,
    Button,
    Grid
} from '@mui/material'
import { formatCurrency } from '../../utils/formatters'

const TransactionHistoryDialog = ({ open, onClose, customer }) => {
    if (!customer) return null

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'success'
            case 'pending':
                return 'warning'
            case 'cancelled':
                return 'error'
            default:
                return 'default'
        }
    }

    const getTransactionType = (type) => {
        switch (type) {
            case 'sale':
                return 'Sale'
            case 'payment':
                return 'Payment'
            default:
                return type
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                        Transaction History
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Customer Details
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2">
                                <strong>Name:</strong> {customer.name}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Phone:</strong> {customer.phone}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {customer.cnic && (
                                <Typography variant="body2">
                                    <strong>CNIC:</strong> {customer.cnic}
                                </Typography>
                            )}
                            {customer.email && (
                                <Typography variant="body2">
                                    <strong>Email:</strong> {customer.email}
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {!customer.transactions?.length ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No transactions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customer.transactions.map(transaction => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            {new Date(transaction.timestamp).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {getTransactionType(transaction.type)}
                                        </TableCell>
                                        <TableCell align="right">
                                            {formatCurrency(transaction.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={transaction.status}
                                                color={getStatusColor(transaction.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    )
}

export default TransactionHistoryDialog 