import React, { useState } from 'react';
import { Madrasa, Student } from '../../../types';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';

interface StudentEnrollmentModalProps {
  isOpen: boolean;
  madrasas: Madrasa[];
  onClose: () => void;
  onSubmit: (student: Omit<Student, 'id'>) => Promise<Student | null>;
}

const inputClassName =
  'w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden';

export const StudentEnrollmentModal: React.FC<StudentEnrollmentModalProps> = ({
  isOpen,
  madrasas,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('');
  const [madrasaId, setMadrasaId] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [currentJuz, setCurrentJuz] = useState(1);
  const [quranJuzCompleted, setQuranJuzCompleted] = useState(0);
  const [level, setLevel] = useState('');
  const [tajweedRating, setTajweedRating] = useState<Student['tajweedRating'] | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setAge('');
    setGender('');
    setMadrasaId('');
    setGuardianName('');
    setGuardianPhone('');
    setCurrentJuz(1);
    setQuranJuzCompleted(0);
    setLevel('');
    setTajweedRating('');
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const selectedMadrasa = madrasas.find((madrasa) => madrasa.id === madrasaId);
    if (!selectedMadrasa || age === '' || gender === '' || level === '' || tajweedRating === '') {
      return;
    }

    const normalizedGuardianName = guardianName.trim();
    const normalizedGuardianPhone = guardianPhone.trim();

    setIsSubmitting(true);
    try {
      const savedStudent = await onSubmit({
        name: name.trim(),
        age: Number(age),
        gender,
        madrasaId: selectedMadrasa.id,
        madrasaName: selectedMadrasa.name,
        className: level,
        teacherId: '',
        teacherName: 'Not assigned',
        enrollmentDate: new Date().toISOString().split('T')[0],
        attendanceRate: 0,
        currentJuz,
        currentJuzProgress: 0,
        quranJuzCompleted,
        hifzStatus: {
          sabaq: '',
          sabqi: '',
          manzil: '',
        },
        tajweedRating,
        examScoreAvg: 0,
        parentName: normalizedGuardianName,
        parentPhone: normalizedGuardianPhone,
        guardianName: normalizedGuardianName,
        guardianPhone: normalizedGuardianPhone,
        level,
        status: 'Active',
      });

      if (savedStudent) {
        resetForm();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Enroll Tahfeez Student in Central Registry"
      subtitle="Register standard student file with daily Sabaq and 30-Juz progress ledger."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Student Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Zakariya Mustefa Kemal"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClassName}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Age *
            </label>
            <input
              type="number"
              min="5"
              max="30"
              required
              value={age}
              onChange={(event) => setAge(event.target.value === '' ? '' : Number(event.target.value))}
              className={`${inputClassName} font-mono`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Gender *
            </label>
            <select
              required
              value={gender}
              onChange={(event) => setGender(event.target.value as 'Male' | 'Female' | '')}
              className={inputClassName}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Madrasa *
            </label>
            <select
              value={madrasaId}
              required
              onChange={(event) => setMadrasaId(event.target.value)}
              className={inputClassName}
            >
              <option value="">Select a madrasa</option>
              {madrasas.map((madrasa) => (
                <option key={madrasa.id} value={madrasa.id}>
                  {madrasa.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Guardian Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hajji Mustefa Kemal"
              value={guardianName}
              onChange={(event) => setGuardianName(event.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Guardian Phone *
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. +251 91 765 4321"
              value={guardianPhone}
              onChange={(event) => setGuardianPhone(event.target.value)}
              className={`${inputClassName} font-mono`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Completed Juz (0 - 30)
            </label>
            <input
              type="number"
              min="0"
              max="30"
              value={quranJuzCompleted}
              onChange={(event) => setQuranJuzCompleted(Number(event.target.value))}
              className={`${inputClassName} font-mono`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Currently Memorizing Juz
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={currentJuz}
              onChange={(event) => setCurrentJuz(Number(event.target.value))}
              className={`${inputClassName} font-mono`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Tajweed Proficiency
            </label>
            <select
              required
              value={tajweedRating}
              onChange={(event) => setTajweedRating(event.target.value as Student['tajweedRating'] | '')}
              className={inputClassName}
            >
              <option value="">Select rating</option>
              <option value="Excellent">Excellent</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
              <option value="Needs Revision">Needs Revision</option>
              <option value="Needs Practice">Needs Practice</option>
            </select>
          </div>
        </div>

        <div className="pt-1">
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Hifz Level
          </label>
          <select
            required
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            className={inputClassName}
          >
            <option value="Nazira (Recitation)">Nazira (Recitation)</option>
            <option value="Intermediate Tahfeez">Intermediate Tahfeez</option>
            <option value="Full Hifz Revision (Khatm)">Full Hifz Revision (Khatm)</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={madrasas.length === 0 || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Enroll Student'}
          </Button>
        </div>
        {madrasas.length === 0 && (
          <p className="text-xs text-rose-600 dark:text-rose-400">
            Add a madrasa before enrolling a student.
          </p>
        )}
      </form>
    </Modal>
  );
};
