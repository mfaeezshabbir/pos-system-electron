import React from 'react'
import { usePermissions } from '../../hooks/usePermissions'

export const Permission = ({ permission, children }) => {
  const { hasPermission } = usePermissions()

  if (!hasPermission(permission)) {
    return null
  }

  return children
}

export default Permission 