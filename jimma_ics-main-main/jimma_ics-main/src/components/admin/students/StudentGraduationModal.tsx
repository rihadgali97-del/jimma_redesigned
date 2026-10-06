import React, { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import { Student } from '../../../types';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';

interface StudentGraduationModalProps {
  isOpen: boolean;
  student: Student;
  onClose: () => void;
  onSave: (updates: Pick<Student, 'status' | 'graduationYear'>) => Promise<boolean>;
}

export const StudentGraduationModal: React.FC<StudentGraduationModalProps> = ({
  isOpen,
  student,
  onClose,
  onSave,
}) => {
  const [graduationYear, setGraduationYear] = useState(
    student.graduationYear || new Date().getFullYear()
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setGraduationYear(student.graduationYear || new Date().getFullYear());
  }, [student.id, student.graduationYear]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const saved = await onSave({ status: 'Graduated', graduationYear });
      if (saved) onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Student Graduation"
      subtitle={`Save the official graduation year for ${student.name}.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="student-graduation-year"
            className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
          >
            Graduation year
          </label>
          <input
            id="student-graduation-year"
            type="number"
            min="1900"
            max={new Date().getFullYear() + 10}
            required
            value={graduationYear}
            onChange={(event) => setGraduationYear(Number(event.target.value))}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
          />
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5">
            This marks the student as graduated and adds them to the graduation-year filter.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gold"
            type="submit"
            icon={<Award className="w-4 h-4" />}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Graduation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
