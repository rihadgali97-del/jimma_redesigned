import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { RoleDefinition, StaffDepartment } from '../../../types';
import {
  X,
  Shield,
  CheckSquare,
  Square,
  Sparkles,
  AlertTriangle,
  Layers,
  Palette,
  LayoutDashboard,
  Building,
  Key,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: RoleDefinition;
  permissionsOnly?: boolean;
}

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  onClose,
  initialRole,
  permissionsOnly = false,
}) => {
  const { permissionCategories, addRole, updateRole } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    department: 'Education Directorate' as StaffDepartment,
    description: '',
    privilegeLevel: 'Standard' as 'Critical' | 'High' | 'Medium' | 'Standard',
    defaultDashboard: '/admin',
    color: '#059669',
    permissions: [] as string[],
  });

  const departments: StaffDepartment[] = [
    'Executive Secretariat',
    'Shariah & Fatwa Board',
    'Education Directorate',
    'Finance & Endowment',
    'Mosque & Waqf Affairs',
    'Social Services & Zakat',
    'IT & Media Communications',
  ];

  const dashboardRoutes = [
    { label: 'Executive Overview (/admin)', path: '/admin' },
    { label: 'Mosques Registry (/admin/mosques)', path: '/admin/mosques' },
    { label: 'Madrasas & Education (/admin/madrasas)', path: '/admin/madrasas' },
    { label: 'Students & Hifz Desk (/admin/students)', path: '/admin/students' },
    { label: 'Financial Control Center (/admin/finance)', path: '/admin/finance' },
    { label: 'Service Requests Desk (/admin/services)', path: '/admin/services' },
    { label: 'SMS & Telegram Gateway (/admin/gateway)', path: '/admin/gateway' },
    { label: 'Events & Programs (/admin/events)', path: '/admin/events' },
  ];

  const colorPalette = [
    { name: 'Emerald', hex: '#059669' },
    { name: 'Gold / Amber', hex: '#D97706' },
    { name: 'Blue', hex: '#2563EB' },
    { name: 'Purple', hex: '#7C3AED' },
    { name: 'Teal', hex: '#0D9488' },
    { name: 'Indigo', hex: '#4F46E5' },
    { name: 'Orange', hex: '#EA580C' },
    { name: 'Slate Gray', hex: '#64748B' },
  ];

  useEffect(() => {
    if (initialRole) {
      setFormData({
        name: initialRole.name,
        arabicName: initialRole.arabicName || '',
        department: (initialRole.department as StaffDepartment) || 'Education Directorate',
        description: initialRole.description,
        privilegeLevel: initialRole.privilegeLevel,
        defaultDashboard: initialRole.defaultDashboard || '/admin',
        color: initialRole.color || '#059669',
        permissions: [...initialRole.permissions],
      });
    } else {
      setFormData({
        name: '',
        arabicName: '',
        department: 'Education Directorate',
        description: '',
        privilegeLevel: 'Standard',
        defaultDashboard: '/admin',
        color: '#059669',
        permissions: ['mosque.view', 'madrasa.view', 'student.manage'],
      });
    }
  }, [initialRole, isOpen]);

  const allSystemPermIds = permissionCategories.flatMap((c) => c.permissions.map((p) => p.id));
  const additionalPermissionIds = permissionsOnly
    ? (initialRole?.permissions || []).filter((id) => !allSystemPermIds.includes(id))
    : [];
  const allEditablePermissionIds = [...new Set([...allSystemPermIds, ...additionalPermissionIds])];

  const togglePermission = (id: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(id);
      const next = exists ? prev.permissions.filter((p) => p !== id) : [...prev.permissions, id];
      return { ...prev, permissions: next };
    });
  };

  const handleSelectAllCategory = (catId: string) => {
    const cat = permissionCategories.find((c) => c.id === catId);
    if (!cat) return;
    const catPermIds = cat.permissions.map((p) => p.id);
    const allSelected = catPermIds.every((id) => formData.permissions.includes(id));

    setFormData((prev) => {
      let next: string[];
      if (allSelected) {
        // Remove all from this category
        next = prev.permissions.filter((id) => !catPermIds.includes(id));
      } else {
        // Add all from this category
        next = Array.from(new Set([...prev.permissions, ...catPermIds]));
      }
      return { ...prev, permissions: next };
    });
  };

  const handleSelectGlobalAll = () => {
    const allSelected = allEditablePermissionIds.every((id) => formData.permissions.includes(id));
    setFormData((prev) => ({
      ...prev,
      permissions: allSelected ? [] : [...allEditablePermissionIds],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissionsOnly && (!formData.name.trim() || !formData.description.trim())) return;

    if (initialRole) {
      const saved = await updateRole(initialRole.id, {
        ...(permissionsOnly ? { permissions: formData.permissions } : formData),
      });
      if (!saved) return;
    } else {
      const saved = await addRole({
        ...formData,
        isSystemRole: false,
        assignedUsersCount: 0,
      });
      if (!saved) return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: formData.color }}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">
                {permissionsOnly
                  ? `Manage Permissions: ${initialRole?.name}`
                  : initialRole
                    ? `Configure Role Matrix: ${initialRole.name}`
                    : 'Define New Council RBAC Role'}
              </h3>
              <p className="text-xs text-stone-300">
                {permissionsOnly
                  ? "Customize this system role's permissions. Its identity and other settings remain protected."
                  : 'Configure granular operational capabilities, privilege tiers, and default workspaces.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Basic Metadata */}
          {!permissionsOnly && <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Role Definition & Scope</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Role Title (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zakat & Endowment Inspector"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Arabic Role Designation (Nominal)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: مفتش الزكاة والأوقاف"
                  value={formData.arabicName}
                  onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-serif outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Assigned Directorate
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as StaffDepartment })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Privilege / Security Tier
                </label>
                <select
                  value={formData.privilegeLevel}
                  onChange={(e) => setFormData({ ...formData, privilegeLevel: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500 font-bold"
                >
                  <option value="Standard">Standard (Field / Instructor)</option>
                  <option value="Medium">Medium (Department Officer)</option>
                  <option value="High">High (Directorate Chair)</option>
                  <option value="Critical">Critical (Executive Root)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Default Landing Desk
                </label>
                <select
                  value={formData.defaultDashboard}
                  onChange={(e) => setFormData({ ...formData, defaultDashboard: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
                >
                  {dashboardRoutes.map((r) => (
                    <option key={r.path} value={r.path}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Role Description & Mandate Scope *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Detail the operational authority, sign-off limits, and responsibilities associated with this role."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Role Color */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                Brand Badge Accent Color
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {colorPalette.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c.hex })}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border transition-all ${
                      formData.color === c.hex
                        ? 'border-stone-900 dark:border-stone-100 ring-2 ring-amber-500 font-bold'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                    <span className="text-[11px] text-stone-700 dark:text-stone-300">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>}

          {!permissionsOnly && <hr className="border-stone-200 dark:border-stone-800" />}

          {/* Permission Matrix */}
          <div className="space-y-4">
            {permissionsOnly && (
              <p className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-xs text-stone-700 dark:text-stone-300">
                Saving replaces this role's current permissions. Changes are retained when default roles are seeded again.
              </p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <Key className="w-4 h-4" />
                <span>Granular Permission Matrix</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="gold" className="text-xs">
                  {formData.permissions.length} of {allEditablePermissionIds.length} Permissions Active
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectGlobalAll}
                  className="text-xs py-1"
                >
                  {allEditablePermissionIds.every((id) => formData.permissions.includes(id))
                    ? 'Deselect All'
                    : 'Grant All Permissions'}
                </Button>
              </div>
            </div>

            {permissionsOnly && additionalPermissionIds.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-3">
                <div>
                  <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                    Additional backend permissions
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    These permissions are currently assigned but are not in a named category. Their exact keys are shown.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {additionalPermissionIds.map((permission) => (
                    <label key={permission} className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <code>{permission}</code>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {permissionCategories.map((category) => {
                const catPermIds = category.permissions.map((p) => p.id);
                const activeCount = catPermIds.filter((id) => formData.permissions.includes(id)).length;
                const isAllSelected = activeCount === catPermIds.length;

                return (
                  <div
                    key={category.id}
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                            {category.name}
                          </h4>
                          {category.arabicName && (
                            <span className="text-[11px] font-serif text-amber-600 dark:text-amber-400">
                              {category.arabicName}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500">{category.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectAllCategory(category.id)}
                        className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold shrink-0"
                      >
                        {isAllSelected ? 'Clear Section' : 'Select All'} ({activeCount}/{catPermIds.length})
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {category.permissions.map((perm) => {
                        const isChecked = formData.permissions.includes(perm.id);

                        return (
                          <label
                            key={perm.id}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-white dark:bg-stone-800 border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/30'
                                : 'bg-white/40 dark:bg-stone-800/30 border-stone-200 dark:border-stone-700 hover:border-stone-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.id)}
                              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-semibold text-stone-900 dark:text-stone-100">
                                  {perm.name}
                                </span>
                                {perm.risk === 'Critical' && (
                                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold shrink-0">
                                    Critical Risk
                                  </span>
                                )}
                                {perm.risk === 'High' && (
                                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold shrink-0">
                                    High Risk
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-stone-500 mt-0.5 leading-relaxed">
                                {perm.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="gold" size="sm" type="submit" icon={<Shield className="w-4 h-4" />}>
              {permissionsOnly ? 'Save Permissions' : initialRole ? 'Save Role Profile' : 'Publish New Role'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
