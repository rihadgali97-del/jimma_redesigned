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
  const { dispatchMessage, gatewayStats, addToast } = useApp();
  const [deceasedName, setDeceasedName] = useState('Haji Oumer Kedir Ababor');
  const [deceasedAge, setDeceasedAge] = useState('84');
  const [janazahTime, setJanazahTime] = useState('Today after Salatul Asr (4:15 PM)');
  const [mosqueName, setMosqueName] = useState(defaultMosqueName);
  const [cemeteryName, setCemeteryName] = useState('Hermata Muslim Public Cemetery');
  const [familyContact, setFamilyContact] = useState('+251 91 190 4421');
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const messageContent = `🚨 JANAZAH PRAYER ANNOUNCEMENT - JIMMA ZONE\n\n'Inna lillahi wa inna ilayhi raji'un'\n\nJanazah prayer for the late ${deceasedName} (${deceasedAge} yrs, ${defaultDistrict}) will take place:\n⏰ Time: ${janazahTime}\n🕌 Location: ${mosqueName}\n🪦 Burial: ${cemeteryName}\n📞 Family Contact: ${familyContact}\n\nMay Allah grant them Jannatul Firdaws. All are requested to attend.`;

    setTimeout(async () => {
      await dispatchMessage({
        title: `Emergency Janazah: ${deceasedName}`,
        category: 'janazah_broadcast',
        channel: 'hybrid',
        senderId: 'JIMMA-ISLAM',
        recipientTarget: `Zonal Emergency Janazah Broadcast List & Telegram Channel (${gatewayStats.telegramSubscribers.toLocaleString()} reach)`,
        recipientCount: gatewayStats.telegramSubscribers + 5400,
        content: messageContent,
        costETB: 350.0,
        metadata: {
          woreda: defaultDistrict,
          mosqueName,
          deceasedName,
          janazahTime,
          cemetery: cemeteryName,
        },
      });
      setIsSending(false);
      onClose();
    }, 700);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🚨 Broadcast Emergency Janazah Notification"
      subtitle="Dispatches urgent SMS and Telegram channel broadcast to thousands of community members across Jimma Zone."
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

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Family Contact Phone
            </label>
            <input
              type="text"
              value={familyContact}
              onChange={(e) => setFamilyContact(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono"
            />
          </div>
        </div>

        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 text-stone-700 dark:text-stone-300 flex items-center justify-between">
          <div>
            <span className="font-bold text-rose-900 dark:text-rose-200 block">Zonal Reach Estimate</span>
            <span className="text-[11px] text-stone-500">
              ~{(gatewayStats.telegramSubscribers + 5400).toLocaleString()} Verified Community Subscribers
            </span>
          </div>
          <Badge variant="amber">Dual SMS + Telegram Blast</Badge>
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
            {isSending ? 'Blasting Janazah Alert...' : 'Broadcast to Entire Zone'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
