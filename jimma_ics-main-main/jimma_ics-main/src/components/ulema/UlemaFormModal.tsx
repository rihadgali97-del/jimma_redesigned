import React, { useEffect, useState } from 'react';
import { Camera, Loader2, Save, UserRound } from 'lucide-react';
import { Ulema } from '../../types';
import { UlemaInput } from '../../services/ulemaApi';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { UlemaAvatar } from './UlemaAvatar';

interface UlemaFormModalProps {
  isOpen: boolean;
  profile?: Ulema;
  onClose: () => void;
  onSave: (value: UlemaInput, photo?: File) => Promise<boolean>;
}

type ProfileForm = {
  name: string;
  arabicName: string;
  title: string;
  specializations: string;
  district: string;
  assignedMosqueId: string;
  assignedMosqueName: string;
  qualifications: string;
  languages: string;
  areasOfService: string;
  biography: string;
  contactPhone: string;
  email: string;
  status: Ulema['status'];
  yearsOfDawah: number;
  isFeatured: boolean;
  isPublished: boolean;
};

const emptyForm: ProfileForm = {
  name: '', arabicName: '', title: '', specializations: '', district: '',
  assignedMosqueId: '', assignedMosqueName: '', qualifications: '',
  languages: '', areasOfService: '', biography: '', contactPhone: '',
  email: '', status: 'Active', yearsOfDawah: 0, isFeatured: false, isPublished: false,
};

const listText = (value: string) => value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
const inputClass = 'w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100';
const labelClass = 'mb-1.5 block text-xs font-semibold text-stone-600 dark:text-stone-300';

export const UlemaFormModal: React.FC<UlemaFormModalProps> = ({ isOpen, profile, onClose, onSave }) => {
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [photo, setPhoto] = useState<File>();
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(profile ? {
      name: profile.name,
      arabicName: profile.arabicName || '',
      title: profile.title,
      specializations: profile.specializations.join(', '),
      district: profile.district,
      assignedMosqueId: profile.assignedMosqueId || '',
      assignedMosqueName: profile.assignedMosqueName || '',
      qualifications: profile.qualifications.join('\n'),
      languages: profile.languages.join(', '),
      areasOfService: profile.areasOfService.join('\n'),
      biography: profile.biography,
      contactPhone: profile.contactPhone,
      email: profile.email,
      status: profile.status,
      yearsOfDawah: profile.yearsOfDawah,
      isFeatured: profile.isFeatured ?? false,
      isPublished: profile.isPublished ?? false,
    } : emptyForm);
    setPhoto(undefined);
    setPreview(profile?.avatar || '');
  }, [profile, isOpen]);

  useEffect(() => () => {
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
  }, [preview]);

  const set = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handlePhoto = (file?: File) => {
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : profile?.avatar || '');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const saved = await onSave({
      ...form,
      arabicName: form.arabicName.trim() || undefined,
      assignedMosqueId: form.assignedMosqueId.trim() || undefined,
      assignedMosqueName: form.assignedMosqueName.trim() || undefined,
      specializations: listText(form.specializations),
      qualifications: listText(form.qualifications),
      languages: listText(form.languages),
      areasOfService: listText(form.areasOfService),
    }, photo);
    setSaving(false);
    if (saved) onClose();
  };

  const field = (label: string, key: keyof ProfileForm, type = 'text', required = false) => (
    <label className="block">
      <span className={labelClass}>{label}{required ? ' *' : ''}</span>
      <input className={inputClass} type={type} required={required} value={String(form[key])}
        onChange={(event) => set(key, (type === 'number' ? Number(event.target.value) : event.target.value) as ProfileForm[typeof key])} />
    </label>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl"
      title={profile ? 'Update scholar profile' : 'Register a scholar'}
      subtitle="Maintain an accurate council profile. Only published scholars appear in the public directory.">
      <form onSubmit={(event) => void submit(event)} className="space-y-6">
        <section className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:flex-row sm:items-center dark:border-emerald-900 dark:bg-emerald-950/20">
          <UlemaAvatar name={form.name || 'Scholar'} src={preview} className="h-24 w-24 shrink-0 rounded-2xl text-2xl shadow-sm" />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-stone-900 dark:text-stone-100">Profile photo</div>
            <p className="mt-1 text-xs leading-relaxed text-stone-500">Choose a clear JPG, PNG, or WebP image. The preview shows how the directory avatar will appear.</p>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:border-emerald-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
              <Camera className="h-4 w-4" /> Choose photo
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => handlePhoto(event.target.files?.[0])} />
            </label>
          </div>
        </section>

        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100"><UserRound className="h-4 w-4 text-emerald-700" /> Scholar details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {field('Full name', 'name', 'text', true)}
            {field('Arabic name', 'arabicName')}
            {field('Title / council role', 'title', 'text', true)}
            {field('District', 'district', 'text', true)}
            {field('Contact phone', 'contactPhone', 'tel', true)}
            {field('Email address', 'email', 'email', true)}
            {field('Assigned institution', 'assignedMosqueName')}
            {field('Institution reference (optional)', 'assignedMosqueId')}
            {field('Years of service', 'yearsOfDawah', 'number')}
            <label className="block">
              <span className={labelClass}>Status</span>
              <select className={inputClass} value={form.status} onChange={(event) => set('status', event.target.value as Ulema['status'])}>
                <option>Active</option><option>Senior Advisor</option><option>Visiting Scholar</option>
              </select>
            </label>
            <label className="block sm:col-span-2"><span className={labelClass}>Biography</span>
              <textarea className={inputClass} rows={3} required value={form.biography} onChange={(event) => set('biography', event.target.value)} />
            </label>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold text-stone-900 dark:text-stone-100">Scholarly background</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ['Specializations', 'specializations', 'Comma-separated disciplines'],
              ['Qualifications', 'qualifications', 'One qualification per line'],
              ['Languages', 'languages', 'Comma-separated languages'],
              ['Areas of service', 'areasOfService', 'One service area per line'],
            ] as const).map(([label, key, hint]) => (
              <label key={key} className="block">
                <span className={labelClass}>{label}</span>
                <textarea className={inputClass} rows={3} placeholder={hint} value={form[key]} onChange={(event) => set(key, event.target.value)} />
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-stone-200 p-4 dark:border-stone-800">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={form.isPublished} onChange={(event) => set('isPublished', event.target.checked)} className="mt-0.5 accent-emerald-700" />
            <span><strong className="block text-stone-900 dark:text-stone-100">Publish in public directory</strong><span className="text-xs text-stone-500">Allow visitors to discover this scholar profile.</span></span>
          </label>
          <label className={`flex items-start gap-3 text-sm ${!form.isPublished ? 'opacity-50' : ''}`}>
            <input type="checkbox" disabled={!form.isPublished} checked={form.isFeatured} onChange={(event) => set('isFeatured', event.target.checked)} className="mt-0.5 accent-amber-600" />
            <span><strong className="block text-stone-900 dark:text-stone-100">Feature this scholar</strong><span className="text-xs text-stone-500">Featured profiles are promoted to the top of the directory.</span></span>
          </label>
        </section>

        <div className="flex justify-end gap-3 border-t border-stone-100 pt-4 dark:border-stone-800">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving} icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}>
            {saving ? 'Saving…' : profile ? 'Save profile' : 'Register scholar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
