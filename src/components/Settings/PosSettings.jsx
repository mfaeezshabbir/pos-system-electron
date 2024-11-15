import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Divider
} from '@mui/material'
import useSettingsStore from '../../stores/useSettingsStore'
import useAuthStore, { ROLES } from '../../stores/useAuthStore'
import CurrencySettings from './CurrencySettings'

const PosSettings = () => {
  const { posSettings, updateSettings } = useSettingsStore()
  const { currentUser } = useAuthStore()
  const isAdmin = currentUser?.role === ROLES.ADMIN

  const handleChange = (setting, value) => {
    updateSettings('posSettings', { [setting]: value })
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          POS Settings
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Low Stock Threshold"
            type="number"
            value={posSettings.lowStockThreshold}
            onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value))}
            fullWidth
          />

          <TextField
            label="Default Tax Rate (%)"
            type="number"
            value={posSettings.defaultTaxRate}
            onChange={(e) => handleChange('defaultTaxRate', parseFloat(e.target.value))}
            fullWidth
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
                    onChange={(e) => handleChange('allowNegativeStock', e.target.checked)}
                  />
                }
                label="Allow Negative Stock"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={posSettings.requireCustomerForSale}
                    onChange={(e) => handleChange('requireCustomerForSale', e.target.checked)}
                  />
                }
                label="Require Customer Information"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={posSettings.printAutomatically}
                    onChange={(e) => handleChange('printAutomatically', e.target.checked)}
                  />
                }
                label="Auto Print Receipt"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={posSettings.showProductImages}
                    onChange={(e) => handleChange('showProductImages', e.target.checked)}
                  />
                }
                label="Show Product Images"
              />
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default PosSettings 