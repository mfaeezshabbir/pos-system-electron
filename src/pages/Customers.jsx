import React from 'react'
import {
    Box,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip
} from '@mui/material'
import { Add, Edit, Payment, History } from '@mui/icons-material'
import useCustomerStore from '../stores/useCustomerStore'
import useTransactionStore from '../stores/useTransactionStore'
import { formatCurrency } from '../utils/formatters'
import CreditPaymentDialog from '../components/POS/CreditPaymentDialog'

const CustomerDialog = ({ open, onClose, customer = null }) => {
    const { addCustomer, updateCustomer } = useCustomerStore()
    const [formData, setFormData] = React.useState({
        name: customer?.name || '',
        phone: customer?.phone || '',
        creditLimit: customer?.creditLimit || 0
    })

    React.useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                phone: customer.phone,
                creditLimit: customer.creditLimit
            })
        }
    }, [customer])

    const handleSubmit = () => {
        if (formData.name && formData.phone) {
            if (customer) {
                updateCustomer(customer.id, formData)
            } else {
                addCustomer(formData)
            }
            onClose()
            setFormData({ name: '', phone: '', creditLimit: 0 })
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {customer ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    type="number"
                    label="Credit Limit"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: Math.max(0, parseFloat(e.target.value)) }))}
                    margin="normal"
                    InputProps={{ inputProps: { min: 0 } }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={!formData.name || !formData.phone}
                >
                    {customer ? 'Update' : 'Add'} Customer
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const TransactionHistoryDialog = ({ open, onClose, customer }) => {
    if (!customer) return null

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Transaction History - {customer.name}</DialogTitle>
            <DialogContent>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell>Amount</TableCell>
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
                                customer.transactions.map(transaction => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            {new Date(transaction.timestamp).toLocaleString()}
                                        </TableCell>
                                        <TableCell>{transaction.type}</TableCell>
                                        <TableCell>
                                            {transaction.items?.map(item => item.name).join(', ') || '-'}
                                        </TableCell>
                                        <TableCell>{formatCurrency(transaction.total || transaction.amount)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={transaction.status}
                                                color={transaction.status === 'completed' ? 'success' : 'warning'}
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

const Customers = () => {
    const { customers, updateCustomerCredit } = useCustomerStore()
    const [addDialogOpen, setAddDialogOpen] = React.useState(false)
    const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false)
    const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false)
    const [selectedCustomer, setSelectedCustomer] = React.useState(null)

    const handlePayment = (amount) => {
        if (selectedCustomer) {
            updateCustomerCredit(selectedCustomer.id, -amount)
            useTransactionStore.getState().addTransaction({
                id: Date.now().toString(),
                customerId: selectedCustomer.id,
                amount,
                type: 'credit_payment',
                timestamp: new Date().toISOString(),
                status: 'completed'
            })
            setPaymentDialogOpen(false)
        }
    }

    const handleDialogClose = () => {
        setSelectedCustomer(null)
        setAddDialogOpen(false)
        setPaymentDialogOpen(false)
        setHistoryDialogOpen(false)
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Customers</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setAddDialogOpen(true)}
                >
                    Add Customer
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Credit Limit</TableCell>
                            <TableCell>Current Credit</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No customers found
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map(customer => (
                                <TableRow key={customer.id}>
                                    <TableCell>{customer.name}</TableCell>
                                    <TableCell>{customer.phone}</TableCell>
                                    <TableCell>{formatCurrency(customer.creditLimit)}</TableCell>
                                    <TableCell>
                                        <Typography
                                            color={customer.currentCredit > 0 ? 'error' : 'success'}
                                            fontWeight="medium"
                                        >
                                            {formatCurrency(customer.currentCredit)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => {
                                                setSelectedCustomer(customer)
                                                setAddDialogOpen(true)
                                            }}
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => {
                                                setSelectedCustomer(customer)
                                                setPaymentDialogOpen(true)
                                            }}
                                            disabled={customer.currentCredit <= 0}
                                        >
                                            <Payment />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => {
                                                setSelectedCustomer(customer)
                                                setHistoryDialogOpen(true)
                                            }}
                                        >
                                            <History />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <CustomerDialog
                open={addDialogOpen}
                onClose={handleDialogClose}
                customer={selectedCustomer}
            />

            <CreditPaymentDialog
                open={paymentDialogOpen}
                onClose={handleDialogClose}
                customer={selectedCustomer}
                onPayment={handlePayment}
            />

            <TransactionHistoryDialog
                open={historyDialogOpen}
                onClose={handleDialogClose}
                customer={selectedCustomer}
            />
        </Box>
    )
}

export default Customers