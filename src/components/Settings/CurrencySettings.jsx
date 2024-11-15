import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import useSettingsStore from "../../stores/useSettingsStore";

const currencies = [
  { symbol: "Rs.", code: "PKR", name: "Pakistani Rupee" },
  { symbol: "$", code: "USD", name: "US Dollar" },
  { symbol: "€", code: "EUR", name: "Euro" },
  { symbol: "£", code: "GBP", name: "British Pound" },
  { symbol: "¥", code: "JPY", name: "Japanese Yen" },
  { symbol: "₹", code: "INR", name: "Indian Rupee" },
];

const CurrencySettings = () => {
  const { posSettings, setCurrency } = useSettingsStore();

  const handleCurrencyChange = (event) => {
    const currency = currencies.find((c) => c.code === event.target.value);
    if (currency) {
      setCurrency(currency.symbol, currency.code);
      // Force a re-render of components using currency
      window.dispatchEvent(new Event("currencyUpdate"));
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Currency Settings
      </Typography>
      <FormControl fullWidth>
        <InputLabel>Currency</InputLabel>
        <Select
          value={posSettings.currencyCode}
          label="Currency"
          onChange={handleCurrencyChange}
        >
          {currencies.map((currency) => (
            <MenuItem key={currency.code} value={currency.code}>
              {currency.symbol} - {currency.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default CurrencySettings;
