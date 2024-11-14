import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../stores/useAuthStore'

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const checkAuth = useAuthStore(state => state.checkAuth)
  const location = useLocation()
  
  if (!isAuthenticated || !checkAuth()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default PrivateRoute 