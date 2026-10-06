import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  Send,
  Smartphone,
  CheckCircle2,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface QuickSabaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

export const QuickSabaqModal: React.FC<QuickSabaqModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { dispatchMessage, addToast } = useApp();
  const [channel, setChannel] = useState<'sms' | 'telegram' | 'hybrid'>('sms');
  const [isSending, setIsSending] = useState(false);

  const parentName = student.parentName || student.guardianName || 'Guardian';
  const parentPhone = student.parentPhone || student.guardianPhone || '+251 91 190 2831';
  const sabaqText = student.hifzStatus?.sabaq || student.sabaqSurah || 'Surah Maryam: 1-40';
  const sabqiText = student.hifzStatus?.sabqi || (student.sabaqiJuz ? `Juz ${student.sabaqiJuz}` : 'Juz 18');
  const attendance = student.dailyAttendance || 'Present';

  const defaultMsg = `Jimma Islamic Council - ${student.madrasaName}\n\nAssalamu Alaykum ${parentName},\nDaily Hifz Report for ${student.name}:\n📖 Sabaq: ${sabaqText}\n🔄 Sabqi: ${sabqiText}\n✨ Tajweed: ${student.tajweedRating}\n📍 Attendance: ${attendance}\n\nJazakallahu Khayran.`;

  const [message, setMessage] = useState(defaultMsg);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    setTimeout(async () => {
      await dispatchMessage({
        title: `Daily Sabaq Alert: ${student.name}`,
        category: 'sabaq_alert',
        channel,
        senderId: 'HIFZ-ACADEMY',
        recipientTarget: `${parentName} (${parentPhone})`,
        recipientCount: 1,
        content: message,
        costETB: channel === 'telegram' ? 0 : 0.25,
        metadata: {
          studentId: student.id,
          studentName: student.name,
          parentPhone,
          madrasaName: student.madrasaName,
        },
      });
      setIsSending(false);
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Dispatch Sabaq Alert: ${student.name}`}
      subtitle={`Send direct SMS / Telegram progress notification to guardian ${parentName}.`}
    >
      <form onSubmit={handleSend} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3 bg-stone-50 dark:bg-stone-800/60 p-3 rounded-2xl border border-stone-200 dark:border-stone-700">
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Guardian Name</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">{parentName}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Guardian Phone</span>
            <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">{parentPhone}</span>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Transmission Channel
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'sms' as const, label: 'EthioTel SMS' },
              { id: 'telegram' as const, label: 'Telegram Bot' },
              { id: 'hybrid' as const, label: 'Dual Broadcast' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChannel(c.id)}
                className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all ${
                  channel === c.id
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Message Payload Text
          </label>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-xs"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSending}
            icon={isSending ? <Zap className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          >
            {isSending ? 'Sending SMS...' : 'Dispatch Alert Now'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
