import React from 'react'
import {
    TableRow,
    TableCell,
    Typography,
    IconButton,
    Tooltip,
    Box
} from '@mui/material'
import { Edit, History } from '@mui/icons-material'

const CustomerTableRow = ({ customer, onEdit, onViewHistory }) => {
    return (
        <TableRow>
            <TableCell>
                <Typography variant="subtitle1">
                    {customer.name}
                </Typography>
                {customer.cnic && (
                    <Typography variant="caption" color="text.secondary">
                        CNIC: {customer.cnic}
                    </Typography>
                )}
                {customer.address && (
                    <Typography variant="caption" color="text.secondary" display="block">
                        {customer.address}
                    </Typography>
                )}
            </TableCell>
            <TableCell>
                <Box>
                    <Typography>{customer.phone}</Typography>
                    {customer.email && (
                        <Typography variant="caption" color="text.secondary">
                            {customer.email}
                        </Typography>
                    )}
                </Box>
            </TableCell>
            <TableCell>
                <Tooltip title="Edit Customer">
                    <IconButton onClick={() => onEdit(customer)}>
                        <Edit />
                    </IconButton>
                </Tooltip>
                <Tooltip title="View History">
                    <IconButton onClick={() => onViewHistory(customer)}>
                        <History />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    )
}

export default CustomerTableRow 