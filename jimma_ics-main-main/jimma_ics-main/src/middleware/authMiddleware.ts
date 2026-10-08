import { User, UserRole } from '../types';

export type UserRoleCategory = 'Admin' | 'Teacher' | 'Staff';

export interface RoleDashboardConfig {
  category: UserRoleCategory;
  categoryLabel: string;
  role: string;
  dashboardPath: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  badgeVariant: 'gold' | 'emerald' | 'purple' | 'blue' | 'sky';
  badgeColorClass: string;
  allowedRoutePrefixes: string[];
  restrictedRoutesDescription: string;
}

export interface RouteAccessResult {
  isAuthorized: boolean;
  category: UserRoleCategory;
  currentRole: string;
  attemptedPath: string;
  authorizedDashboard: string;
  authorizedDashboardTitle: string;
  denialReason?: string;
  suggestedAction?: string;
}

const permissionAliases: Record<string, string[]> = {
  'mosque.create': ['mosques.write'],
  'mosque.edit': ['mosques.write'],
  'mosque.grant_approve': ['mosques.write'],
  'mosque.delete': ['mosques.write'],
  'madrasa.accredit': ['madrasas.write'],
  'student.manage': ['madrasas.write'],
  'hifz.record_progress': ['madrasas.write'],
  'teacher.manage': ['madrasas.write'],
  'attendance.submit': ['madrasas.write'],
  'ulema.license': ['fatwas.write'],
  'fatwa.publish': ['fatwas.write'],
  'finance.record_entry': ['finance.write'],
  'finance.approve_l1': ['finance.write'],
  'finance.approve_l2': ['finance.write'],
  'zakat.disburse': ['zakat.manage'],
  'services.process': ['janazah.manage', 'zakat.manage'],
  'events.schedule': ['events.write'],
  'documents.publish': ['documents.write'],
  'gateway.send_sabaq': ['broadcast.send'],
  'gateway.send_janazah': ['broadcast.send'],
  'gateway.mass_broadcast': ['broadcast.send'],
  'gateway.topup': ['broadcast.send'],
};

function hasPermission(user: User, keys: string[]) {
  const grantedPermissions = user.permissions || [];
  const permissions = new Set(grantedPermissions);
  for (const permission of grantedPermissions) {
    for (const alias of permissionAliases[permission] || []) permissions.add(alias);
  }
  return keys.some((key) => permissions.has(key));
}

const authorizedRouteCandidates = [
  '/admin',
  '/admin/teacher',
  '/admin/mosques',
  '/admin/madrasas',
  '/admin/students',
  '/admin/teachers',
  '/admin/resources',
  '/admin/ulema',
  '/admin/finance',
  '/admin/finance/approvals',
  '/admin/finance/donations',
  '/admin/zakat/applications',
  '/admin/audit',
  '/admin/gateway',
  '/admin/services',
  '/admin/events',
  '/admin/announcements',
  '/admin/waqf',
  '/admin/documents',
  '/admin/users',
  '/admin/woredas',
  '/admin/settings',
];

export function getFirstAuthorizedRoute(user: User | null | undefined) {
  return authorizedRouteCandidates.find((path) => checkRoutePermission(user, path).isAuthorized) || null;
}

/**
 * Classifies any user role into one of the 3 primary authorization tiers:
 * - Admin: Supreme Executive & System Administrators
 * - Teacher: Quranic Instructors, Tahfeez Teachers & Mu'allims
 * - Staff: Departmental operational officers (Finance, Education, Mosque, Zakat, Ulema, Audit)
 */
