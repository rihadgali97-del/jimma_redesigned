import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { User, UserRole, StaffDepartment, StaffStatus } from '../../../types';
import {
  X,
  Shield,
  UserCheck,
  Building,
  Phone,
  Mail,
  MapPin,
  Lock,
  Sparkles,
  Camera,
  CheckSquare,
  Square,
  AlertCircle,
  Key,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStaff?: User;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  initialStaff,
}) => {
  const { rolesList, permissionCategories, addStaff, updateStaff } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    email: '',
    password: '',
    role: 'Teacher' as UserRole,
    title: '',
    department: 'Education Directorate' as StaffDepartment,
    phone: '',
    district: 'Jimma Central',
    status: 'Active' as StaffStatus,
    accessLevel: 'Level 3 (Departmental Officer)',
    twoFactorEnabled: true,
    avatar: '',
    notes: '',
    customPermissions: [] as string[],
  });

  const [overrideMode, setOverrideMode] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const departments: StaffDepartment[] = [
    'Executive Secretariat',
    'Shariah & Fatwa Board',
    'Education Directorate',
    'Finance & Endowment',
    'Mosque & Waqf Affairs',
    'Social Services & Zakat',
    'IT & Media Communications',
  ];

  const districts = [
    'Jimma Central',
    'Bosa Kito',
    'Hermata',
    'Mendera Kochore',
    'Bosa Addis',
    'Agaro',
    'Seka Chekorsa',
    'Mana',
    'Gomma',
    'Kersa',
  ];

  const accessLevels = [
    'Level 1 (Full System Root)',
    'Level 2 (Executive Directorate)',
    'Level 3 (Departmental Officer)',
    'Level 4 (Field & Mosque Staff)',
    'Level 5 (Read-Only Independent Audit)',
  ];

  useEffect(() => {
    setProfilePhoto(null);
    if (initialStaff) {
      setPhotoPreview(initialStaff.avatar || '');
      setFormData({
        name: initialStaff.name || '',
        arabicName: initialStaff.arabicName || '',
        email: initialStaff.email || '',
        password: '',
        role: initialStaff.role || 'Teacher',
        title: initialStaff.title || '',
        department: (initialStaff.department as StaffDepartment) || 'Education Directorate',
        phone: initialStaff.phone || '',
        district: initialStaff.district || 'Jimma Central',
        status: initialStaff.status || 'Active',
        accessLevel: initialStaff.accessLevel || 'Level 3 (Departmental Officer)',
        twoFactorEnabled: initialStaff.twoFactorEnabled ?? true,
        avatar: initialStaff.avatar || '',
        notes: initialStaff.notes || '',
        customPermissions: initialStaff.customPermissions || [],
      });
      setOverrideMode(!!(initialStaff.customPermissions && initialStaff.customPermissions.length > 0));
    } else {
      setFormData({
        name: '',
        arabicName: '',
        email: '',
        password: '',
        role: 'Teacher',
        title: '',
        department: 'Education Directorate',
        phone: '+251 9',
        district: 'Jimma Central',
        status: 'Active',
        accessLevel: 'Level 4 (Field & Mosque Staff)',
        twoFactorEnabled: true,
        avatar: '',
        notes: '',
        customPermissions: [],
      });
      setPhotoPreview('');
      setOverrideMode(false);
    }
  }, [initialStaff, isOpen]);

  useEffect(() => () => {
    if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const handlePhotoChange = (file?: File) => {
    if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    if (!file) {
      setProfilePhoto(null);
      setPhotoPreview(initialStaff?.avatar || '');
      return;
    }
    setProfilePhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // When role changes, if not in override mode, inherit permissions from role
  const selectedRoleDef = rolesList.find((r) => r.name === formData.role);

  const toggleCustomPermission = (permId: string) => {
    setFormData((prev) => {
      const exists = prev.customPermissions.includes(permId);
      const next = exists
        ? prev.customPermissions.filter((p) => p !== permId)
        : [...prev.customPermissions, permId];
      return { ...prev, customPermissions: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    // Base permissions from selected role + custom overrides
    const basePermissions = selectedRoleDef?.permissions || [];
    const finalPermissions = Array.from(new Set([...basePermissions, ...formData.customPermissions]));

    if (initialStaff) {
      const saved = await updateStaff(initialStaff.id, {
        ...formData,
        permissions: finalPermissions,
      }, profilePhoto || undefined);
      if (!saved) return;
    } else {
      if (formData.password.length < 10) return;
      const saved = await addStaff({
        ...formData,
        permissions: finalPermissions,
        joinedDate: new Date().toISOString().split('T')[0],
      }, profilePhoto || undefined);
      if (!saved) return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">
                {initialStaff ? 'Edit Staff Profile & Credentials' : 'Enroll New Council Personnel'}
              </h3>
              <p className="text-xs text-stone-300">
                {initialStaff ? 'Update role assignments, security tiers, and jurisdiction.' : 'Provision official system credentials and access permissions.'}
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
          {/* Identity Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <UserCheck className="w-4 h-4" />
              <span>Personal & Official Identity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Full Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ustadh Fuad Jamal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Arabic Name / Title (Nominal)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: الأستاذ فؤاد جمال"
                  value={formData.arabicName}
                  onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-serif outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                Staff Profile Photo
              </label>
              <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-white text-stone-400 dark:border-stone-600 dark:bg-stone-900">
                  {photoPreview ? <img src={photoPreview} alt="Staff profile preview" className="h-full w-full object-cover" /> : <Camera className="h-7 w-7" />}
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    aria-label="Upload staff profile photo"
                    onChange={(event) => handlePhotoChange(event.target.files?.[0])}
                    className="block w-full text-xs text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-700 file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-emerald-800 dark:text-stone-300"
                  />
                  <p className="text-[11px] text-stone-500">Choose a JPEG, PNG, or WebP image. Leave empty to keep the current photo.</p>
                  {profilePhoto && <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">{profilePhoto.name}</p>}
                </div>
              </div>
            </div>

            {!initialStaff && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Initial Account Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={10}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
                />
                <p className="mt-1 text-[11px] text-stone-500">At least 10 characters. The backend stores only a secure password hash.</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Official Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="officer@jimmaislamiccouncil.demo"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Mobile / Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+251 91 234 5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Official Title / Position
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Hifz & Tajweed Inspector"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Jurisdiction District / Woreda
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-stone-200 dark:border-stone-800" />

          {/* Department & Role Assignment */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <Building className="w-4 h-4" />
              <span>Departmental & RBAC Role Assignment</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Assigned Council Directorate
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as StaffDepartment })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
                >
                  {departments.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Primary RBAC Role Profile *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => {
                    const nextRole = e.target.value as UserRole;
                    const rDef = rolesList.find((r) => r.name === nextRole);
                    setFormData({
                      ...formData,
                      role: nextRole,
                      department: rDef ? (rDef.department as StaffDepartment) : formData.department,
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500 font-semibold text-amber-700 dark:text-amber-400"
                >
                  {rolesList.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.privilegeLevel})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedRoleDef && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-900 dark:text-amber-200">
                    Role Summary: {selectedRoleDef.name}
                  </span>
                  <Badge variant="gold" className="text-[10px]">
                    {(selectedRoleDef.permissions || []).length} Default Permissions
                  </Badge>
                </div>
                <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
                  {selectedRoleDef.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Access Level Tier
                </label>
                <select
                  value={formData.accessLevel}
                  onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
                >
                  {accessLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Account Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StaffStatus })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
                >
                  <option value="Active">Active (Permitted)</option>
                  <option value="Pending Invitation">Pending Activation</option>
                  <option value="On Leave">On Leave (Temporary Lock)</option>
                  <option value="Suspended">Suspended (Revoked)</option>
                </select>
              </div>
            </div>

            {/* 2FA Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    Two-Factor Authentication (2FA OTP)
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Enforce SMS OTP code verification on every council administrative login.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, twoFactorEnabled: !formData.twoFactorEnabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  formData.twoFactorEnabled ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    formData.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <hr className="border-stone-200 dark:border-stone-800" />

          {/* Granular Permission Overrides */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                <Key className="w-4 h-4" />
                <span>Custom Permission Overrides (Optional)</span>
              </div>

              <button
                type="button"
                onClick={() => setOverrideMode(!overrideMode)}
                className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline"
              >
                {overrideMode ? 'Hide Overrides' : 'Customize Permissions (+)'}
              </button>
            </div>

            {overrideMode && (
              <div className="space-y-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 animate-in fade-in duration-150">
                <p className="text-xs text-stone-500">
                  Grant special additional permissions to this specific user beyond their primary role template:
                </p>

                <div className="space-y-3">
                  {permissionCategories.map((cat) => (
                    <div key={cat.id} className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
                      <h5 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        {cat.name}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cat.permissions.map((p) => {
                          const isInherited = (selectedRoleDef?.permissions || []).includes(p.id);
                          const isCustom = formData.customPermissions.includes(p.id);
                          const isChecked = isInherited || isCustom;

                          return (
                            <label
                              key={p.id}
                              className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                                  : 'bg-stone-50/50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 hover:border-stone-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                disabled={isInherited}
                                checked={isChecked}
                                onChange={() => toggleCustomPermission(p.id)}
                                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                                    {p.name}
                                  </span>
                                  {isInherited && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400 font-mono">
                                      Role Default
                                    </span>
                                  )}
                                  {p.risk === 'Critical' && (
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold">
                                      High Risk
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-stone-500 line-clamp-1">{p.description}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Administrative Dossier / Special Mandate Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Primary contact for Bosa Kito district madrasa annual evaluations."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="gold" size="sm" type="submit" icon={<Shield className="w-4 h-4" />}>
              {initialStaff ? 'Save Staff Changes' : 'Provision Staff Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
