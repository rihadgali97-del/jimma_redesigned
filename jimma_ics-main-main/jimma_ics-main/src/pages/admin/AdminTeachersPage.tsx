import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  Search,
  BookOpen,
  Award,
  CheckCircle2,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  Trash2,
  Edit2,
  Filter,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Teacher } from '../../types';

export const AdminTeachersPage: React.FC = () => {
  const {
    teachers, madrasas, addTeacher, updateTeacher, deleteTeacher, addToast,
    refreshTeachers, teachersLoading, teachersError,
  } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMadrasaFilter, setSelectedMadrasaFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'Active' | 'On Leave'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTeacherForDetail, setSelectedTeacherForDetail] = useState<Teacher | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [madrasaId, setMadrasaId] = useState(madrasas[0]?.id || 'madrasa-1');
  const [specialization, setSpecialization] = useState('Hifz & Tajweed');
  const [sanad, setSanad] = useState('Hafs an Asim (Shatibiyyah Tariq)');
  const [experienceYears, setExperienceYears] = useState(8);
  const [salaryETB, setSalaryETB] = useState(9000);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    void refreshTeachers(true).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (madrasas.length > 0 && !madrasas.some((madrasa) => madrasa.id === madrasaId)) {
      setMadrasaId(madrasas[0].id);
    }
  }, [madrasas, madrasaId]);

  const filteredTeachers = teachers.filter((t) => {
    const s = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (t.name || '').toLowerCase().includes(s) ||
      (t.madrasaName || '').toLowerCase().includes(s) ||
      (t.specialization || '').toLowerCase().includes(s) ||
      (t.sanad || '').toLowerCase().includes(s) ||
      (t.qualification || '').toLowerCase().includes(s);

    const matchesMadrasa =
      selectedMadrasaFilter === 'ALL' || t.madrasaId === selectedMadrasaFilter;

    const matchesStatus =
      selectedStatusFilter === 'ALL' || t.status === selectedStatusFilter;

    return matchesSearch && matchesMadrasa && matchesStatus;
  });

  const totalAssignedStudents = teachers.reduce(
    (acc, t) => acc + (t.assignedStudentsCount ?? t.studentsCount ?? 0),
    0
  );

  const totalMonthlyHonorarium = teachers.reduce(
    (acc, t) => acc + (t.salaryETB ?? 8500),
    0
  );

  const certifiedCount = teachers.filter((t) => t.isCertified ?? true).length;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      addToast('Missing Fields', 'Please provide the teacher name, phone number, and email.', 'warning');
      return;
    }

    const assignedMadrasa = madrasas.find((m) => m.id === madrasaId);
    if (!assignedMadrasa) {
      addToast('Madrasa Required', 'Select an available madrasa before registering the teacher.', 'warning');
      return;
    }

    const created = await addTeacher({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      madrasaId: madrasaId,
      madrasaName: assignedMadrasa?.name || 'Madrasa Darul Uloom',
      specialization: specialization.trim() || 'Hifz & Tajweed',
      sanad: sanad.trim() || 'Council Certified Sanad',
      qualification: sanad.trim() || 'Certified Mu’allim License',
      experienceYears: Number(experienceYears) || 5,
      studentsCount: 25,
      assignedStudentsCount: 25,
      salaryETB: Number(salaryETB) || 9000,
      status: 'Active',
      isCertified: true,
      isFeatured,
      isPublished,
    });
    if (!created) return;

    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setSpecialization('Hifz & Tajweed');
    setSanad('Hafs an Asim (Shatibiyyah Tariq)');
    setExperienceYears(8);
    setSalaryETB(9000);
    setIsFeatured(false);
    setIsPublished(false);
  };

  const toggleStatus = (teacher: Teacher) => {
    const nextStatus = teacher.status === 'Active' ? 'On Leave' : 'Active';
    void updateTeacher(teacher.id, { status: nextStatus });
    addToast(
      'Status Updated',
      `${teacher.name} marked as ${nextStatus}.`,
      'info'
    );
  };

  const handleDelete = (id: string, teacherName: string) => {
    if (confirm(`Are you sure you want to remove ${teacherName} from the faculty registry?`)) {
      void deleteTeacher(id);
    }
  };

  return (
    <div className="space-y-6">
      {teachersLoading && <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">Loading teacher records from the backend…</div>}
      {teachersError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Could not load teacher records: {teachersError}<button type="button" className="ml-3 font-semibold underline" onClick={() => void refreshTeachers(true).catch(() => undefined)}>Retry</button></div>}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="emerald">Education & Tahfeez Directorate</Badge>
            <span className="text-xs text-stone-400 font-mono">Faculty Registry</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Madrasa Faculty & Mu'allims Registry
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm">
            Managing certified Quranic teachers, Sanad qualifications, student classroom allocations, and monthly council honoraria across Jimma Zone.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Register Mu'allim
        </Button>
      </div>

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-2 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Total Faculty
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 font-mono">
            {teachers.length}{' '}
            <span className="text-sm font-sans font-normal text-stone-500">mu'allims</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Active Instructors:</span>
            <span className="font-semibold text-emerald-600 font-mono">
              {teachers.filter((t) => t.status === 'Active').length}
            </span>
          </div>
        </Card>

        <Card className="space-y-2 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Sanad Certified
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-700 dark:text-amber-400 font-mono">
            {certifiedCount}{' '}
            <span className="text-sm font-sans font-normal text-stone-500">licensed</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Accreditation Rate:</span>
            <span className="font-semibold text-emerald-600 font-mono">100% Verified</span>
          </div>
        </Card>

        <Card className="space-y-2 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Students Assigned
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-blue-700 dark:text-blue-400 font-mono">
            {totalAssignedStudents}{' '}
            <span className="text-sm font-sans font-normal text-stone-500">students</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Avg Class Size:</span>
            <span className="font-semibold text-stone-700 dark:text-stone-300 font-mono">
              {Math.round(totalAssignedStudents / (teachers.length || 1))} / halaqah
            </span>
          </div>
        </Card>

        <Card className="space-y-2 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Monthly Council Stipends
            </span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-purple-700 dark:text-purple-400 font-mono">
            {totalMonthlyHonorarium.toLocaleString()}{' '}
            <span className="text-xs font-sans font-normal text-stone-500">ETB</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Disbursement Status:</span>
            <span className="font-semibold text-emerald-600">Funded via Waqf</span>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teacher, madrasa, sanad, specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Madrasa:</span>
          </div>
          <select
            value={selectedMadrasaFilter}
            onChange={(e) => setSelectedMadrasaFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300"
          >
            <option value="ALL">All Madrasas</option>
            {madrasas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Teachers Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 dark:border-stone-700">
              <tr>
                <th className="p-3.5">Mu'allim / Faculty</th>
                <th className="p-3.5">Assigned Madrasa</th>
                <th className="p-3.5">Specialization</th>
                <th className="p-3.5">Sanad / License</th>
                <th className="p-3.5 text-center">Experience</th>
                <th className="p-3.5 text-center">Students</th>
                <th className="p-3.5">Council Stipend</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Public Directory</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-stone-400">
                    No faculty members found matching your search or filters.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => {
                  const safeSalary = t.salaryETB ?? 8500;
                  const safeStudents = t.assignedStudentsCount ?? t.studentsCount ?? 25;
                  const safeSanad = t.sanad || t.qualification || 'Authentic Sanad';

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-colors"
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {t.avatar ? (
                            <img
                              src={t.avatar}
                              alt={t.name}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                              {t.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div
                              onClick={() => setSelectedTeacherForDetail(t)}
                              className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 hover:text-emerald-600 cursor-pointer"
                            >
                              {t.name}
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono flex items-center gap-2">
                              <span>{t.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-stone-800 dark:text-stone-200">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-stone-400" />
                          <span>{t.madrasaName}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <Badge variant="blue">{t.specialization}</Badge>
                      </td>
                      <td className="p-3.5 text-stone-600 dark:text-stone-400 max-w-xs truncate">
                        <span title={safeSanad}>{safeSanad}</span>
                      </td>
                      <td className="p-3.5 font-mono text-center text-stone-700 dark:text-stone-300">
                        {t.experienceYears} yrs
                      </td>
                      <td className="p-3.5 font-mono font-bold text-center text-emerald-700 dark:text-emerald-400">
                        {safeStudents}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-stone-900 dark:text-stone-100">
                        {safeSalary.toLocaleString()} ETB
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => toggleStatus(t)}
                          className="cursor-pointer"
                          title="Click to toggle status"
                        >
                          <Badge variant={t.status === 'Active' ? 'emerald' : 'gold'}>
                            {t.status}
                          </Badge>
                        </button>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => void updateTeacher(t.id, t.isPublished
                              ? { isPublished: false, isFeatured: false }
                              : { isPublished: true })}
                            className={`text-left text-[10px] font-semibold ${t.isPublished ? 'text-emerald-700' : 'text-stone-400'}`}
                          >
                            {t.isPublished ? 'Public' : 'Private'} · change
                          </button>
                          {t.isPublished && (
                            <button
                              type="button"
                              onClick={() => void updateTeacher(t.id, { isFeatured: !t.isFeatured })}
                              className={`text-left text-[10px] font-semibold ${t.isFeatured ? 'text-amber-700' : 'text-stone-400'}`}
                            >
                              {t.isFeatured ? 'Featured' : 'Not featured'} · change
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={() => setSelectedTeacherForDetail(t)}
                          >
                            Details
                          </Button>
                          <button
                            onClick={() => handleDelete(t.id, t.name)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Remove Teacher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Teacher Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Faculty Mu'allim"
        subtitle="Add accredited Quranic teacher with Sanad verification into the Jimma Zone central council."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Teacher Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ustadh Idris Mohammed Al-Jimmawi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +251 91 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Assigned Madrasa
              </label>
              <select
                value={madrasaId}
                onChange={(e) => setMadrasaId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              >
                {madrasas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="teacher@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800 sm:grid-cols-2">
            <label className="flex items-start gap-2 text-xs text-stone-700 dark:text-stone-200">
              <input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} className="mt-0.5 accent-emerald-700" />
              <span><strong>Show in public directory</strong><span className="mt-1 block text-[11px] text-stone-500">Visitors can see the teacher’s name, qualifications, specialization, and assigned madrasa.</span></span>
            </label>
            <label className="flex items-start gap-2 text-xs text-stone-700 dark:text-stone-200">
              <input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} disabled={!isPublished} className="mt-0.5 accent-amber-600" />
              <span><strong>Feature in directory</strong><span className="mt-1 block text-[11px] text-stone-500">Featured teachers appear first. This requires public visibility.</span></span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Teaching Specialization
              </label>
              <input
                type="text"
                placeholder="e.g. Full Quran Hifz & Tajweed"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Sanad License / Ijazah
              </label>
              <input
                type="text"
                placeholder="e.g. Hafs an Asim (Shatibiyyah)"
                value={sanad}
                onChange={(e) => setSanad(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Teaching Experience (Years)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Council Monthly Honorarium (ETB)
              </label>
              <input
                type="number"
                min="3000"
                step="500"
                value={salaryETB}
                onChange={(e) => setSalaryETB(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Mu'allim
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {selectedTeacherForDetail && (
        <Modal
          isOpen={Boolean(selectedTeacherForDetail)}
          onClose={() => setSelectedTeacherForDetail(null)}
          title="Mu'allim Profile & Sanad Credential"
          subtitle="Accreditation dossier recorded in the Jimma Zone Islamic Council Education Directorate."
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              {selectedTeacherForDetail.avatar ? (
                <img
                  src={selectedTeacherForDetail.avatar}
                  alt={selectedTeacherForDetail.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-600"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-lg">
                  {selectedTeacherForDetail.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                  {selectedTeacherForDetail.name}
                </h3>
                <p className="text-xs text-stone-500">{selectedTeacherForDetail.madrasaName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedTeacherForDetail.status === 'Active' ? 'emerald' : 'gold'}>
                    {selectedTeacherForDetail.status}
                  </Badge>
                  <Badge variant="blue">
                    {selectedTeacherForDetail.specialization}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
                <span className="text-stone-400 block mb-0.5">Sanad / Accreditation</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {selectedTeacherForDetail.sanad || selectedTeacherForDetail.qualification || 'Authentic Hafs Sanad'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
                <span className="text-stone-400 block mb-0.5">Assigned Students</span>
                <span className="font-semibold font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                  {selectedTeacherForDetail.assignedStudentsCount ?? selectedTeacherForDetail.studentsCount ?? 25} Students
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
                <span className="text-stone-400 block mb-0.5">Phone Contact</span>
                <span className="font-mono text-stone-800 dark:text-stone-200">
                  {selectedTeacherForDetail.phone}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
                <span className="text-stone-400 block mb-0.5">Monthly Honorarium</span>
                <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                  {(selectedTeacherForDetail.salaryETB ?? 8500).toLocaleString()} ETB
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Council Mu'allim</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Accredited under Jimma Zone Islamic Affairs High Council guidelines. Authorized to teach Quran memorization, Noorani Qaidah, and evaluate Ijazah candidates.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTeacherForDetail(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
