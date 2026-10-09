import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  createMosqueRecord,
  fetchAdminDirectoryWoredas,
  fetchAdminDirectoryMosques,
  fetchAdminDirectoryMadrasas,
  uploadMosquePhoto,
  updateMosqueRecord,
  DirectoryWoreda,
} from '../../services/directoryApi';
import { Madrasa, MosqueCategory } from '../../types';
import {
  Plus,
  Search,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export const AdminMosquesPage: React.FC = () => {
  const { mosques, refreshDirectoryData, addToast } = useApp();
  const [directoryMosques, setDirectoryMosques] = useState(mosques);
  const [directoryMadrasas, setDirectoryMadrasas] = useState<Madrasa[]>([]);
  const [woredas, setWoredas] = useState<DirectoryWoreda[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingMosque, setEditingMosque] = useState<(typeof mosques)[number] | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<MosqueCategory | ''>('');
  const [district, setDistrict] = useState('');
  const [selectedWoredaId, setSelectedWoredaId] = useState<number | null>(null);
  const [imam, setImam] = useState('');
  const [capacity, setCapacity] = useState(1000);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [selectedMadrasaId, setSelectedMadrasaId] = useState('');

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
    fetchAdminDirectoryMosques()
      .then((rows) => {
        if (isMounted) setDirectoryMosques(rows);
      })
      .catch((error) => {
        if (isMounted) {
          addToast('Could not load mosque registry', error instanceof Error ? error.message : 'Check your connection and try again.', 'error');
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
          addToast('Could not load madrasa options', error instanceof Error ? error.message : 'Check your connection and try again.', 'error');
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const districts = ['All', ...Array.from(new Set(directoryMosques.map((m) => m.district)))];
  const districtOptions = woredas.filter((woreda) => woreda.isActive || woreda.name === district);

  const filtered = directoryMosques.filter((m) => {
    const s = (searchTerm || '').toLowerCase();
    const matchSearch =
      (m.name || '').toLowerCase().includes(s) ||
      (m.code || '').toLowerCase().includes(s) ||
      (m.category || '').toLowerCase().includes(s) ||
      (m.district || '').toLowerCase().includes(s) ||
      (m.imam || '').toLowerCase().includes(s);
    const matchDistrict = selectedDistrict === 'All' || m.district === selectedDistrict;
    return matchSearch && matchDistrict;
  });

  const openAddModal = () => {
    setEditingMosque(null);
    setName('');
    setCode('');
    setCategory('');
    const firstActiveWoreda = woredas.find((woreda) => woreda.isActive);
    setDistrict(firstActiveWoreda?.name || '');
    setSelectedWoredaId(firstActiveWoreda?.id || null);
    setImam('');
    setCapacity(1000);
    setDescription('');
    setPhoto(null);
    setSelectedMadrasaId('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (mosque: (typeof mosques)[number]) => {
    setEditingMosque(mosque);
    setName(mosque.name);
    setCode(mosque.code || '');
    setCategory(mosque.category || '');
    const selectedWoreda = woredas.find((woreda) => woreda.id === mosque.woredaId);
    setDistrict(selectedWoreda?.name || mosque.district);
    setSelectedWoredaId(selectedWoreda?.id || null);
    setImam(mosque.imam === 'Not listed' ? '' : mosque.imam);
    setCapacity(mosque.capacity || 1000);
    setDescription(mosque.description);
    setPhoto(null);
    setSelectedMadrasaId(mosque.madrasaId || '');
    setIsAddModalOpen(true);
  };

  const refreshAdminMosques = async () => {
    const rows = await fetchAdminDirectoryMosques();
    setDirectoryMosques(rows);
  };

  const refreshAdminMadrasas = async () => {
    const rows = await fetchAdminDirectoryMadrasas();
    setDirectoryMadrasas(rows);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !imam.trim() || !category) {
      addToast('Missing Required Fields', 'Please complete the mosque name, category, and imam.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const record = editingMosque
        ? await updateMosqueRecord(editingMosque.id, {
          name: name.trim(),
          code,
          category,
          woredaId: Number(selectedWoredaId),
          imam: imam.trim(),
          capacity: Number(capacity),
          description: description || 'Registered mosque under Jimma Islamic Council jurisdiction.',
          madrasaId: selectedMadrasaId ? Number(selectedMadrasaId) : null,
        })
        : await createMosqueRecord({
          name: name.trim(),
          code,
          category,
          woredaId: Number(selectedWoredaId),
          imam: imam.trim(),
          capacity: Number(capacity),
          description: description || 'Registered mosque under Jimma Islamic Council jurisdiction.',
          madrasaId: selectedMadrasaId ? Number(selectedMadrasaId) : null,
        });
      if (photo) {
        try {
          await uploadMosquePhoto(Number(editingMosque?.id ?? record.id), photo);
        } catch (error) {
          await refreshDirectoryData();
          await refreshAdminMosques();
          await refreshAdminMadrasas();
          setIsAddModalOpen(false);
          addToast(
            editingMosque ? 'Mosque updated, photo not uploaded' : 'Mosque registered, photo not uploaded',
            error instanceof Error ? error.message : 'Edit the mosque record and try uploading the photo again.',
            'error'
          );
          return;
        }
      }
      await refreshDirectoryData();
      await refreshAdminMosques();
      await refreshAdminMadrasas();
      setIsAddModalOpen(false);
      setEditingMosque(null);
      setPhoto(null);
      addToast(
        editingMosque ? 'Mosque updated' : 'Mosque registered',
        editingMosque ? 'The mosque record was updated.' : 'The record was saved to the council database.',
        'success'
      );
    } catch (error) {
      addToast(
        editingMosque ? 'Could not update mosque' : 'Could not register mosque',
        error instanceof Error ? error.message : 'Check your connection and try again.',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingMosque(null);
    setPhoto(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Mosque Registry & Operations
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm">
            Manage all 128+ registered mosques, prayer halls, and administrative profiles in Jimma Zone.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={openAddModal}
        >
          Register New Mosque
        </Button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search mosque, imam, district..."
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

      {/* Mosques Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 dark:border-stone-700">
              <tr>
                <th className="p-3.5">Mosque Name</th>
                <th className="p-3.5">Koodii</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">District & Location</th>
                <th className="p-3.5">Imam Khatib</th>
                <th className="p-3.5">Capacity</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Linked Madrasa</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50">
                  <td className="p-3.5">
                    <div className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                      {m.name}
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">ID: {m.id}</span>
                  </td>
                  <td className="p-3.5 font-mono text-stone-600 dark:text-stone-300">{m.code || 'Not listed'}</td>
                  <td className="p-3.5 text-stone-600 dark:text-stone-300">{m.category || 'Not listed'}</td>
                  <td className="p-3.5 text-stone-600 dark:text-stone-300">
                    <div className="font-semibold">{m.district}</div>
                    <span className="text-[11px] text-stone-400">{m.address}</span>
                  </td>
                  <td className="p-3.5 font-medium text-stone-800 dark:text-stone-200">
                    {m.imam}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {m.capacity.toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <Badge variant={m.status?.toLowerCase() === 'active' ? 'emerald' : 'gold'}>
                      {m.status === 'active' ? 'Active' : m.status}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-stone-600 dark:text-stone-400 truncate max-w-[150px]">
                    {m.madrasaName || 'Not listed'}
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" icon={<Edit className="w-3.5 h-3.5" />} onClick={() => openEditModal(m)}>
                      Edit
                    </Button>
                    <Link to={`/mosques/${m.id}`}>
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

      {/* Add/Edit Mosque Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        title={editingMosque ? 'Edit Registered Mosque' : 'Register New Mosque in Jimma Zone'}
        subtitle="Manage the mosque name, code, category, woreda, imam, capacity, linked madrasa, description, and photo."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
            {editingMosque ? 'Save changes to the mosque record in the council directory.' : 'This form saves the mosque details and optional photo to the live council directory.'}
          </p>
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Mosque Official Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Masjid Al-Rahma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Koodii (Mosque Code)
              </label>
              <input
                type="text"
                maxLength={50}
                placeholder="e.g. 04/02/01/01"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Mosque Category *
              </label>
              <select
                required
                value={category}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategory(value === "Jumaa'a" || value === "Jama'a" ? value : '');
                }}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              >
                <option value="">Select category</option>
                <option value="Jumaa'a">Jumaa'a</option>
                <option value="Jama'a">Jama'a</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              District Jurisdiction *
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

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Linked Madrasa
            </label>
            <select
              value={selectedMadrasaId}
              onChange={(e) => setSelectedMadrasaId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
            >
              <option value="">No madrasa linked</option>
              {directoryMadrasas
                .filter((madrasa) => !madrasa.mosqueId || madrasa.mosqueId === editingMosque?.id)
                .map((madrasa) => (
                  <option key={madrasa.id} value={madrasa.id}>
                    {madrasa.name} — {madrasa.district}
                  </option>
                ))}
            </select>
            <p className="mt-1 text-xs text-stone-500">
              Only registered madrasas that are not linked to another mosque are available.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Chief Imam Khatib *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sheikh Ahmed Ali"
                value={imam}
                onChange={(e) => setImam(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Prayer Capacity
              </label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Historical & Facility Description
            </label>
            <textarea
              rows={2}
              placeholder="Summary of community services, prayer halls, and endowments..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
            />
          </div>

          {editingMosque?.image && !photo && (
            <img src={editingMosque.image} alt={`${editingMosque.name} current photo`} className="h-24 w-24 rounded-lg object-cover" />
          )}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Mosque Photo (JPEG, PNG, or WebP)
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
            <Button variant="ghost" type="button" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : editingMosque ? 'Save Changes' : 'Register Mosque'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