export function getUserRoleCategory(roleOrUser: string | User | null | undefined): UserRoleCategory {
  if (!roleOrUser) return 'Staff';

  if (typeof roleOrUser !== 'string' && roleOrUser.authRole === 'pending_staff') return 'Staff';
  
  const roleStr = typeof roleOrUser === 'string' 
    ? roleOrUser 
    : (roleOrUser.role || '');

  const normalized = roleStr.toLowerCase().replace(/&/g, 'and').trim();

  // 1. Teacher tier check
  if (
    normalized.includes('teacher') ||
    normalized.includes('mu’allim') ||
    normalized.includes('muallim') ||
    normalized.includes('instructor') ||
    normalized.includes('tahfeez') ||
    normalized.includes('quran tutor')
  ) {
    return 'Teacher';
  }

  // 2. Admin tier check (Executive & System Administrators)
  if (
    normalized.includes('super admin') ||
    normalized.includes('council director') ||
    normalized.includes('system admin') ||
    normalized.includes('executive director') ||
    normalized.includes('administrator') ||
    normalized.includes('it & media officer') ||
    normalized.includes('it and media officer') ||
    normalized.includes('lead systems')
  ) {
    return 'Admin';
  }

  // 3. Staff tier check (All other departmental council officers)
  return 'Staff';
}

/**
 * Returns the specific authorized dashboard path and configuration
 * for a user based on their role and department.
 */
