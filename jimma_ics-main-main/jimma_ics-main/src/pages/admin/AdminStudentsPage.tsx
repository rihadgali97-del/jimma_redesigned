import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, GraduationCap, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { Button } from '../../components/ui/Button';
import { CourseCertificateModal } from '../../components/certificates/CourseCertificateModal';
import { StudentEnrollmentModal } from '../../components/admin/students/StudentEnrollmentModal';
import { StudentRegistryFilters } from '../../components/admin/students/StudentRegistryFilters';
import { StudentRegistryTable } from '../../components/admin/students/StudentRegistryTable';

const STUDENT_LEVELS = [
  'All',
  'Nazira (Recitation)',
  'Intermediate Tahfeez',
  'Full Hifz Revision (Khatm)',
];
const PAGE_SIZE = 10;

export const AdminStudentsPage: React.FC = () => {
  const { students, madrasas, addStudent } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMadrasa, setSelectedMadrasa] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedGraduationYear, setSelectedGraduationYear] = useState('All');
  const [selectedJuz, setSelectedJuz] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [certificateStudent, setCertificateStudent] = useState<Student | null>(null);

  const madrasaOptions = useMemo(
    () => ['All', ...Array.from(new Set(students.map((student) => student.madrasaName)))],
    [students]
  );
  const graduationYears = useMemo(
    () => Array.from(
      new Set(
        students
          .filter((student) => student.status === 'Graduated' && student.graduationYear)
          .map((student) => String(student.graduationYear))
      )
    ).sort((left, right) => Number(right) - Number(left)),
    [students]
  );
  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(term) ||
        (student.guardianName || student.parentName).toLowerCase().includes(term) ||
        student.madrasaName.toLowerCase().includes(term);
      const matchesMadrasa =
        selectedMadrasa === 'All' || student.madrasaName === selectedMadrasa;
      const matchesLevel =
        selectedLevel === 'All' ||
        (student.level || student.className) === selectedLevel;
      const matchesGraduationYear =
        selectedGraduationYear === 'All' ||
        (student.status === 'Graduated' && String(student.graduationYear) === selectedGraduationYear);
      const matchesJuz = selectedJuz === 'All' || String(student.currentJuz) === selectedJuz;
      const matchesGender = selectedGender === 'All' || student.gender === selectedGender;

      return matchesSearch && matchesMadrasa && matchesLevel &&
        matchesGraduationYear && matchesJuz && matchesGender;
    });
  }, [
    students,
    searchTerm,
    selectedMadrasa,
    selectedLevel,
    selectedGraduationYear,
    selectedJuz,
    selectedGender,
  ]);
  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const firstStudent = filteredStudents.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastStudent = Math.min(currentPage * PAGE_SIZE, filteredStudents.length);

  const handleEnrollStudent = async (student: Omit<Student, 'id'>) => {
    const savedStudent = await addStudent(student);
    if (savedStudent) setPage(1);
    return savedStudent;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Islamic Education Board • Quranic Hifz Desk</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Tahfeez Students & Hifz Progress Portal
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm">
            Live monitoring of daily Sabaq, Sabaqi, Manzil, and 30-Juz completion status across Jimma Zone.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Enroll New Student
        </Button>
      </div>

      <StudentRegistryFilters
        searchTerm={searchTerm}
        selectedMadrasa={selectedMadrasa}
        selectedLevel={selectedLevel}
        selectedGraduationYear={selectedGraduationYear}
        selectedJuz={selectedJuz}
        selectedGender={selectedGender}
        madrasas={madrasaOptions}
        levels={STUDENT_LEVELS}
        graduationYears={graduationYears}
        isAdvancedSearchOpen={isAdvancedSearchOpen}
        onToggleAdvancedSearch={() => setIsAdvancedSearchOpen((open) => !open)}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setPage(1);
        }}
        onMadrasaChange={(value) => {
          setSelectedMadrasa(value);
          setPage(1);
        }}
        onLevelChange={(value) => {
          setSelectedLevel(value);
          setPage(1);
        }}
        onGraduationYearChange={(value) => {
          setSelectedGraduationYear(value);
          setPage(1);
        }}
        onJuzChange={(value) => {
          setSelectedJuz(value);
          setPage(1);
        }}
        onGenderChange={(value) => {
          setSelectedGender(value);
          setPage(1);
        }}
      />

      <StudentRegistryTable
        students={paginatedStudents}
        onOpenCertificate={setCertificateStudent}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <p className="text-xs text-stone-500 dark:text-stone-400" aria-live="polite">
          Showing {firstStudent}–{lastStudent} of {filteredStudents.length} students
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<ChevronLeft className="w-4 h-4" />}
            onClick={() => setPage((current) => Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            Previous
          </Button>
          <span className="min-w-[5rem] text-center text-xs font-medium text-stone-600 dark:text-stone-300">
            Page {currentPage} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            icon={<ChevronRight className="w-4 h-4" />}
            iconPosition="right"
            onClick={() => setPage((current) => Math.min(pageCount, currentPage + 1))}
            disabled={currentPage >= pageCount}
            aria-label="Next page"
          >
            Next
          </Button>
        </div>
      </div>

      <StudentEnrollmentModal
        isOpen={isAddModalOpen}
        madrasas={madrasas}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleEnrollStudent}
      />

      {certificateStudent && (
        <CourseCertificateModal
          isOpen={!!certificateStudent}
          onClose={() => setCertificateStudent(null)}
          student={certificateStudent}
        />
      )}
    </div>
  );
};
