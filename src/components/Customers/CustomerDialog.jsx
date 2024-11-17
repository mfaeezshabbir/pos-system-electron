import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  FormControl,
  Stack,
  Chip,
  Typography,
} from "@mui/material";
import useCustomerStore from "../../stores/useCustomerStore";
import { formatCurrency } from "../../utils/formatters";

const CustomerDialog = ({ open, onClose, onSelect, customer = null }) => {
  const { customers, addCustomer, updateCustomer } = useCustomerStore();
  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    cnic: "",
    email: "",
    address: "",
    notes: "",
  });
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        phone: customer.phone || "",
        cnic: customer.cnic || "",
        email: customer.email || "",
        address: customer.address || "",
        notes: customer.notes || "",
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        cnic: "",
        email: "",
        address: "",
        notes: "",
      });
    }
    setError("");
  }, [customer, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "cnic") {
      // Remove any existing dashes
      const numbers = value.replace(/-/g, "");

      // Only allow numbers
      if (numbers.match(/^[0-9]*$/)) {
        // Format with dashes
        let formattedCNIC = numbers;
        if (numbers.length > 5) {
          formattedCNIC = numbers.slice(0, 5) + "-" + numbers.slice(5);
        }
        if (numbers.length > 12) {
          formattedCNIC =
            formattedCNIC.slice(0, 13) + "-" + formattedCNIC.slice(13);
        }
        // Limit to 15 characters (13 numbers + 2 dashes)
        formattedCNIC = formattedCNIC.slice(0, 15);

        setFormData((prev) => ({
          ...prev,
          [name]: formattedCNIC,
        }));
      }
    } else if (name === "phone") {
      // Remove any non-digit characters
      const numbers = value.replace(/\D/g, "");

      // Only allow numbers and limit to 11 digits
      if (numbers.match(/^[0-9]*$/)) {
        setFormData((prev) => ({
          ...prev,
          [name]: numbers.slice(0, 11),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting customer data:", formData);
      if (!formData.name || !formData.phone) {
        setError("Name and phone are required fields");
        return;
      }

      // Validate phone number
      if (formData.phone.length < 10) {
        setError("Phone number must be at least 10 digits");
        return;
      }

      const customerData = {
        ...formData,
        id: customer?.id || Date.now().toString(),
        transactions: customer?.transactions || [],
      };

      console.log("Processing customer data:", customerData);
      if (customer) {
        await updateCustomer(customer.id, customerData);
      } else {
        const result = await addCustomer(customerData);
        console.log("Add customer result:", result);
        if (!result) {
          setError("Failed to add customer");
          return;
        }
      }
      onClose();
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err.message || "Failed to save customer");
    }
  };

  // Add these status helper functions
  const getStatusColor = () => {
    if (!customer?.transactions?.length) return "default"; // New customer
    if (customer?.currentCredit === 0) return "success";
    if (
      customer?.currentCredit > 0 &&
      (!customer?.creditLimit ||
        customer?.currentCredit < customer?.creditLimit * 0.8)
    )
      return "info";
    if (
      customer?.creditLimit &&
      customer?.currentCredit >= customer?.creditLimit * 0.8
    )
      return "warning";
    return "error";
  };

  const getStatusLabel = () => {
    if (!customer?.transactions?.length) return "New";
    if (customer?.currentCredit === 0) return "Clear";

    const hasUnpaidTransactions = customer?.transactions?.some(
      (t) => t.type === "khata" && !t.isPaid
    );

    if (hasUnpaidTransactions) {
      if (customer?.creditLimit) {
        const creditPercentage =
          (customer?.currentCredit / customer?.creditLimit) * 100;
        if (creditPercentage >= 100) return "Over Limit";
        if (creditPercentage >= 80) return "Near Limit";
      }
      return "Active Credit";
    }

    return "Regular";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {customer ? "Edit Customer" : "Add New Customer"}
            </Typography>
            {customer && (
              <Stack spacing={1}>
                <Chip
                  size="small"
                  label={getStatusLabel()}
                  color={getStatusColor()}
                  sx={{
                    borderRadius: 1,
                    minWidth: 80,
                    "& .MuiChip-label": {
                      px: 1,
                    },
                  }}
                />
                {customer.currentCredit > 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    align="right"
                  >
                    Credit: {formatCurrency(customer.currentCredit)}
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="03001234567"
              inputProps={{ maxLength: 11 }}
              helperText="Enter a valid phone number (10-11 digits)"
            />
            <TextField
              fullWidth
              label="CNIC"
              name="cnic"
              value={formData.cnic}
              onChange={handleInputChange}
              placeholder="12345-1234567-1"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {customer ? "Save Changes" : "Add Customer"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CustomerDialog;