export function getAuthorizedDashboard(user: User | null | undefined): RoleDashboardConfig {
  if (!user) {
    return {
      category: 'Staff',
      categoryLabel: 'Council Staff Tier',
      role: 'Staff',
      dashboardPath: '/admin',
      dashboardTitle: 'Council Operations Portal',
      dashboardSubtitle: 'Staff operational services and citizen intake',
      badgeVariant: 'blue',
      badgeColorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
      allowedRoutePrefixes: ['/admin'],
      restrictedRoutesDescription: 'General council services and administrative intake.',
    };
  }

  if (user.authRole) {
    const byBackendRole: Record<string, Partial<RoleDashboardConfig>> = {
      super_admin: { dashboardPath: '/admin', dashboardTitle: 'Executive Council Dashboard', category: 'Admin', categoryLabel: 'Executive & Admin Tier', badgeVariant: 'gold' },
      secretariat_admin: { dashboardPath: '/admin/events', dashboardTitle: 'Secretariat Workspace', category: 'Staff', categoryLabel: 'Secretariat Staff', badgeVariant: 'blue' },
      case_officer: { dashboardPath: '/admin/services', dashboardTitle: 'Community Casework Desk', category: 'Staff', categoryLabel: 'Case Officer', badgeVariant: 'emerald' },
      finance_officer: { dashboardPath: '/admin/finance', dashboardTitle: 'Finance Directorate', category: 'Staff', categoryLabel: 'Finance Staff', badgeVariant: 'blue' },
      content_editor: { dashboardPath: '/admin/mosques', dashboardTitle: 'Content & Institutions Workspace', category: 'Staff', categoryLabel: 'Content Staff', badgeVariant: 'emerald' },
      dispatcher: { dashboardPath: '/admin/gateway', dashboardTitle: 'Communications Workspace', category: 'Staff', categoryLabel: 'Dispatcher', badgeVariant: 'sky' },
      pending_staff: { dashboardPath: '/admin', dashboardTitle: 'Role assignment pending', category: 'Staff', categoryLabel: 'Pending staff', badgeVariant: 'blue' },
    };
    const roleConfig = byBackendRole[user.authRole] || byBackendRole.pending_staff;
    return {
      category: roleConfig.category || 'Staff',
      categoryLabel: roleConfig.categoryLabel || 'Council Staff Tier',
      role: user.role,
      dashboardPath: roleConfig.dashboardPath || '/admin',
      dashboardTitle: roleConfig.dashboardTitle || 'Council Staff Workspace',
      dashboardSubtitle: 'Workspace access is controlled by your assigned council permissions.',
      badgeVariant: roleConfig.badgeVariant || 'blue',
      badgeColorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
      allowedRoutePrefixes: user.authRole === 'pending_staff' ? [] : [roleConfig.dashboardPath || '/admin'],
      restrictedRoutesDescription: 'Only modules granted to your account are available.',
    };
  }

  const category = getUserRoleCategory(user);
  const normalizedRole = (user.role || '').toLowerCase().replace(/&/g, 'and');
  const normalizedDept = (user.department || '').toLowerCase().replace(/&/g, 'and');

  // -------------------------------------------------------------
  // 1. TEACHER TIER
  // -------------------------------------------------------------
  if (category === 'Teacher') {
    return {
      category: 'Teacher',
      categoryLabel: 'Teacher & Mu’allim Tier',
      role: user.role,
      dashboardPath: '/admin/teacher',
      dashboardTitle: 'Tahfeez & Sabaq Classroom Workbench',
      dashboardSubtitle: 'Daily student attendance, Quran memorization tracking, sabaq grading, and parent SMS alerts',
      badgeVariant: 'emerald',
      badgeColorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
      allowedRoutePrefixes: [
        '/admin',
        '/admin/teacher',
        '/admin/students',
        '/admin/madrasas',
        '/admin/resources',
        '/admin/events',
        '/admin/services',
        '/admin/documents',
      ],
      restrictedRoutesDescription: 'Teachers do not have access to Council Treasury, Expense Approvals, Independent Audit, or Staff RBAC Management.',
    };
  }

  // -------------------------------------------------------------
  // 2. ADMIN TIER
  // -------------------------------------------------------------
  if (category === 'Admin') {
    return {
      category: 'Admin',
      categoryLabel: 'Executive & Admin Tier',
      role: user.role,
      dashboardPath: '/admin',
      dashboardTitle: 'Executive Directorate & Master Control Center',
      dashboardSubtitle: 'Central cross-directorate KPIs, financial treasury oversight, staff RBAC management, and security audit telemetry',
      badgeVariant: 'gold',
      badgeColorClass: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300',
      allowedRoutePrefixes: [
        '/admin', // Unrestricted access to all subroutes
      ],
      restrictedRoutesDescription: 'Full administrative access across all directorates, financial vouchers, and security credentials.',
    };
  }

  // -------------------------------------------------------------
  // 3. STAFF TIER (Departmental Specific Routing)
  // -------------------------------------------------------------

  // Finance & Treasury Staff
  if (
    normalizedRole.includes('finance') ||
    normalizedRole.includes('treasury') ||
    normalizedRole.includes('accountant') ||
    normalizedDept.includes('finance')
  ) {
    return {
      category: 'Staff',
      categoryLabel: 'Finance Directorate Staff',
      role: user.role,
      dashboardPath: '/admin/finance',
      dashboardTitle: 'Treasury Accounts & Expense Approvals Desk',
      dashboardSubtitle: 'Telebirr donation streams, multi-tier expense vouchers, cash flow ledgers, and tax compliance',
      badgeVariant: 'blue',
      badgeColorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
      allowedRoutePrefixes: [
        '/admin',
        '/admin/finance',
        '/admin/donations',
        '/admin/zakat',
        '/admin/services',
        '/admin/documents',
        '/admin/events',
        '/admin/waqf',
      ],
      restrictedRoutesDescription: 'Finance staff can manage financial ledgers, donation receipts, and approvals, but cannot modify Staff RBAC permissions.',
    };
  }

  // Education Directorate Staff
  if (
    normalizedRole.includes('education') ||
    normalizedRole.includes('curriculum') ||
    normalizedDept.includes('education')
  ) {
    return {
      category: 'Staff',
      categoryLabel: 'Education Directorate Staff',
      role: user.role,
      dashboardPath: '/admin/madrasas',
      dashboardTitle: 'Madrasa Accreditation & Faculty Directory',
      dashboardSubtitle: 'Tahfeez center licenses, teacher certifications, zone-wide curricula, and student progress registries',
      badgeVariant: 'purple',
      badgeColorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
      allowedRoutePrefixes: [
        '/admin',
        '/admin/madrasas',
        '/admin/students',
        '/admin/teachers',
        '/admin/teacher',
        '/admin/resources',
        '/admin/services',
        '/admin/events',
        '/admin/documents',
      ],
      restrictedRoutesDescription: 'Education officers supervise madrasas, student hifz records, and teacher licensing, but cannot disburse treasury capital.',
    };
  }

  // Mosque & Waqf Staff
  if (
    normalizedRole.includes('mosque') ||
    normalizedRole.includes('waqf') ||
    normalizedRole.includes('imam') ||
    normalizedDept.includes('mosque')
  ) {
    return {
      category: 'Staff',
      categoryLabel: 'Mosque & Waqf Directorate Staff',
      role: user.role,
      dashboardPath: '/admin/mosques',
      dashboardTitle: 'Masajid & Waqf Affairs Directorate',
      dashboardSubtitle: 'Mosque facility registry, Friday Khutbah themes, waqf land cadastre, and community programs',
      badgeVariant: 'emerald',
      badgeColorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
      allowedRoutePrefixes: [
        '/admin',
        '/admin/mosques',
        '/admin/waqf',
        '/admin/services',
        '/admin/events',
        '/admin/documents',
      ],
      restrictedRoutesDescription: 'Mosque officers manage prayer facilities, waqf deeds, and Friday sermons.',
    };
  }

  // Zakat & Social Welfare Inspector
  if (
    normalizedRole.includes('zakat') ||
    normalizedRole.includes('welfare') ||
    normalizedRole.includes('inspector') ||
    normalizedDept.includes('social')
  ) {
    return {
      category: 'Staff',
      categoryLabel: 'Social Welfare & Zakat Staff',
      role: user.role,
      dashboardPath: '/admin/zakat',
      dashboardTitle: 'Zakat Assessment & Relief Distribution Desk',
      dashboardSubtitle: 'Needy beneficiary family dossiers, poverty evaluations, and emergency hardship disbursements',
      badgeVariant: 'purple',
      badgeColorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
      allowedRoutePrefixes: [
        '/admin',
        '/admin/zakat',
        '/admin/donations',
        '/admin/services',
        '/admin/documents',
        '/admin/events',
      ],
      restrictedRoutesDescription: 'Zakat inspectors evaluate hardship requests and disburse relief packets.',
    };
  }

  // Ulema & Fatwa Coordinator
  if (
    normalizedRole.includes('ulema') ||
    normalizedRole.includes('fatwa') ||
    normalizedRole.includes('shariah') ||
    normalizedDept.includes('shariah')
  ) {
    return {
      category: 'Staff',
      categoryLabel: 'Shari’ah & Fatwa Council Staff',
      role: user.role,
      dashboardPath: '/admin/ulema',
      dashboardTitle: 'Shari’ah Council & Fatwa Inquiries Board',
      dashboardSubtitle: 'Jurisprudential rulings, licensed scholars roster, dispute resolution, and community guidance',
      badgeVariant: 'gold',
      badgeColorClass: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300',
      allowedRoutePrefixes: [
        '/admin',
        '/admin/ulema',
        '/admin/services',
        '/admin/documents',
        '/admin/events',
      ],
      restrictedRoutesDescription: 'Ulema staff manage scholar credentials, legal fatwas, and family mediation.',
    };
  }

  // Independent Auditor & Compliance
  if (
    normalizedRole.includes('auditor') ||
    normalizedRole.includes('compliance') ||
    normalizedRole.includes('audit')
  ) {
    return {
      category: 'Staff',
      categoryLabel: 'Independent Audit & Compliance Staff',
      role: user.role,
      dashboardPath: '/admin/audit',
      dashboardTitle: 'Independent Audit & Forensic Ledger Desk',
      dashboardSubtitle: 'Immutable cryptographic block verification, compliance directives, and variance reconciliations',
      badgeVariant: 'sky',
      badgeColorClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300',
      allowedRoutePrefixes: [
        '/admin',
        '/admin/audit',
        '/admin/compliance',
        '/admin/finance',
        '/admin/documents',
        '/admin/mosques',
        '/admin/madrasas',
      ],
      restrictedRoutesDescription: 'Auditors inspect council ledgers and directives, but cannot post manual payments or change user roles.',
    };
  }

  // Default Operational Staff Fallback
  return {
    category: 'Staff',
    categoryLabel: 'Council Staff Tier',
    role: user.role,
    dashboardPath: '/admin',
    dashboardTitle: 'Council Operations Portal',
    dashboardSubtitle: 'Operational public services, tracking, and council documents intake',
    badgeVariant: 'blue',
    badgeColorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
    allowedRoutePrefixes: [
      '/admin',
      '/admin/services',
      '/admin/events',
      '/admin/documents',
    ],
    restrictedRoutesDescription: 'Operational staff manage citizen requests, events, and document archives.',
  };
}

