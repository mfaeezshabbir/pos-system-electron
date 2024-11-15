import React from "react";
import {
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Typography,
  Slider,
} from "@mui/material";
import useSettingsStore from "../../stores/useSettingsStore";

const ReceiptSettings = () => {
  const { receiptSettings, updateReceiptSettings } = useSettingsStore();
  const [formData, setFormData] = React.useState(receiptSettings);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.type === "checkbox" ? checked : value,
    }));
  };

  const handleFontSizeChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      fontSize: newValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateReceiptSettings(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.showLogo}
                onChange={handleChange}
                name="showLogo"
              />
            }
            label="Show Business Logo on Receipt"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Receipt Header"
            name="header"
            multiline
            rows={2}
            value={formData.header}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Receipt Footer"
            name="footer"
            multiline
            rows={2}
            value={formData.footer}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography gutterBottom>Font Size</Typography>
          <Slider
            value={formData.fontSize}
            onChange={handleFontSizeChange}
            min={8}
            max={16}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Number of Copies"
            name="copies"
            type="number"
            value={formData.copies}
            onChange={handleChange}
            inputProps={{ min: 1, max: 5 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Thermal Printer Name"
            name="thermalPrinterName"
            value={formData.thermalPrinterName}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.printAutomatically}
                onChange={handleChange}
                name="printAutomatically"
              />
            }
            label="Print Automatically After Sale"
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            Save Changes
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default ReceiptSettings;
