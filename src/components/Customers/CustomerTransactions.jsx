import React from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Typography,
    Box
} from '@mui/material'
import { formatCurrency } from '../../utils/formatters'

const CustomerTransactions = ({ open, onClose, customer }) => {
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

    const getTransactionColor = (type) => {
        switch (type) {
            case 'khata':
                return 'error.main'
            case 'payment':
                return 'success.main'
            default:
                return 'text.primary'
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                        Transaction History - {customer.name}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Current Balance: {formatCurrency(customer.currentCredit)}
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Details</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {customer.transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No transactions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customer.transactions
                                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                    .map(transaction => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>
                                                {new Date(transaction.timestamp).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Typography color={getTransactionColor(transaction.type)}>
                                                    {transaction.type === 'khata' ? 'Purchase' : 'Payment'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {transaction.items ?
                                                    transaction.items.map(item => item.name).join(', ') :
                                                    'Payment received'
                                                }
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography color={getTransactionColor(transaction.type)}>
                                                    {transaction.type === 'khata' ? '+ ' : '- '}
                                                    {formatCurrency(transaction.total || transaction.amount)}
                                                </Typography>
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
        </Dialog>
    )
}

export default CustomerTransactions 