/**
 * Checks whether the current user is authorized to access a given URL pathname.
 * Implements strict role-based access control (Admin vs. Teacher vs. Staff).
 */
export function checkRoutePermission(user: User | null | undefined, pathname: string): RouteAccessResult {
  if (!user) {
    return {
      isAuthorized: false,
      category: 'Staff',
      currentRole: 'Unauthenticated',
      attemptedPath: pathname,
      authorizedDashboard: '/login',
      authorizedDashboardTitle: 'Staff Authentication Portal',
      denialReason: 'You must be signed in with an authorized council account to access this area.',
      suggestedAction: 'Please sign in with your staff credentials.',
    };
  }

  const category = getUserRoleCategory(user);
  const config = getAuthorizedDashboard(user);
  const cleanPath = pathname.split('?')[0].split('#')[0].replace(/\/$/, '') || '/admin';

  if (user.authRole) {
    if (!cleanPath.startsWith('/admin')) {
      return {
        isAuthorized: true,
        category,
        currentRole: user.role,
        attemptedPath: cleanPath,
        authorizedDashboard: config.dashboardPath,
        authorizedDashboardTitle: config.dashboardTitle,
      };
    }
    if (user.authRole === 'super_admin') {
      return {
        isAuthorized: true,
        category: 'Admin',
        currentRole: user.role,
        attemptedPath: cleanPath,
        authorizedDashboard: config.dashboardPath,
        authorizedDashboardTitle: config.dashboardTitle,
      };
    }

    const permissionRules: Array<{ prefix: string; keys?: string[]; roleName?: string }> = [
      { prefix: '/admin/woredas', keys: ['woredas.write'] },
      { prefix: '/admin/audit', keys: ['users.manage'] },
      { prefix: '/admin/compliance', keys: ['users.manage'] },
      { prefix: '/admin/users', keys: ['users.manage'] },
      { prefix: '/admin/staff', keys: ['users.manage'] },
      { prefix: '/admin/roles', keys: ['roles.manage'] },
      { prefix: '/admin/finance', keys: ['finance.write'] },
      { prefix: '/admin/mosques', keys: ['mosques.write'] },
      { prefix: '/admin/madrasas', keys: ['madrasas.write'] },
      { prefix: '/admin/students', keys: ['madrasas.write'] },
      { prefix: '/admin/teachers', keys: ['madrasas.write'] },
      { prefix: '/admin/teacher', keys: ['madrasas.write'] },
      { prefix: '/admin/resources', keys: ['documents.write', 'madrasas.write'] },
      { prefix: '/admin/ulema', keys: ['fatwas.write'] },
      { prefix: '/admin/zakat', keys: ['zakat.manage', 'zakat.rates.write'] },
      { prefix: '/admin/donations', keys: ['zakat.manage', 'finance.write'] },
      { prefix: '/admin/services', keys: ['janazah.manage', 'zakat.manage'] },
      { prefix: '/admin/events', keys: ['events.write'] },
      { prefix: '/admin/waqf', keys: ['waqf.write'] },
      { prefix: '/admin/announcements', keys: ['announcements.write'] },
      { prefix: '/admin/documents', keys: ['documents.write'] },
      { prefix: '/admin/gateway', keys: ['broadcast.send'] },
      { prefix: '/admin/settings', roleName: 'super_admin' },
      { prefix: '/admin', keys: ['dashboard.view'] },
    ];
    const rule = permissionRules.find(({ prefix }) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`));
    const isAuthorized = Boolean(rule && (
      rule.roleName ? user.authRole === rule.roleName : rule.keys && hasPermission(user, rule.keys)
    ));
    return {
      isAuthorized,
      category,
      currentRole: user.role,
      attemptedPath: cleanPath,
      authorizedDashboard: config.dashboardPath,
      authorizedDashboardTitle: config.dashboardTitle,
      ...(isAuthorized ? {} : {
        denialReason: user.authRole === 'pending_staff'
          ? 'Your account is ready, but a council administrator must assign your staff role before you can open the workspace.'
          : 'Your assigned council role does not grant access to this module.',
        suggestedAction: user.authRole === 'pending_staff'
          ? 'Contact a council administrator to request role assignment.'
          : `Return to your authorized ${config.dashboardTitle}.`,
      }),
    };
  }

  // 1. ADMIN TIER: Full access to all /admin subroutes
  if (category === 'Admin') {
    return {
      isAuthorized: true,
      category: 'Admin',
      currentRole: user.role,
      attemptedPath: cleanPath,
      authorizedDashboard: config.dashboardPath,
      authorizedDashboardTitle: config.dashboardTitle,
    };
  }

  // 2. STRICT RESTRICTION: /admin/users and /admin/staff (Staff RBAC & User Management)
  // This is strictly restricted to Admin tier.
  if (cleanPath === '/admin/users' || cleanPath === '/admin/staff') {
    return {
      isAuthorized: false,
      category,
      currentRole: user.role,
      attemptedPath: cleanPath,
      authorizedDashboard: config.dashboardPath,
      authorizedDashboardTitle: config.dashboardTitle,
      denialReason: 'Access Denied: Staff & Role Access Administration (RBAC) is strictly reserved for Executive Administrators.',
      suggestedAction: `Return to your authorized ${category} dashboard (${config.dashboardTitle}).`,
    };
  }

  // 3. TEACHER TIER RESTRICTIONS:
  if (category === 'Teacher') {
    // Prohibit teachers from accessing Treasury, Audits, Broadcast Gateway, and Ulema governance
    const restrictedToTeachers = [
      '/admin/finance',
      '/admin/donations',
      '/admin/zakat',
      '/admin/audit',
      '/admin/compliance',
      '/admin/gateway',
      '/admin/ulema',
      '/admin/mosques',
    ];

    const isBlocked = restrictedToTeachers.some(
      (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)
    );

    if (isBlocked) {
      return {
        isAuthorized: false,
        category: 'Teacher',
        currentRole: user.role,
        attemptedPath: cleanPath,
        authorizedDashboard: config.dashboardPath,
        authorizedDashboardTitle: config.dashboardTitle,
        denialReason: `Access Denied: As a Quranic Teacher/Mu’allim, you are authorized for Tahfeez & Sabaq Classroom tools, but not for Council Treasury, Audit Ledgers, or Administrative Gateways.`,
        suggestedAction: 'Return to your authorized Tahfeez & Sabaq Classroom Workbench.',
      };
    }

    return {
      isAuthorized: true,
      category: 'Teacher',
      currentRole: user.role,
      attemptedPath: cleanPath,
      authorizedDashboard: config.dashboardPath,
      authorizedDashboardTitle: config.dashboardTitle,
    };
  }

  // 4. STAFF TIER RESTRICTIONS:
  // Staff cannot access Independent Audit unless their role is Auditor
  const isAuditor = (user.role || '').toLowerCase().includes('audit');
  if (
    (cleanPath === '/admin/audit' ||
      cleanPath === '/admin/compliance' ||
      cleanPath.startsWith('/admin/audit/') ||
      cleanPath.startsWith('/admin/compliance/')) &&
    !isAuditor
  ) {
    return {
      isAuthorized: false,
      category: 'Staff',
      currentRole: user.role,
      attemptedPath: cleanPath,
      authorizedDashboard: config.dashboardPath,
      authorizedDashboardTitle: config.dashboardTitle,
      denialReason: 'Access Denied: The Independent Forensic Audit Ledger is restricted exclusively to appointed Compliance Auditors and Council Directors.',
      suggestedAction: `Return to your authorized ${config.dashboardTitle}.`,
    };
  }

  // All other staff routes permitted
  return {
    isAuthorized: true,
    category: 'Staff',
    currentRole: user.role,
    attemptedPath: cleanPath,
    authorizedDashboard: config.dashboardPath,
    authorizedDashboardTitle: config.dashboardTitle,
  };
}
