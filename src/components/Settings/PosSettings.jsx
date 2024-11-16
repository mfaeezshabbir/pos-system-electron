import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Divider,
} from "@mui/material";
import useSettingsStore from "../../stores/useSettingsStore";
import useAuthStore, { ROLES } from "../../stores/useAuthStore";
import CurrencySettings from "./CurrencySettings";

const PosSettings = () => {
  const { posSettings, updateSettings } = useSettingsStore();
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === ROLES.ADMIN;

  const handleChange = (setting, value) => {
    if (setting === 'defaultTaxRate') {
      const numValue = parseFloat(value) || 0;
      const validValue = Math.min(Math.max(0, numValue), 100);
      updateSettings('posSettings', { [setting]: validValue });
    } else {
      updateSettings('posSettings', { [setting]: value });
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          POS Settings
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Low Stock Threshold"
            type="number"
            value={posSettings.lowStockThreshold}
            onChange={(e) =>
              handleChange("lowStockThreshold", parseInt(e.target.value))
            }
            fullWidth
          />

          <TextField
            label="Default Tax Rate (%)"
            type="number"
            value={posSettings.defaultTaxRate}
            onChange={(e) =>
              handleChange("defaultTaxRate", e.target.value)
            }
            fullWidth
            inputProps={{
              min: 0,
              max: 100,
              step: 0.1,
            }}
            helperText="Tax rate to be applied to all sales (0-100%)"
          />

          <Divider sx={{ my: 2 }} />

          {/* Currency Settings Section */}
          <CurrencySettings />

          <Divider sx={{ my: 2 }} />

          {isAdmin && (
            <>
              <FormControlLabel
                control={
                  <Switch
                    checked={posSettings.allowNegativeStock}
                    onChange={(e) =>
                      handleChange("allowNegativeStock", e.target.checked)
                    }
                  />
                }
                label="Allow Negative Stock"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={posSettings.requireCustomerForSale}
                    onChange={(e) =>
                      handleChange("requireCustomerForSale", e.target.checked)
                    }
                  />
                }
                label="Require Customer Information"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={posSettings.printAutomatically}
                    onChange={(e) =>
                      handleChange("printAutomatically", e.target.checked)
                    }
                  />
                }
                label="Auto Print Receipt"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={posSettings.showProductImages}
                    onChange={(e) =>
                      handleChange("showProductImages", e.target.checked)
                    }
                  />
                }
                label="Show Product Images"
              />
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PosSettings;
