import { useState, useCallback, useEffect, useMemo } from 'react';

export type RoleType = 'admin' | 'manager' | 'accountant' | 'auditor' | 'viewer' | 'custom';

export type Permission =
  // General
  | 'dashboard:view'
  // Invoices
  | 'invoices:view' | 'invoices:create' | 'invoices:edit' | 'invoices:delete' | 'invoices:send' | 'invoices:approve'
  // Receipts
  | 'receipts:view' | 'receipts:create' | 'receipts:edit' | 'receipts:delete' | 'receipts:approve'
  // Bookings
  | 'bookings:view' | 'bookings:create' | 'bookings:edit' | 'bookings:delete' | 'bookings:reverse' | 'bookings:approve'
  // Bank
  | 'bank:view' | 'bank:sync' | 'bank:reconcile' | 'bank:manage'
  // Reports
  | 'reports:view' | 'reports:export' | 'reports:bwa' | 'reports:balance' | 'reports:pnl' | 'reports:vat'
  // Contacts
  | 'contacts:view' | 'contacts:create' | 'contacts:edit' | 'contacts:delete'
  // Settings
  | 'settings:view' | 'settings:edit' | 'settings:company' | 'settings:integrations'
  // Users & Roles
  | 'users:view' | 'users:create' | 'users:edit' | 'users:delete' | 'users:roles'
  // Archive
  | 'archive:view' | 'archive:manage' | 'archive:delete'
  // Assets
  | 'assets:view' | 'assets:create' | 'assets:edit' | 'assets:dispose'
  // Budget
  | 'budget:view' | 'budget:create' | 'budget:edit'
  // Data
  | 'data:backup' | 'data:restore' | 'data:export' | 'data:import';

export type Module =
  | 'dashboard' | 'invoices' | 'receipts' | 'bookings' | 'bank'
  | 'reports' | 'contacts' | 'settings' | 'users' | 'archive'
  | 'assets' | 'budget' | 'data';

export interface Role {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  type: RoleType;
  permissions: Permission[];
  isSystem: boolean; // System roles cannot be deleted
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roleId: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  invitedBy?: string;
  mfaEnabled: boolean;
}

export interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: Module;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

