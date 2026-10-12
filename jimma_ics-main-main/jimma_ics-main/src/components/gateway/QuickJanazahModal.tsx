import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Send,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Building,
  Zap,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { sendTelegramGatewayMessage } from '../../services/notificationsApi';

interface QuickJanazahModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMosqueName?: string;
  defaultDistrict?: string;
}

export const QuickJanazahModal: React.FC<QuickJanazahModalProps> = ({
  isOpen,
  onClose,
  defaultMosqueName = 'Grand Anwar Mosque (Hermata)',
  defaultDistrict = 'Hermata, Jimma City',
}) => {
  const { addToast } = useApp();
  const [deceasedName, setDeceasedName] = useState('');
  const [deceasedAge, setDeceasedAge] = useState('');
  const [janazahTime, setJanazahTime] = useState('');
  const [mosqueName, setMosqueName] = useState(defaultMosqueName);
  const [cemeteryName, setCemeteryName] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deceasedName.trim() || !janazahTime.trim() || !mosqueName.trim() || !cemeteryName.trim()) {
      addToast('Complete announcement details', 'Enter the deceased name, prayer time, mosque, and burial location before posting.', 'warning');
      return;
    }
    if (!window.confirm('This message will be posted publicly to the configured Telegram channel. Continue?')) return;

    setIsSending(true);
    try {
      const content = `JANAZAH PRAYER ANNOUNCEMENT - JIMMA CITY\n\nInna lillahi wa inna ilayhi raji'un\n\nJanazah prayer for the late ${deceasedName}${deceasedAge ? ` (${deceasedAge} years old)` : ''} (${defaultDistrict}) will take place:\nTime: ${janazahTime}\nMosque: ${mosqueName}\nBurial: ${cemeteryName}\n\nMay Allah grant them Jannatul Firdaws. All are requested to attend.`;
      const result = await sendTelegramGatewayMessage(
        `Emergency Janazah: ${deceasedName}`,
        content,
        'janazah_broadcast'
      );
      addToast('Telegram announcement sent', `Telegram accepted the post for ${result.channelId}.`, 'success');
      onClose();
    } catch (error) {
      addToast(
        'Telegram announcement failed',
        error instanceof Error ? error.message : 'The Telegram post could not be sent.',
        'error'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Prepare a Janazah Telegram announcement"
      subtitle="This message will be posted publicly to the configured Telegram channel. SMS delivery is disabled."
    >
      <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Deceased Full Name *
            </label>
            <input
              type="text"
              required
              value={deceasedName}
              onChange={(e) => setDeceasedName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Age (Years)
            </label>
            <input
              type="text"
              value={deceasedAge}
              onChange={(e) => setDeceasedAge(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Janazah Prayer Time *
            </label>
            <input
              type="text"
              required
              value={janazahTime}
              onChange={(e) => setJanazahTime(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-semibold text-rose-700 dark:text-rose-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Prayer Mosque Location *
            </label>
            <input
              type="text"
              required
              value={mosqueName}
              onChange={(e) => setMosqueName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Burial Cemetery (Qabroofata) *
            </label>
            <input
              type="text"
              required
              value={cemeteryName}
              onChange={(e) => setCemeteryName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
            />
          </div>

        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-stone-700 dark:text-stone-300 flex items-center justify-between">
          <div>
            <span className="font-bold text-amber-900 dark:text-amber-200 block">Public Telegram post</span>
            <span className="text-[11px] text-stone-500">No subscriber estimate is available from the configured API.</span>
          </div>
          <Badge variant="amber">SMS disabled</Badge>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSending}
            icon={isSending ? <Radio className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          >
            {isSending ? 'Posting to Telegram…' : 'Post public announcement'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
