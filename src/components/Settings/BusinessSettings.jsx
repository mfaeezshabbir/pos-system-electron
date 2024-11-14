import React from 'react'
import {
  Grid,
  TextField,
  Button,
  Box,
  Avatar
} from '@mui/material'
import useSettingsStore from '../../stores/useSettingsStore'

const BusinessSettings = () => {
  const { businessInfo, updateBusinessInfo } = useSettingsStore()
  const [formData, setFormData] = React.useState(businessInfo)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateBusinessInfo(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={formData.logo}
              sx={{ width: 100, height: 100, mr: 2 }}
            />
            <Button
              variant="outlined"
              component="label"
            >
              Upload Logo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleLogoChange}
              />
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Business Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Tax ID"
            name="taxId"
            value={formData.taxId}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            name="address"
            multiline
            rows={2}
            value={formData.address}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
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
  )
}

export default BusinessSettings 