// Default system roles with German accounting focus
const SYSTEM_ROLES: Role[] = [
  {
    id: 'role_admin',
    name: 'Administrator',
    nameEn: 'Administrator',
    description: 'Vollzugriff auf alle Funktionen',
    type: 'admin',
    permissions: [
      'dashboard:view',
      'invoices:view', 'invoices:create', 'invoices:edit', 'invoices:delete', 'invoices:send', 'invoices:approve',
      'receipts:view', 'receipts:create', 'receipts:edit', 'receipts:delete', 'receipts:approve',
      'bookings:view', 'bookings:create', 'bookings:edit', 'bookings:delete', 'bookings:reverse', 'bookings:approve',
      'bank:view', 'bank:sync', 'bank:reconcile', 'bank:manage',
      'reports:view', 'reports:export', 'reports:bwa', 'reports:balance', 'reports:pnl', 'reports:vat',
      'contacts:view', 'contacts:create', 'contacts:edit', 'contacts:delete',
      'settings:view', 'settings:edit', 'settings:company', 'settings:integrations',
      'users:view', 'users:create', 'users:edit', 'users:delete', 'users:roles',
      'archive:view', 'archive:manage', 'archive:delete',
      'assets:view', 'assets:create', 'assets:edit', 'assets:dispose',
      'budget:view', 'budget:create', 'budget:edit',
      'data:backup', 'data:restore', 'data:export', 'data:import',
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role_manager',
    name: 'Manager',
    nameEn: 'Manager',
    description: 'Zugriff auf Berichte und Genehmigungen',
    type: 'manager',
    permissions: [
      'dashboard:view',
      'invoices:view', 'invoices:approve',
      'receipts:view', 'receipts:approve',
      'bookings:view', 'bookings:approve',
      'bank:view',
      'reports:view', 'reports:export', 'reports:bwa', 'reports:balance', 'reports:pnl', 'reports:vat',
      'contacts:view',
      'settings:view',
      'users:view',
      'archive:view',
      'assets:view',
      'budget:view', 'budget:create', 'budget:edit',
      'data:export',
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role_accountant',
    name: 'Buchhalter',
    nameEn: 'Accountant',
    description: 'Buchhaltungstätigkeiten',
    type: 'accountant',
    permissions: [
      'dashboard:view',
      'invoices:view', 'invoices:create', 'invoices:edit', 'invoices:send',
      'receipts:view', 'receipts:create', 'receipts:edit',
      'bookings:view', 'bookings:create', 'bookings:edit', 'bookings:reverse',
      'bank:view', 'bank:sync', 'bank:reconcile',
      'reports:view', 'reports:export', 'reports:bwa', 'reports:balance', 'reports:pnl', 'reports:vat',
      'contacts:view', 'contacts:create', 'contacts:edit',
      'archive:view', 'archive:manage',
      'assets:view', 'assets:create', 'assets:edit',
      'budget:view',
      'data:export',
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role_auditor',
    name: 'Prüfer',
    nameEn: 'Auditor',
    description: 'Nur-Lese-Zugriff für Prüfungen',
    type: 'auditor',
    permissions: [
      'dashboard:view',
      'invoices:view',
      'receipts:view',
      'bookings:view',
      'bank:view',
      'reports:view', 'reports:export', 'reports:bwa', 'reports:balance', 'reports:pnl', 'reports:vat',
      'contacts:view',
      'archive:view',
      'assets:view',
      'budget:view',
      'data:export',
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role_viewer',
    name: 'Betrachter',
    nameEn: 'Viewer',
    description: 'Eingeschränkter Nur-Lese-Zugriff',
    type: 'viewer',
    permissions: [
      'dashboard:view',
      'invoices:view',
      'receipts:view',
      'bookings:view',
      'reports:view',
      'contacts:view',
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const STORAGE_KEY = 'fintutto_user_roles';

// Permission labels
export const PERMISSION_LABELS: Record<Permission, { de: string; en: string }> = {
  'dashboard:view': { de: 'Dashboard anzeigen', en: 'View dashboard' },
  'invoices:view': { de: 'Rechnungen anzeigen', en: 'View invoices' },
  'invoices:create': { de: 'Rechnungen erstellen', en: 'Create invoices' },
  'invoices:edit': { de: 'Rechnungen bearbeiten', en: 'Edit invoices' },
  'invoices:delete': { de: 'Rechnungen löschen', en: 'Delete invoices' },
  'invoices:send': { de: 'Rechnungen versenden', en: 'Send invoices' },
  'invoices:approve': { de: 'Rechnungen genehmigen', en: 'Approve invoices' },
  'receipts:view': { de: 'Belege anzeigen', en: 'View receipts' },
  'receipts:create': { de: 'Belege erstellen', en: 'Create receipts' },
  'receipts:edit': { de: 'Belege bearbeiten', en: 'Edit receipts' },
  'receipts:delete': { de: 'Belege löschen', en: 'Delete receipts' },
  'receipts:approve': { de: 'Belege genehmigen', en: 'Approve receipts' },
  'bookings:view': { de: 'Buchungen anzeigen', en: 'View bookings' },
  'bookings:create': { de: 'Buchungen erstellen', en: 'Create bookings' },
  'bookings:edit': { de: 'Buchungen bearbeiten', en: 'Edit bookings' },
  'bookings:delete': { de: 'Buchungen löschen', en: 'Delete bookings' },
  'bookings:reverse': { de: 'Buchungen stornieren', en: 'Reverse bookings' },
  'bookings:approve': { de: 'Buchungen genehmigen', en: 'Approve bookings' },
  'bank:view': { de: 'Bank anzeigen', en: 'View bank' },
  'bank:sync': { de: 'Bank synchronisieren', en: 'Sync bank' },
  'bank:reconcile': { de: 'Bank abstimmen', en: 'Reconcile bank' },
  'bank:manage': { de: 'Bank verwalten', en: 'Manage bank' },
  'reports:view': { de: 'Berichte anzeigen', en: 'View reports' },
  'reports:export': { de: 'Berichte exportieren', en: 'Export reports' },
  'reports:bwa': { de: 'BWA erstellen', en: 'Generate BWA' },
  'reports:balance': { de: 'Bilanz erstellen', en: 'Generate balance sheet' },
  'reports:pnl': { de: 'GuV erstellen', en: 'Generate P&L' },
  'reports:vat': { de: 'UStVA erstellen', en: 'Generate VAT report' },
  'contacts:view': { de: 'Kontakte anzeigen', en: 'View contacts' },
  'contacts:create': { de: 'Kontakte erstellen', en: 'Create contacts' },
  'contacts:edit': { de: 'Kontakte bearbeiten', en: 'Edit contacts' },
  'contacts:delete': { de: 'Kontakte löschen', en: 'Delete contacts' },
  'settings:view': { de: 'Einstellungen anzeigen', en: 'View settings' },
  'settings:edit': { de: 'Einstellungen bearbeiten', en: 'Edit settings' },
  'settings:company': { de: 'Firmendaten ändern', en: 'Edit company data' },
  'settings:integrations': { de: 'Integrationen verwalten', en: 'Manage integrations' },
  'users:view': { de: 'Benutzer anzeigen', en: 'View users' },
  'users:create': { de: 'Benutzer erstellen', en: 'Create users' },
  'users:edit': { de: 'Benutzer bearbeiten', en: 'Edit users' },
  'users:delete': { de: 'Benutzer löschen', en: 'Delete users' },
  'users:roles': { de: 'Rollen verwalten', en: 'Manage roles' },
  'archive:view': { de: 'Archiv anzeigen', en: 'View archive' },
  'archive:manage': { de: 'Archiv verwalten', en: 'Manage archive' },
  'archive:delete': { de: 'Archiv löschen', en: 'Delete archive' },
  'assets:view': { de: 'Anlagen anzeigen', en: 'View assets' },
  'assets:create': { de: 'Anlagen erstellen', en: 'Create assets' },
  'assets:edit': { de: 'Anlagen bearbeiten', en: 'Edit assets' },
  'assets:dispose': { de: 'Anlagen ausscheiden', en: 'Dispose assets' },
  'budget:view': { de: 'Budget anzeigen', en: 'View budget' },
  'budget:create': { de: 'Budget erstellen', en: 'Create budget' },
  'budget:edit': { de: 'Budget bearbeiten', en: 'Edit budget' },
  'data:backup': { de: 'Backup erstellen', en: 'Create backup' },
  'data:restore': { de: 'Backup wiederherstellen', en: 'Restore backup' },
  'data:export': { de: 'Daten exportieren', en: 'Export data' },
  'data:import': { de: 'Daten importieren', en: 'Import data' },
};

// Group permissions by module
export const PERMISSION_GROUPS: Record<Module, Permission[]> = {
  dashboard: ['dashboard:view'],
  invoices: ['invoices:view', 'invoices:create', 'invoices:edit', 'invoices:delete', 'invoices:send', 'invoices:approve'],
  receipts: ['receipts:view', 'receipts:create', 'receipts:edit', 'receipts:delete', 'receipts:approve'],
  bookings: ['bookings:view', 'bookings:create', 'bookings:edit', 'bookings:delete', 'bookings:reverse', 'bookings:approve'],
  bank: ['bank:view', 'bank:sync', 'bank:reconcile', 'bank:manage'],
  reports: ['reports:view', 'reports:export', 'reports:bwa', 'reports:balance', 'reports:pnl', 'reports:vat'],
  contacts: ['contacts:view', 'contacts:create', 'contacts:edit', 'contacts:delete'],
  settings: ['settings:view', 'settings:edit', 'settings:company', 'settings:integrations'],
  users: ['users:view', 'users:create', 'users:edit', 'users:delete', 'users:roles'],
  archive: ['archive:view', 'archive:manage', 'archive:delete'],
  assets: ['assets:view', 'assets:create', 'assets:edit', 'assets:dispose'],
  budget: ['budget:view', 'budget:create', 'budget:edit'],
  data: ['data:backup', 'data:restore', 'data:export', 'data:import'],
};

export function useUserRoles() {
  const [roles, setRoles] = useState<Role[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_roles`);
    if (saved) {
      try {
        const customRoles = JSON.parse(saved);
        // Merge with system roles
        return [...SYSTEM_ROLES, ...customRoles.filter((r: Role) => !r.isSystem)];
      } catch {
        // ignore
      }
    }
    return SYSTEM_ROLES;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    // Default admin user
    return [{
      id: 'user_admin',
      email: 'admin@fintutto.de',
      name: 'Administrator',
      roleId: 'role_admin',
      isActive: true,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      mfaEnabled: false,
    }];
  });

  const [activityLog, setActivityLog] = useState<UserActivity[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_activity`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [currentUserId, setCurrentUserId] = useState<string>('user_admin');

  // Persist data
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_roles`, JSON.stringify(roles.filter(r => !r.isSystem)));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_activity`, JSON.stringify(activityLog));
  }, [activityLog]);

  // Get current user
  const currentUser = useMemo(() => {
    return users.find(u => u.id === currentUserId) || null;
  }, [users, currentUserId]);

  // Get current user's role
  const currentRole = useMemo(() => {
    if (!currentUser) return null;
    return roles.find(r => r.id === currentUser.roleId) || null;
  }, [currentUser, roles]);

  // Check if current user has permission
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!currentRole) return false;
    return currentRole.permissions.includes(permission);
  }, [currentRole]);

  // Check if current user has any of the permissions
  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    if (!currentRole) return false;
    return permissions.some(p => currentRole.permissions.includes(p));
  }, [currentRole]);

  // Check if current user has all permissions
  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    if (!currentRole) return false;
    return permissions.every(p => currentRole.permissions.includes(p));
  }, [currentRole]);

  // Check module access
  const canAccessModule = useCallback((module: Module): boolean => {
    const viewPermission = `${module}:view` as Permission;
    return hasPermission(viewPermission) || hasPermission('dashboard:view');
  }, [hasPermission]);

  // Create custom role
  const createRole = useCallback((role: Omit<Role, 'id' | 'isSystem' | 'createdAt' | 'updatedAt'>): Role => {
    const newRole: Role = {
      ...role,
      id: `role_${Date.now()}`,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRoles(prev => [...prev, newRole]);
    return newRole;
  }, []);

  // Update role
  const updateRole = useCallback((roleId: string, updates: Partial<Omit<Role, 'id' | 'isSystem'>>) => {
    setRoles(prev => prev.map(r => {
      if (r.id === roleId && !r.isSystem) {
        return { ...r, ...updates, updatedAt: new Date().toISOString() };
      }
      return r;
    }));
  }, []);

  // Delete role
  const deleteRole = useCallback((roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      throw new Error('Systemrollen können nicht gelöscht werden');
    }
    // Check if any users have this role
    const usersWithRole = users.filter(u => u.roleId === roleId);
    if (usersWithRole.length > 0) {
      throw new Error('Rolle wird noch von Benutzern verwendet');
    }
    setRoles(prev => prev.filter(r => r.id !== roleId));
  }, [roles, users]);

  // Create user
  const createUser = useCallback((user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): User => {
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };
    setUsers(prev => [...prev, newUser]);
    logActivity(newUser.id, user.name, 'Benutzer erstellt', 'users');
    return newUser;
  }, []);

  // Update user
  const updateUser = useCallback((userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, ...updates };
      }
      return u;
    }));
  }, []);

  // Delete user
  const deleteUser = useCallback((userId: string) => {
    if (userId === currentUserId) {
      throw new Error('Eigener Benutzer kann nicht gelöscht werden');
    }
    const admins = users.filter(u => u.roleId === 'role_admin' && u.isActive);
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.roleId === 'role_admin' && admins.length <= 1) {
      throw new Error('Mindestens ein Administrator muss vorhanden sein');
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, [currentUserId, users]);

  // Assign role to user
  const assignRole = useCallback((userId: string, roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) {
      throw new Error('Rolle nicht gefunden');
    }
    updateUser(userId, { roleId });
    const user = users.find(u => u.id === userId);
    if (user) {
      logActivity(userId, user.name, `Rolle geändert zu ${role.name}`, 'users');
    }
  }, [roles, updateUser, users]);

  // Log activity
  const logActivity = useCallback((
    userId: string,
    userName: string,
    action: string,
    module: Module,
    details?: string
  ) => {
    const activity: UserActivity = {
      id: `activity_${Date.now()}`,
      userId,
      userName,
      action,
      module,
      details,
      timestamp: new Date().toISOString(),
    };
    setActivityLog(prev => [activity, ...prev].slice(0, 1000)); // Keep last 1000
  }, []);

  // Get user's role
  const getUserRole = useCallback((userId: string): Role | null => {
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    return roles.find(r => r.id === user.roleId) || null;
  }, [users, roles]);

  // Get permissions for module
  const getModulePermissions = useCallback((module: Module): Permission[] => {
    return PERMISSION_GROUPS[module] || [];
  }, []);

  // Statistics
  const stats = useMemo(() => ({
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalRoles: roles.length,
    customRoles: roles.filter(r => !r.isSystem).length,
    byRole: roles.reduce((acc, role) => {
      acc[role.name] = users.filter(u => u.roleId === role.id).length;
      return acc;
    }, {} as Record<string, number>),
    recentActivity: activityLog.slice(0, 10),
  }), [users, roles, activityLog]);

  return {
    roles,
    users,
    currentUser,
    currentRole,
    activityLog,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessModule,
    createRole,
    updateRole,
    deleteRole,
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    logActivity,
    getUserRole,
    getModulePermissions,
    setCurrentUserId,
    permissionLabels: PERMISSION_LABELS,
    permissionGroups: PERMISSION_GROUPS,
    stats,
  };
}
