import React from 'react'
import {
    TableRow,
    TableCell,
    Typography,
    IconButton,
    Tooltip,
    Box,
    Stack,
    Chip
} from '@mui/material'
import { Edit, History, Delete } from '@mui/icons-material'
import { formatCurrency } from '../../utils/formatters'

const CustomerTableRow = ({ customer, onEdit, onDelete, onViewHistory }) => {
    // Get status color based on credit
    const getStatusColor = () => {
        if (customer.currentCredit === 0) return 'success'
        if (customer.currentCredit > 0 && customer.currentCredit < customer.creditLimit * 0.8) return 'info'
        if (customer.currentCredit >= customer.creditLimit * 0.8) return 'warning'
        return 'error'
    }

    // Get status label
    const getStatusLabel = () => {
        if (customer.currentCredit === 0) return 'Paid'
        if (customer.currentCredit > 0 && customer.currentCredit < customer.creditLimit * 0.8) return 'Active'
        if (customer.currentCredit >= customer.creditLimit * 0.8) return 'Near Limit'
        return 'Over Limit'
    }

    return (
        <TableRow>
            <TableCell>
                <Stack spacing={1}>
                    <Typography variant="subtitle1">
                        {customer.name}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            size="small"
                            label={getStatusLabel()}
                            color={getStatusColor()}
                            sx={{ borderRadius: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            Credit: {formatCurrency(customer.currentCredit)}
                        </Typography>
                    </Stack>
                </Stack>
            </TableCell>
            <TableCell>
                <Stack spacing={0.5}>
                    <Typography variant="body2">
                        {customer.phone}
                    </Typography>
                    {customer.email && (
                        <Typography variant="body2" color="text.secondary">
                            {customer.email}
                        </Typography>
                    )}
                </Stack>
            </TableCell>
            <TableCell>
                <Stack direction="row" spacing={1}>
                    <IconButton onClick={() => onViewHistory(customer)} color="primary">
                        <History />
                    </IconButton>
                    <IconButton onClick={() => onEdit(customer)} color="info">
                        <Edit />
                    </IconButton>
                    <IconButton onClick={() => onDelete(customer)} color="error">
                        <Delete />
                    </IconButton>
                </Stack>
            </TableCell>
        </TableRow>
    )
}

export default CustomerTableRow 