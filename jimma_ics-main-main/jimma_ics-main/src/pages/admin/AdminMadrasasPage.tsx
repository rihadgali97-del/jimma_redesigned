import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  createMadrasaRecord,
  fetchAdminDirectoryWoredas,
  fetchAdminDirectoryMadrasas,
  uploadMadrasaPhoto,
  updateMadrasaRecord,
  DirectoryWoreda,
} from '../../services/directoryApi';
import { fetchAdminTeachers } from '../../services/teachersApi';
import { Teacher } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Users,
  GraduationCap,
  ExternalLink,
  MapPin,
  Edit,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export const AdminMadrasasPage: React.FC = () => {
  const { madrasas, refreshDirectoryData, addToast } = useApp();
  const [directoryMadrasas, setDirectoryMadrasas] = useState(madrasas);
  const [woredas, setWoredas] = useState<DirectoryWoreda[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingMadrasa, setEditingMadrasa] = useState<(typeof madrasas)[number] | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [selectedWoredaId, setSelectedWoredaId] = useState<number | null>(null);
  const [totalStudents, setTotalStudents] = useState(150);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [headTeacherId, setHeadTeacherId] = useState('');
  const [hifzGraduatesCount, setHifzGraduatesCount] = useState('');

  useEffect(() => {
    let isMounted = true;
    fetchAdminDirectoryWoredas()
      .then((rows) => {
        if (isMounted) setWoredas(rows);
      })
      .catch((error) => {
        if (isMounted) {
          addToast('Could not load district options', error instanceof Error ? error.message : 'Check your connection and try again.', 'error');
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchAdminDirectoryMadrasas()
      .then((rows) => {
        if (isMounted) setDirectoryMadrasas(rows);
      })
      .catch((error) => {
        if (isMounted) {
          addToast('Could not load madrasa registry', error instanceof Error ? error.message : 'Check your connection and try again.', 'error');
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchAdminTeachers()
      .then((rows) => {
        if (isMounted) setTeachers(rows);
      })
      .catch((error) => {
        if (isMounted) {
          addToast('Could not load teacher options', error instanceof Error ? error.message : 'Check your connection and try again.', 'error');
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const districts = ['All', ...Array.from(new Set(directoryMadrasas.map((m) => m.district)))];
  const districtOptions = woredas.filter((woreda) => woreda.isActive || woreda.name === district);

  const filtered = directoryMadrasas.filter((m) => {
    const s = (searchTerm || '').toLowerCase();
    const matchSearch =
      (m.name || '').toLowerCase().includes(s) ||
      (m.district || '').toLowerCase().includes(s) ||
      (m.headTeacher || '').toLowerCase().includes(s);
    const matchDistrict = selectedDistrict === 'All' || m.district === selectedDistrict;
    return matchSearch && matchDistrict;
  });

  const openAddModal = () => {
    setEditingMadrasa(null);
    setName('');
    const firstActiveWoreda = woredas.find((woreda) => woreda.isActive);
    setDistrict(firstActiveWoreda?.name || '');
    setSelectedWoredaId(firstActiveWoreda?.id || null);
    setTotalStudents(150);
    setDescription('');
    setPhoto(null);
    setHeadTeacherId('');
    setHifzGraduatesCount('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (madrasa: (typeof madrasas)[number]) => {
    setEditingMadrasa(madrasa);
    setName(madrasa.name);
    const selectedWoreda = woredas.find((woreda) => woreda.id === madrasa.woredaId);
    setDistrict(selectedWoreda?.name || madrasa.district);
    setSelectedWoredaId(selectedWoreda?.id || null);
    setTotalStudents(madrasa.totalStudents || 150);
    setDescription(madrasa.description);
    setPhoto(null);
    setHeadTeacherId(madrasa.headTeacherId || '');
    setHifzGraduatesCount(madrasa.hifzGraduatesCount == null ? '' : String(madrasa.hifzGraduatesCount));
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsAddModalOpen(false);
    setEditingMadrasa(null);
    setPhoto(null);
  };

  const refreshAdminMadrasas = async () => {
    const rows = await fetchAdminDirectoryMadrasas();
    setDirectoryMadrasas(rows);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Missing Required Fields', 'Please enter the madrasa name.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const record = editingMadrasa
        ? await updateMadrasaRecord(editingMadrasa.id, {
          name: name.trim(),
          woredaId: Number(selectedWoredaId),
          capacity: Number(totalStudents),
          description: description || 'Islamic education institution registered with Jimma Islamic Council.',
          headTeacherId: headTeacherId ? Number(headTeacherId) : null,
          hifzGraduatesCount: hifzGraduatesCount === '' ? null : Number(hifzGraduatesCount),
        })
        : await createMadrasaRecord({
          name: name.trim(),
          woredaId: Number(selectedWoredaId),
          capacity: Number(totalStudents),
          description: description || 'Islamic education institution registered with Jimma Islamic Council.',
        });
      if (photo) {
        try {
          await uploadMadrasaPhoto(Number(editingMadrasa?.id ?? record.id), photo);
        } catch (error) {
          await refreshDirectoryData();
          await refreshAdminMadrasas();
          setIsAddModalOpen(false);
          setEditingMadrasa(null);
          setName('');
          setDescription('');
          setPhoto(null);
          addToast(
            editingMadrasa ? 'Madrasa updated, photo not uploaded' : 'Madrasa registered, photo not uploaded',
            error instanceof Error ? error.message : 'The record was saved; try uploading its photo again.',
            'error'
          );
          return;
        }
      }
      await refreshDirectoryData();
      await refreshAdminMadrasas();
      setIsAddModalOpen(false);
      setEditingMadrasa(null);
      setName('');
      setDescription('');
      setPhoto(null);
      addToast(
        editingMadrasa ? 'Madrasa updated' : 'Madrasa registered',
        editingMadrasa ? 'The record was updated in the council directory.' : 'The record was saved to the council database.',
        'success'
      );
    } catch (error) {
      addToast(
        editingMadrasa ? 'Could not update madrasa' : 'Could not register madrasa',
        error instanceof Error ? error.message : 'Check your connection and try again.',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Madrasa & Tahfeez Board Administration
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm">
            Curriculum tracking, institutional accreditation, student rolls, and faculty allocations.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={openAddModal}
        >
          Accredit New Madrasa
        </Button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search madrasa, head teacher, district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
          />
        </div>

        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
        >
          {districts.map((d) => (
            <option key={d} value={d}>
              {d === 'All' ? 'All Districts' : d}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 dark:border-stone-700">
              <tr>
                <th className="p-3.5">Photo</th>
                <th className="p-3.5">Institution Name</th>
                <th className="p-3.5">Level</th>
                <th className="p-3.5">District</th>
                <th className="p-3.5">Head Teacher</th>
                <th className="p-3.5">Enrolled Students</th>
                <th className="p-3.5">Graduated Huffaz</th>
                <th className="p-3.5">Faculty</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50">
                  <td className="p-3.5">
                    {m.image ? (
                      <img src={m.image} alt={`${m.name} photo`} className="h-12 w-16 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-stone-100 text-stone-400 dark:bg-stone-800" aria-label="No photo uploaded">
                        <BookOpen className="h-5 w-5" />
                      </div>
                    )}
                  </td>
                  <td className="p-3.5">
                    <div className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                      {m.name}
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">ID: {m.id}</span>
                  </td>
                  <td className="p-3.5">
                    <Badge variant="gold">{m.level || 'Registered'}</Badge>
                  </td>
                  <td className="p-3.5 text-stone-600 dark:text-stone-300 font-medium">
                    {m.district}
                  </td>
                  <td className="p-3.5 font-medium text-stone-800 dark:text-stone-200">
                    {m.headTeacher || 'Not listed'}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {m.totalStudents}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                    {m.hifzGraduatesCount ?? 'Not tracked'}
                  </td>
                  <td className="p-3.5 text-stone-700 dark:text-stone-300">
                    {m.totalTeachers ? `${m.totalTeachers} Mu'allims` : 'Not tracked'}
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" icon={<Edit className="w-3.5 h-3.5" />} onClick={() => openEditModal(m)}>
                      Edit
                    </Button>
                    <Link to={`/madrasas/${m.id}`}>
                      <Button variant="ghost" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Madrasa Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeModal}
        title={editingMadrasa ? 'Edit Registered Madrasa' : 'Accredit New Madrasa / Quran Center'}
        subtitle="Manage the madrasa name, district, enrolled capacity, description, and photo."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
            {editingMadrasa ? 'Save changes to the madrasa record in the council directory.' : 'This form saves the madrasa details and optional photo to the live council directory.'}
          </p>
          {editingMadrasa?.image && !photo && (
            <img src={editingMadrasa.image} alt={`${editingMadrasa.name} current photo`} className="h-24 w-36 rounded-lg object-cover" />
          )}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Madrasa Official Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bilal ibn Rabah Quranic Academy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                District *
              </label>
              <select
                required
                value={selectedWoredaId || ''}
                onChange={(e) => {
                  const selected = woredas.find((woreda) => woreda.id === Number(e.target.value));
                  setSelectedWoredaId(selected?.id || null);
                  setDistrict(selected?.name || '');
                }}
                disabled={districtOptions.length === 0}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              >
                {districtOptions.length === 0 && <option value="">No registered woredas available</option>}
                {districtOptions.map((option) => (
                  <option key={option.id} value={option.id} disabled={!option.isActive}>
                    {option.name}{option.isActive ? '' : ' (inactive; existing records only)'}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Total Enrolled
              </label>
              <input
                type="number"
                min="10"
                value={totalStudents}
                onChange={(e) => setTotalStudents(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden font-mono"
              />
            </div>

          </div>

          {editingMadrasa && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Head Teacher
                </label>
                <select
                  value={headTeacherId}
                  onChange={(e) => setHeadTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                >
                  <option value="">Not assigned</option>
                  {teachers
                    .filter((teacher) => teacher.madrasaId === editingMadrasa.id)
                    .map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}{teacher.status !== 'Active' ? ` (${teacher.status})` : ''}
                      </option>
                    ))}
                </select>
                {!teachers.some((teacher) => teacher.madrasaId === editingMadrasa.id) && (
                  <p className="mt-1 text-xs text-stone-500">
                    No teachers are registered for this madrasa yet. Add one in Teacher Management before assigning a head teacher.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Graduated Huffaz
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={hifzGraduatesCount}
                  onChange={(e) => setHifzGraduatesCount(e.target.value)}
                  placeholder="Leave blank if not tracked"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden font-mono"
                />
                <p className="mt-1 text-xs text-stone-500">Leave blank to mark the count as not tracked.</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Description & Accreditation Remarks
            </label>
            <textarea
              rows={2}
              placeholder="Hafiz training facilities, classroom setup, and boarding capacity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Madrasa Photo (JPEG, PNG, or WebP)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="w-full text-xs text-stone-600 dark:text-stone-300"
            />
            {photo && <p className="mt-1 text-xs text-stone-500">{photo.name}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <Button variant="ghost" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : editingMadrasa ? 'Save Changes' : 'Accredit Madrasa'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
