import React, { useEffect, useState } from 'react';
import type { Student } from '../../types';
import { useApp } from '../../context/AppContext';
import { FileText, Copy } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface QuickSabaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

function buildSabaqTemplate(student: Student) {
  const parentName = student.parentName || student.guardianName || '[guardian name not recorded]';
  const sabaq = student.hifzStatus?.sabaq || student.sabaqSurah || '[sabaq lesson not recorded]';
  const sabqi = student.hifzStatus?.sabqi || (student.sabaqiJuz ? `Juz ${student.sabaqiJuz}` : '[sabqi progress not recorded]');
  const manzil = student.hifzStatus?.manzil || student.manzilJuz || '[manzil progress not recorded]';
  const tajweed = student.tajweedRating || '[tajweed rating not recorded]';
  const attendance = student.dailyAttendance || '[attendance status not recorded]';

  return `Jimma Islamic Council - ${student.madrasaName}\n\nAssalamu Alaykum ${parentName},\nDaily Hifz Report for ${student.name}:\nSabaq: ${sabaq}\nSabqi: ${sabqi}\nManzil: ${manzil}\nTajweed: ${tajweed}\nAttendance: ${attendance}\n\nJazakallahu Khayran.`;
}

export const QuickSabaqModal: React.FC<QuickSabaqModalProps> = ({ isOpen, onClose, student }) => {
  const { addToast } = useApp();
  const [message, setMessage] = useState(() => buildSabaqTemplate(student));

  useEffect(() => {
    setMessage(buildSabaqTemplate(student));
  }, [student]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      addToast('Template copied', 'The private guardian message was copied. It has not been sent.', 'success');
    } catch (error) {
      addToast(
        'Could not copy template',
        error instanceof Error ? error.message : 'Clipboard access was unavailable.',
        'error'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Guardian Sabaq message template"
      subtitle="Edit or copy this private message. SMS is disabled, and student information cannot be posted to the public Telegram channel."
    >
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <FileText className="mt-0.5 h-4 w-4 shrink-0" />
          <p>This is a draft template only. No message is sent from this screen.</p>
        </div>
        <label className="block font-semibold text-stone-700 dark:text-stone-300">
          Message text
          <textarea
            rows={8}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 font-mono text-xs dark:border-stone-700 dark:bg-stone-800"
          />
        </label>
        <div className="flex items-center justify-between border-t border-stone-100 pt-3 dark:border-stone-800">
          <span className="text-stone-500">SMS unavailable</span>
          <div className="flex gap-2">
            <Button variant="ghost" type="button" onClick={onClose}>Close</Button>
            <Button variant="outline" type="button" icon={<Copy className="h-3.5 w-3.5" />} onClick={() => void handleCopy()}>
              Copy template
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
