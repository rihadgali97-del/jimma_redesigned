import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, RoleDefinition, StaffDepartment, StaffStatus } from '../../types';
import {
  Users,
  Shield,
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  Download,
  Building,
  Key,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MoreVertical,
  Edit,
  Trash2,
  IdCard,
  LogIn,
  Layers,
  FileSpreadsheet,
  History,
  Phone,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  Sparkles,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StaffFormModal } from '../../components/admin/staff/StaffFormModal';
import { RoleFormModal } from '../../components/admin/staff/RoleFormModal';
import { StaffDetailDrawer } from '../../components/admin/staff/StaffDetailDrawer';
import { StaffBadgeModal } from '../../components/admin/staff/StaffBadgeModal';
import { AccountAccessPanel } from '../../components/admin/staff/AccountAccessPanel';
import { StaffAvatar } from '../../components/admin/staff/StaffAvatar';

function hasRolePermission(role: RoleDefinition, permissionId: string): boolean {
  const normalizedRoleName = role.name.toLowerCase().replace(/[^a-z]/g, '');
  return normalizedRoleName === 'superadmin' || (role.permissions || []).includes(permissionId);
}

export const AdminStaffAndRolesPage: React.FC = () => {
  const {
    staffList,
    rolesList,
    permissionCategories,
    securityLogs,
    currentUser,
    staffAccessLoading,
    staffAccessError,
    refreshStaffAndRoles,
    deleteStaff,
    toggleStaffStatus,
    deleteRole,
    addToast,
  } = useApp();

  useEffect(() => {
    void refreshStaffAndRoles().catch(() => undefined);
  }, []);

  // Active Top-level Tab
  const [activeTab, setActiveTab] = useState<'staff' | 'roles' | 'matrix' | 'audit'>('staff');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals & Drawers state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | undefined>(undefined);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | undefined>(undefined);

  const [selectedStaffForDetail, setSelectedStaffForDetail] = useState<User | null>(null);
  const [selectedStaffForBadge, setSelectedStaffForBadge] = useState<User | null>(null);

  // Audit Tab Filter
  const [auditCategory, setAuditCategory] = useState<string>('All');
  const [auditSearch, setAuditSearch] = useState<string>('');
  const [expandedAuditLogId, setExpandedAuditLogId] = useState<string | null>(null);

  // Derived Stats
  const totalStaffCount = staffList.length;
  const activeStaffCount = staffList.filter((s) => s.status === 'Active').length;
  const twoFactorEnforcedCount = staffList.filter((s) => s.twoFactorEnabled).length;
  const twoFactorPercentage = Math.round((twoFactorEnforcedCount / (totalStaffCount || 1)) * 100);

  // Departments List
  const departments: StaffDepartment[] = [
    'Executive Secretariat',
    'Shariah & Fatwa Board',
    'Education Directorate',
    'Finance & Endowment',
    'Mosque & Waqf Affairs',
    'Social Services & Zakat',
    'IT & Media Communications',
  ];

  // Filtered Staff
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        staff.name.toLowerCase().includes(q) ||
        (staff.arabicName && staff.arabicName.toLowerCase().includes(q)) ||
        staff.email.toLowerCase().includes(q) ||
        (staff.phone && staff.phone.includes(q)) ||
        (staff.title && staff.title.toLowerCase().includes(q)) ||
        (staff.district && staff.district.toLowerCase().includes(q));

      const matchesDept =
        selectedDepartment === 'All' || staff.department === selectedDepartment;
      const matchesRole = selectedRole === 'All' || staff.role === selectedRole;
      const matchesStatus =
        selectedStatus === 'All' || staff.status === selectedStatus;

      return matchesSearch && matchesDept && matchesRole && matchesStatus;
    });
  }, [staffList, searchQuery, selectedDepartment, selectedRole, selectedStatus]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return securityLogs.filter((log) => {
      const matchesCategory =
        auditCategory === 'All' || log.category === auditCategory;
      const q = auditSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.actorName.toLowerCase().includes(q) ||
        log.actorEmail.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [securityLogs, auditCategory, auditSearch]);

  // Handlers
  const handleOpenAddStaff = () => {
    setEditingStaff(undefined);
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (staff: User) => {
    setEditingStaff(staff);
    setIsStaffModalOpen(true);
  };

  const handleOpenAddRole = () => {
    setEditingRole(undefined);
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRole = (role: RoleDefinition) => {
    setEditingRole(role);
    setIsRoleModalOpen(true);
  };

  const handleExportStaffCSV = () => {
    const headers = ['ID', 'Name', 'Arabic Name', 'Role', 'Department', 'Email', 'Phone', 'Kebele', 'Status', 'Access Level'];
    const rows = filteredStaff.map((s) => [
      s.id,
      `"${s.name}"`,
      `"${s.arabicName || ''}"`,
      s.role,
      `"${s.department || ''}"`,
      s.email,
      s.phone || '',
      s.district || '',
      s.status || 'Active',
      `"${s.accessLevel || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jimma_council_staff_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Roster Exported', 'Staff registry successfully exported to CSV.', 'success');
  };

  const handleExportAuditCSV = () => {
    const headers = ['Timestamp', 'Actor Name', 'Actor Email', 'Actor Role', 'Category', 'Action', 'Target', 'Status', 'IP Address', 'Details'];
    const rows = filteredAuditLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.actorName}"`,
      l.actorEmail,
      l.actorRole,
      l.category,
      `"${l.action}"`,
      `"${l.target}"`,
      l.status,
      l.ipAddress || '',
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jimma_council_security_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Audit Trail Exported', 'Compliance audit records exported to CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      {staffAccessLoading && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
          Loading staff, roles, and audit records from the backend…
        </div>
      )}
      {staffAccessError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          Backend data could not be loaded: {staffAccessError}
          <button type="button" className="ml-3 font-bold underline" onClick={() => void refreshStaffAndRoles().catch(() => undefined)}>Retry</button>
        </div>
      )}
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 p-6 rounded-3xl border border-stone-800 text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
              Council Human Capital & RBAC Engine
            </span>
            <span className="text-xs text-stone-400 font-serif" dir="rtl">
              إدارة الكوادر والأدوار والصلاحيات
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Staff & Role-Based Access Control
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-2xl">
            Administer council officers, configure role-based access control policies, audit security logs, and issue cryptographic credentials.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenAddRole}
            icon={<Layers className="w-4 h-4 text-amber-400" />}
            className="text-xs bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700"
          >
            New Role Definition
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={handleOpenAddStaff}
            icon={<UserPlus className="w-4 h-4" />}
            className="text-xs"
          >
            Enroll Council Personnel
          </Button>
        </div>
      </div>

      {currentUser.permissions.includes('users.manage') && <AccountAccessPanel />}

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Total Enrolled Personnel</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
              {totalStaffCount}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              {activeStaffCount} Active
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Across 7 council directorates</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Role Profiles</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
              {rolesList.length}
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {rolesList.filter((r) => r.isSystemRole).length} System Core
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            {rolesList.filter((r) => !r.isSystemRole).length} custom configured roles
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">2FA OTP Enforcement</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
              {twoFactorPercentage}%
            </span>
            <span className="text-xs text-emerald-600 font-semibold">
              {twoFactorEnforcedCount} Staff
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Mandatory on finance & admin</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Audit Trail Entries</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
              {securityLogs.length}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Real-time</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">100% cryptographic trace</p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 overflow-x-auto pb-px">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'staff'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Directory ({staffList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'roles'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Role Profiles ({rolesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Permission Matrix (Cross-Table)</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Security & Audit Log</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STAFF DIRECTORY                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by name, Arabic name, email, phone, title, or kebele..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
              >
                <option value="All">All Directorates</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
              >
                <option value="All">All Roles</option>
                {rolesList.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending Invitation">Pending</option>
                <option value="On Leave">On Leave</option>
                <option value="Suspended">Suspended</option>
              </select>

              {/* View Switcher */}
              <div className="flex items-center rounded-xl bg-stone-100 dark:bg-stone-800 p-0.5 border border-stone-200 dark:border-stone-700">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="Grid Cards View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {/* CSV Export */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportStaffCSV}
                icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
                className="text-xs py-2"
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>
              Showing <strong>{filteredStaff.length}</strong> of {totalStaffCount} personnel records
            </span>
            {(searchQuery || selectedDepartment !== 'All' || selectedRole !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDepartment('All');
                  setSelectedRole('All');
                  setSelectedStatus('All');
                }}
                className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Table View */}
          {viewMode === 'table' ? (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-500 border-b border-stone-200 dark:border-stone-800 uppercase tracking-wider font-mono">
                    <tr>
                      <th className="py-3 px-4">Officer & Identity</th>
                      <th className="py-3 px-4">Role & Access Tier</th>
                      <th className="py-3 px-4">Directorate</th>
                      <th className="py-3 px-4">Kebele</th>
                      <th className="py-3 px-4">Security / 2FA</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                    {filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-stone-400 italic">
                          No council personnel found matching the specified filters.
                        </td>
                      </tr>
                    ) : (
                      filteredStaff.map((staff) => (
                        <tr
                          key={staff.id}
                          className="hover:bg-amber-50/40 dark:hover:bg-stone-800/50 transition-colors group"
                        >
                          {/* Officer */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <StaffAvatar
                                src={staff.avatar}
                                name={staff.name}
                                className="w-9 h-9 rounded-xl border border-stone-200 dark:border-stone-700 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setSelectedStaffForDetail(staff)}
                                    className="font-serif font-bold text-stone-900 dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-400 text-left truncate"
                                  >
                                    {staff.name}
                                  </button>
                                  {currentUser.id === staff.id && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-stone-500">
                                  {staff.arabicName && (
                                    <span className="font-serif text-amber-600 dark:text-amber-400" dir="rtl">
                                      {staff.arabicName}
                                    </span>
                                  )}
                                  <span className="truncate">{staff.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <Badge variant="gold" className="text-[10px]">
                                {staff.role}
                              </Badge>
                              <span className="text-[10px] text-stone-400 block font-mono">
                                {staff.accessLevel ? staff.accessLevel.split(' ')[0] : 'Level 3'}
                              </span>
                            </div>
                          </td>

                          {/* Department */}
                          <td className="py-3.5 px-4 font-medium text-stone-700 dark:text-stone-300">
                            {staff.department || 'Executive Secretariat'}
                          </td>

                          {/* Kebele */}
                          <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">
                            {staff.district || 'Jimma Central'}
                          </td>

                          {/* Security */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-[11px]">
                              {staff.twoFactorEnabled ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
                                  <Lock className="w-3 h-3" /> 2FA On
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-stone-400 font-mono">
                                  2FA Off
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                staff.status === 'Active'
                                  ? 'emerald'
                                  : staff.status === 'Suspended'
                                  ? 'rose'
                                  : 'amber'
                              }
                            >
                              {staff.status || 'Active'}
                            </Badge>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setSelectedStaffForBadge(staff)}
                                title="Issue Staff Credential ID"
                                className="p-1.5 rounded-lg text-stone-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-stone-800 transition-colors"
                              >
                                <IdCard className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setSelectedStaffForDetail(staff)}
                                title="View Dossier"
                                className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-stone-800 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleOpenEditStaff(staff)}
                                title="Edit Profile"
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to remove ${staff.name} from council personnel?`)) {
                                    deleteStaff(staff.id);
                                  }
                                }}
                                title="Decommission Staff"
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-stone-800 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Grid Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-amber-400/60 transition-all space-y-4 relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <StaffAvatar
                        src={staff.avatar}
                        name={staff.name}
                        className="w-12 h-12 rounded-2xl border border-amber-400/40 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                          {staff.name}
                        </h4>
                        {staff.arabicName && (
                          <p className="text-xs font-serif text-amber-600 dark:text-amber-400" dir="rtl">
                            {staff.arabicName}
                          </p>
                        )}
                        <p className="text-[11px] text-stone-500 truncate">{staff.title || staff.role}</p>
                      </div>
                    </div>

                    <Badge
                      variant={
                        staff.status === 'Active'
                          ? 'emerald'
                          : staff.status === 'Suspended'
                          ? 'rose'
                          : 'amber'
                      }
                    >
                      {staff.status || 'Active'}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                      <span className="text-stone-400">Department:</span>
                      <span className="font-semibold">{staff.department || 'Executive Secretariat'}</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                      <span className="text-stone-400">Jurisdiction:</span>
                      <span>{staff.district || 'Jimma Central'}</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                      <span className="text-stone-400">Permissions:</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {(staff.permissions || []).length} active
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStaffForBadge(staff)}
                        icon={<IdCard className="w-3.5 h-3.5 text-blue-500" />}
                        className="text-[11px] px-2 py-1"
                      >
                        Badge
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStaffForDetail(staff)}
                        className="text-[11px] px-2 py-1"
                      >
                        Dossier
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditStaff(staff)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${staff.name}?`)) deleteStaff(staff.id);
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-stone-800"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ROLE PROFILES & DEFINITIONS                                       */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                Council Role Matrix & Authority Profiles
              </h3>
              <p className="text-xs text-stone-500">
                Predefined operational roles and custom privilege profiles assigned to council personnel.
              </p>
            </div>

            <Button
              variant="gold"
              size="sm"
              onClick={handleOpenAddRole}
              icon={<Shield className="w-4 h-4" />}
              className="text-xs"
            >
              Add Custom Role
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rolesList.map((role) => {
              const assignedStaff = staffList.filter((s) => s.role === role.name);

              return (
                <div
                  key={role.id}
                  className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden flex flex-col justify-between hover:border-amber-400/70 transition-all"
                >
                  {/* Top Color Accent */}
                  <div
                    className="h-2 w-full"
                    style={{ backgroundColor: role.color || '#059669' }}
                  />

                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                            {role.name}
                          </h4>
                          {role.isSystemRole && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold border border-stone-200 dark:border-stone-700">
                              System
                            </span>
                          )}
                        </div>
                        {role.arabicName && (
                          <p className="text-xs font-serif text-amber-600 dark:text-amber-400 font-semibold" dir="rtl">
                            {role.arabicName}
                          </p>
                        )}
                      </div>

                      <Badge
                        variant={
                          role.privilegeLevel === 'Critical'
                            ? 'rose'
                            : role.privilegeLevel === 'High'
                            ? 'amber'
                            : 'emerald'
                        }
                      >
                        {role.privilegeLevel} Risk
                      </Badge>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2">
                      {role.description}
                    </p>

                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Directorate Scope:</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {role.department}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Assigned Personnel:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {assignedStaff.length} Officers
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Granted Capabilities:</span>
                        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {(role.permissions || []).length} Permissions
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 py-3.5 bg-stone-50 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditRole(role)}
                      disabled={role.name === 'super_admin'}
                      title={role.name === 'super_admin'
                        ? 'Super Admin always has full access by system policy.'
                        : role.isSystemRole
                          ? 'System role details stay protected; permissions can be customized.'
                          : undefined}
                      icon={<Edit className="w-3.5 h-3.5" />}
                      className="text-xs py-1"
                    >
                      {role.isSystemRole && role.name !== 'super_admin' ? 'Manage Permissions' : 'Edit Role Matrix'}
                    </Button>

                    {!role.isSystemRole ? (
                      <button
                        onClick={() => {
                          if (confirm(`Delete custom role ${role.name}?`)) deleteRole(role.id);
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-stone-800 rounded-lg transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {role.name === 'super_admin' ? 'Full Access Policy' : 'System Role'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CROSS-PERMISSION MATRIX VIEW                                       */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Council RBAC Cross-Permission Matrix
              </h3>
              <p className="text-xs text-stone-500">
                Visual side-by-side comparison of capabilities granted to each council role profile. Super Admin has full access by system policy.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Granted
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-stone-400">
                <XCircle className="w-3.5 h-3.5" /> Denied
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-900 text-white font-mono uppercase text-[11px]">
                  <th className="py-3.5 px-4 sticky left-0 bg-stone-900 z-10 min-w-[280px]">
                    Operational Capability / Permission
                  </th>
                  {rolesList.map((role) => (
                    <th key={role.id} className="py-3.5 px-3 text-center min-w-[120px]">
                      <div className="font-bold font-serif text-amber-400 truncate max-w-[120px]">
                        {role.name}
                      </div>
                      <div className="text-[9px] text-stone-400 normal-case font-mono mt-0.5">
                        {role.privilegeLevel}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                {permissionCategories.map((category) => (
                  <React.Fragment key={category.id}>
                    {/* Category Header Row */}
                    <tr className="bg-stone-100 dark:bg-stone-800/90 font-bold">
                      <td
                        colSpan={rolesList.length + 1}
                        className="py-2.5 px-4 text-xs font-mono text-stone-800 dark:text-stone-200 uppercase tracking-wider sticky left-0 z-10 bg-stone-100 dark:bg-stone-800/90"
                      >
                        {category.name} ({category.arabicName})
                      </td>
                    </tr>

                    {/* Permissions rows */}
                    {category.permissions.map((perm) => (
                      <tr
                        key={perm.id}
                        className="hover:bg-amber-50/30 dark:hover:bg-stone-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-4 sticky left-0 bg-white dark:bg-stone-900 z-10 shadow-xs">
                          <div className="font-semibold text-stone-900 dark:text-stone-100">
                            {perm.name}
                          </div>
                          <div className="text-[10px] text-stone-500">{perm.description}</div>
                        </td>

                        {rolesList.map((role) => {
                          const hasPerm = hasRolePermission(role, perm.id);
                          return (
                            <td key={role.id} className="py-2.5 px-3 text-center">
                              {hasPerm ? (
                                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-300 dark:text-stone-600 mx-auto">
                                  <span className="text-xs font-bold">•</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SECURITY & ACCESS AUDIT TRAIL                                      */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail by actor, action, target, or details..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={auditCategory}
                onChange={(e) => setAuditCategory(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
              >
                <option value="All">All Categories</option>
                <option value="Staff_Record">Staff Records</option>
                <option value="Role_Change">Role Changes</option>
                <option value="Permission_Override">Permission Overrides</option>
                <option value="Finance_Security">Finance Security</option>
                <option value="Auth">Authentication</option>
                <option value="System_Config">System Config</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAuditCSV}
                icon={<Download className="w-3.5 h-3.5" />}
                className="text-xs py-2"
              >
                Export Audit CSV
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-500 border-b border-stone-200 dark:border-stone-800 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">Timestamp & IP</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Action & Target</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400 italic">
                        No audit records found matching the filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40">
                        <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                          <span className="font-semibold block text-stone-800 dark:text-stone-200">
                            {log.timestamp}
                          </span>
                          <span className="text-[10px] text-stone-400">{log.ipAddress || 'Not recorded'}</span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold block text-stone-900 dark:text-stone-100">
                            {log.actorName}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">{log.actorRole}</span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                            {log.category}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-stone-900 dark:text-stone-100 block">
                            {log.action}
                          </span>
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                            {log.target}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-stone-600 dark:text-stone-400 max-w-md text-[11px] leading-relaxed">
                          <button
                            type="button"
                            aria-expanded={expandedAuditLogId === log.id}
                            aria-controls={`audit-details-${log.id}`}
                            onClick={() => setExpandedAuditLogId((currentId) => currentId === log.id ? null : log.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-semibold text-amber-700 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-amber-400 dark:hover:bg-amber-950/40"
                          >
                            {expandedAuditLogId === log.id
                              ? <EyeOff className="h-3.5 w-3.5" />
                              : <Eye className="h-3.5 w-3.5" />}
                            {expandedAuditLogId === log.id ? 'Hide details' : 'Details'}
                          </button>
                          {expandedAuditLogId === log.id && (
                            <div
                              id={`audit-details-${log.id}`}
                              className="mt-2 max-w-md whitespace-pre-line rounded-lg bg-stone-50 p-3 text-[11px] leading-relaxed text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                            >
                              {log.details}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Badge
                            variant={
                              log.status === 'Success'
                                ? 'emerald'
                                : log.status === 'Warning'
                                ? 'amber'
                                : 'rose'
                            }
                          >
                            {log.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <StaffFormModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        initialStaff={editingStaff}
      />

      <RoleFormModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        initialRole={editingRole}
        permissionsOnly={Boolean(editingRole?.isSystemRole && editingRole.name !== 'super_admin')}
      />

      <StaffDetailDrawer
        isOpen={!!selectedStaffForDetail}
        staff={selectedStaffForDetail}
        onClose={() => setSelectedStaffForDetail(null)}
        onEdit={(staff) => handleOpenEditStaff(staff)}
        onOpenBadge={(staff) => setSelectedStaffForBadge(staff)}
      />

      <StaffBadgeModal
        isOpen={!!selectedStaffForBadge}
        staff={selectedStaffForBadge}
        onClose={() => setSelectedStaffForBadge(null)}
      />
    </div>
  );
};
