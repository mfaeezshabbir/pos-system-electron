import useAuthStore from '../stores/useAuthStore'

export const PERMISSIONS = {
  MANAGE_SETTINGS: 'MANAGE_SETTINGS',
  MANAGE_BUSINESS_INFO: 'MANAGE_BUSINESS_INFO',
  MANAGE_SYSTEM_SETTINGS: 'MANAGE_SYSTEM_SETTINGS',
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_INVENTORY: 'MANAGE_INVENTORY',
  MANAGE_CATEGORIES: 'MANAGE_CATEGORIES',
  IMPORT_EXPORT: 'IMPORT_EXPORT',
  PROCESS_SALES: 'PROCESS_SALES',
  VIEW_REPORTS: 'VIEW_REPORTS'
}

const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS),
  manager: [
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.MANAGE_CATEGORIES,
    PERMISSIONS.IMPORT_EXPORT,
    PERMISSIONS.PROCESS_SALES,
    PERMISSIONS.VIEW_REPORTS
  ],
  cashier: [
    PERMISSIONS.PROCESS_SALES
  ]
}

export const usePermissions = () => {
  const { currentUser } = useAuthStore()

  const hasPermission = (permission) => {
    if (!currentUser) return false
    return ROLE_PERMISSIONS[currentUser.role]?.includes(permission) || false
  }

  return { hasPermission }
} 