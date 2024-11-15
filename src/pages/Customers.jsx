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
    TableRow
} from '@mui/material'
import { Add } from '@mui/icons-material'
import useCustomerStore from '../stores/useCustomerStore'
import CustomerDialog from '../components/Customers/CustomerDialog'
import TransactionHistoryDialog from '../components/Customers/TransactionHistoryDialog'
import CustomerTableRow from '../components/Customers/CustomerTableRow'
import SearchBar from '../components/common/SearchBar'
import ConfirmDialog from '../components/common/ConfirmDialog'

const Customers = () => {
    const { customers } = useCustomerStore()
    const [selectedCustomer, setSelectedCustomer] = React.useState(null)
    const [addDialogOpen, setAddDialogOpen] = React.useState(false)
    const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
    const [customerToDelete, setCustomerToDelete] = React.useState(null)

    const handleDialogClose = () => {
        setSelectedCustomer(null)
        setAddDialogOpen(false)
        setHistoryDialogOpen(false)
    }

    const handleEditCustomer = (customer) => {
        setSelectedCustomer(customer)
        setAddDialogOpen(true)
    }

    const handleViewHistory = (customer) => {
        setSelectedCustomer(customer)
        setHistoryDialogOpen(true)
    }

    const handleDeleteClick = (customer) => {
        setCustomerToDelete(customer)
        setDeleteConfirmOpen(true)
    }

    const handleConfirmDelete = () => {
        if (customerToDelete) {
            deleteCustomer(customerToDelete.id)
            setCustomerToDelete(null)
        }
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

            <Box sx={{ mb: 3 }}>
                <SearchBar
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery('')}
                    placeholder="Search customers..."
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Customer Details</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers
                            .filter(customer => 
                                customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                customer.phone.includes(searchQuery) ||
                                customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map(customer => (
                                <CustomerTableRow
                                    key={customer.id}
                                    customer={customer}
                                    onEdit={handleEditCustomer}
                                    onDelete={handleDeleteClick}
                                    onViewHistory={handleViewHistory}
                                />
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <CustomerDialog
                open={addDialogOpen}
                onClose={handleDialogClose}
                customer={selectedCustomer}
            />

            <TransactionHistoryDialog
                open={historyDialogOpen}
                onClose={handleDialogClose}
                customer={selectedCustomer}
            />

            <ConfirmDialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Customer"
                message={`Are you sure you want to delete ${customerToDelete?.name}? This action cannot be undone.`}
                severity="error"
                confirmText="Delete"
            />
        </Box>
    )
}

export default Customers