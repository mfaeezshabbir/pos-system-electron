import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        <Header />
        <Box component="main" sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default Layout 