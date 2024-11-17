import React from "react";
import {
  TableRow,
  TableCell,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import { Edit, History, Delete, Warning } from "@mui/icons-material";
import { formatCurrency } from "../../utils/formatters";

const CustomerTableRow = ({ customer, onEdit, onDelete, onViewHistory }) => {
  // Get status color based on credit and activity
  const getStatusColor = () => {
    if (!customer.transactions?.length) return "default"; // New customer
    if (customer.currentCredit === 0) return "success";
    if (customer.currentCredit > 0 && (!customer.creditLimit || customer.currentCredit < customer.creditLimit * 0.8))
      return "info";
    if (customer.creditLimit && customer.currentCredit >= customer.creditLimit * 0.8) 
      return "warning";
    return "error";
  };

  // Get status label with more detailed information
  const getStatusLabel = () => {
    if (!customer.transactions?.length) return "New";
    if (customer.currentCredit === 0) return "Clear";
    
    const hasUnpaidTransactions = customer.transactions?.some(
      t => t.type === 'khata' && !t.isPaid
    );

    if (hasUnpaidTransactions) {
      if (customer.creditLimit) {
        const creditPercentage = (customer.currentCredit / customer.creditLimit) * 100;
        if (creditPercentage >= 100) return "Over Limit";
        if (creditPercentage >= 80) return "Near Limit";
      }
      return "Active Credit";
    }

    return "Regular";
  };

  // Calculate credit percentage if credit limit exists
  const getCreditPercentage = () => {
    if (!customer.creditLimit) return null;
    return ((customer.currentCredit || 0) / customer.creditLimit) * 100;
  };

  const creditPercentage = getCreditPercentage();

  return (
    <TableRow>
      <TableCell>
        <Stack spacing={1}>
          <Typography variant="subtitle1">{customer.name}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              label={getStatusLabel()}
              color={getStatusColor()}
              sx={{ 
                borderRadius: 1,
                minWidth: 80,
                '& .MuiChip-label': {
                  px: 1
                }
              }}
            />
            {customer.currentCredit > 0 && (
              <Tooltip 
                title={customer.creditLimit ? 
                  `Credit Limit: ${formatCurrency(customer.creditLimit)}` : 
                  "No credit limit set"
                }
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography 
                    variant="body2" 
                    color={getStatusColor() === "error" ? "error" : "text.secondary"}
                  >
                    {formatCurrency(customer.currentCredit)}
                  </Typography>
                  {creditPercentage && creditPercentage >= 80 && (
                    <Warning 
                      color={getStatusColor()} 
                      sx={{ fontSize: 16 }}
                    />
                  )}
                </Stack>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack spacing={0.5}>
          <Typography variant="body2">{customer.phone}</Typography>
          {customer.cnic && (
            <Typography variant="body2" color="text.secondary">
              {customer.cnic}
            </Typography>
          )}
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          <Tooltip title="View History">
            <IconButton onClick={() => onViewHistory(customer)} color="primary">
              <History />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Customer">
            <IconButton onClick={() => onEdit(customer)} color="info">
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Customer">
            <IconButton onClick={() => onDelete(customer)} color="error">
              <Delete />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default CustomerTableRow;
