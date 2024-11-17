import React from "react";
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Button,
  Box,
  TextField,
  Alert,
  Snackbar,
} from "@mui/material";
import useSettingsStore from "../../stores/useSettingsStore";

const SystemSettings = () => {
  const { systemSettings, updateSystemSettings } = useSettingsStore();
  const [formData, setFormData] = React.useState(systemSettings);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [name]: event.target.checked,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      updateSystemSettings(formData);
      setShowSuccess(true);
      setError("");
    } catch (err) {
      setError("Failed to update settings");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Theme</InputLabel>
            <Select
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              label="Theme"
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              name="language"
              value={formData.language}
              onChange={handleChange}
              label="Language"
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Date Format</InputLabel>
            <Select
              name="dateFormat"
              value={formData.dateFormat}
              onChange={handleChange}
              label="Date Format"
            >
              <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
              <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
              <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Time Format</InputLabel>
            <Select
              name="timeFormat"
              value={formData.timeFormat}
              onChange={handleChange}
              label="Time Format"
            >
              <MenuItem value="12h">12 Hour</MenuItem>
              <MenuItem value="24h">24 Hour</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Timezone</InputLabel>
            <Select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              label="Timezone"
            >
              <MenuItem value="UTC">UTC</MenuItem>
              <MenuItem value="EST">EST</MenuItem>
              <MenuItem value="PST">PST</MenuItem>
              <MenuItem value="GMT">GMT</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Backup Settings
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={formData.autoBackup}
                onChange={handleSwitchChange("autoBackup")}
              />
            }
            label="Enable Automatic Backup"
          />

          {formData.autoBackup && (
            <Box sx={{ ml: 3, mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Backup Frequency</InputLabel>
                <Select
                  name="backupFrequency"
                  value={formData.backupFrequency}
                  onChange={handleChange}
                  label="Backup Frequency"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type="number"
                label="Retention Days"
                name="retentionDays"
                value={formData.retentionDays}
                onChange={handleChange}
                inputProps={{ min: 1, max: 365 }}
              />
            </Box>
          )}
        </Grid> */}

        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        message="Settings saved successfully"
      />
    </form>
  );
};

export default SystemSettings;
