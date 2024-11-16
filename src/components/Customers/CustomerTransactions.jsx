import React from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip
} from '@mui/material'
import { formatCurrency } from '../../utils/formatters'
import useCustomerStore from '../../stores/useCustomerStore'
import useNotificationStore from '../../stores/useNotificationStore'
import { CheckCircle, Payment } from '@mui/icons-material'
import useTransactionStore from '../../stores/useTransactionStore'

const CustomerTransactions = ({ open, onClose, customer }) => {
    const { updateTransactionPaymentStatus } = useCustomerStore();
    const { addNotification } = useNotificationStore();
    if (!customer) return null;

    const handlePaymentStatusUpdate = async (transaction) => {
        try {
            const success = await updateTransactionPaymentStatus(
                customer.id, 
                transaction.id, 
                !transaction.isPaid
            );
            
            if (success) {
                addNotification({
                    type: 'success',
                    message: `Transaction marked as ${transaction.isPaid ? 'unpaid' : 'paid'}`
                });
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            addNotification({
                type: 'error',
                message: 'Failed to update payment status'
            });
        }
    };

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
                                <TableCell align="right">Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {customer.transactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>{new Date(transaction.timestamp).toLocaleDateString()}</TableCell>
                                    <TableCell>{transaction.type}</TableCell>
                                    <TableCell align="right">{formatCurrency(transaction.total)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={transaction.isPaid ? 'Paid' : 'Unpaid'}
                                            color={transaction.isPaid ? 'success' : 'warning'}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {transaction.type === 'khata' && (
                                            <Button
                                                variant={transaction.isPaid ? 'outlined' : 'contained'}
                                                size="small"
                                                color={transaction.isPaid ? 'success' : 'primary'}
                                                onClick={() => handlePaymentStatusUpdate(transaction)}
                                                startIcon={transaction.isPaid ? <CheckCircle /> : <Payment />}
                                            >
                                                {transaction.isPaid ? 'Paid' : 'Mark as Paid'}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CustomerTransactions; 