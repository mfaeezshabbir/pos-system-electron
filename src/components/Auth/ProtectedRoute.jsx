import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../../stores/useAuthStore'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, hasPermission } = useAuthStore()

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!hasPermission(requiredRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute 