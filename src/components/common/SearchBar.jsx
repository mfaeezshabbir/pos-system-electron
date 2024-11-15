import React from 'react'
import {
  Paper,
  InputBase,
  IconButton,
  Tooltip,
  Box
} from '@mui/material'
import {
  Search,
  Clear
} from '@mui/icons-material'

const SearchBar = ({ 
  value, 
  onChange, 
  onClear, 
  placeholder = 'Search...',
  fullWidth = true 
}) => {
  return (
    <Paper
      component="form"
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: fullWidth ? '100%' : 'auto'
      }}
    >
      <IconButton sx={{ p: '10px' }} aria-label="search">
        <Search />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        inputProps={{ 'aria-label': 'search' }}
      />
      {value && (
        <Tooltip title="Clear search">
          <IconButton 
            sx={{ p: '10px' }} 
            aria-label="clear"
            onClick={onClear}
          >
            <Clear />
          </IconButton>
        </Tooltip>
      )}
    </Paper>
  )
}

export default SearchBar 