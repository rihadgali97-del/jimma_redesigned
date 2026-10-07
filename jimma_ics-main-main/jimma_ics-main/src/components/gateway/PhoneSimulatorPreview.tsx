import React, { useState } from 'react';
import { MessageChannel } from '../../types';
import {
  Smartphone,
  Send,
  Check,
  CheckCheck,
  ShieldCheck,
  Phone,
  Video,
  Info,
  Clock,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface PhoneSimulatorPreviewProps {
  channel: MessageChannel;
  title: string;
  senderId: string;
  recipientTarget: string;
  content: string;
  category: string;
}

export const PhoneSimulatorPreview: React.FC<PhoneSimulatorPreviewProps> = ({
  channel,
  title,
  senderId,
  recipientTarget,
  content,
  category,
}) => {
  const [activeTab, setActiveTab] = useState<'sms' | 'telegram'>(
    channel === 'telegram' ? 'telegram' : 'sms'
  );
  const [copied, setCopied] = useState(false);

  // Sync tab if channel changes to single
  React.useEffect(() => {
    if (channel === 'telegram') setActiveTab('telegram');
    else if (channel === 'sms') setActiveTab('sms');
  }, [channel]);

  // Character calculation
  const charLength = content.length;
  const isUnicode = /[^\u0000-\u00ff]/.test(content); // contains non-latin (Arabic, Amharic, etc.)
  const limitPerSegment = isUnicode ? 70 : 160;
  const segmentCount = Math.max(1, Math.ceil(charLength / limitPerSegment));
  const estimatedCost = (segmentCount * 0.25).toFixed(2);
  const categoryLabel = category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-stone-900 text-stone-100 rounded-3xl p-5 border border-stone-800 shadow-xl flex flex-col justify-between">
      {/* Top Controls Bar */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
              {channel === 'telegram' ? 'Telegram Message Preview' : 'Message Preview'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {channel === 'hybrid' && (
              <div className="bg-stone-800 p-0.5 rounded-lg flex text-[10px] font-semibold border border-stone-700">
                <button
                  type="button"
                  onClick={() => setActiveTab('sms')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeTab === 'sms'
                      ? 'bg-emerald-700 text-white font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  SMS View
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('telegram')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeTab === 'telegram'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Telegram View
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition-colors"
              title="Copy Message Text"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Realistic Mobile Device Frame */}
        <div className="my-4 mx-auto max-w-[320px] bg-black rounded-[36px] p-3 border-4 border-stone-700 shadow-2xl relative">
          {/* Speaker Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full flex items-center justify-center gap-1.5 z-20">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-700" />
            <span className="w-10 h-1.5 bg-stone-800 rounded-full" />
          </div>

          {/* Screen Content */}
          <div className="bg-stone-950 rounded-[28px] overflow-hidden min-h-[380px] flex flex-col justify-between border border-stone-900">
            {/* Mobile Status Bar */}
            <div className="pt-2 px-4 flex items-center justify-between text-[9px] text-stone-400 font-mono">
              <span>{currentTime}</span>
              <div className="flex items-center gap-1 text-[8px]">
                <span>EthioTel 4G</span>
                <span>📶</span>
                <span>🔋 96%</span>
              </div>
            </div>

            {/* SCREEN VIEW: SMS MODE */}
            {activeTab === 'sms' && (
              <div className="flex-1 flex flex-col justify-between p-3">
                {/* SMS App Header */}
                <div className="text-center pb-2 border-b border-stone-800/80">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center font-bold text-xs border border-emerald-600 mb-1">
                    JI
                  </div>
                  <div className="text-[11px] font-bold text-white flex items-center justify-center gap-1">
                    <span>{senderId || 'JIMMA-ISLAM'}</span>
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-[9px] text-stone-500 font-mono">
                    Verified Shortcode (Ethio Telecom)
                  </span>
                </div>

                {/* SMS Message Bubble */}
                <div className="my-auto py-2 space-y-1">
                  <div className="text-center text-[9px] text-stone-500">
                    Today • {currentTime}
                  </div>
                  <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-2xl rounded-tl-xs p-3 text-emerald-100 text-xs shadow-md space-y-2 whitespace-pre-line leading-relaxed font-sans">
                    {content || 'Enter message payload to preview live output on device screen...'}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[9px] text-stone-400 px-1">
                    <span>Delivered via SMS Gateway</span>
                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>

                {/* SMS Mock Reply Input */}
                <div className="pt-2 border-t border-stone-800 flex items-center gap-2">
                  <div className="flex-1 bg-stone-900 rounded-full px-3 py-1.5 text-[10px] text-stone-500 border border-stone-800">
                    Text message (Read-only broadcast)
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN VIEW: TELEGRAM MODE */}
            {activeTab === 'telegram' && (
              <div className="flex-1 flex flex-col justify-between p-3 bg-[#0e1621]">
                {/* Telegram Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#17212b]">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#2481cc] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      JIC
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-white flex items-center gap-1 truncate">
                        <span>Jimma Supreme Council</span>
                        <ShieldCheck className="w-3 h-3 text-[#2481cc]" />
                      </div>
                      <span className="text-[9px] text-stone-400 block truncate">
                        24,850 subscribers • channel
                      </span>
                    </div>
                  </div>
                </div>

                {/* Telegram Post Bubble */}
                <div className="my-auto py-2 space-y-1">
                  <div className="bg-[#182533] border border-[#2b5278]/40 rounded-2xl rounded-tl-xs p-3 text-white text-xs shadow-md space-y-2 whitespace-pre-line leading-relaxed font-sans">
                    <div className="text-[10px] font-bold text-[#64b5f6] pb-1 border-b border-stone-800">
                      📢 {title || categoryLabel}
                    </div>
                    <div>{content || 'Enter message payload to preview live Telegram markdown formatting...'}</div>
                    {recipientTarget && (
                      <div className="border-t border-stone-800/60 pt-1 text-[9px] text-stone-400 break-words">
                        To: {recipientTarget}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 text-[9px] text-stone-400 border-t border-stone-800/60">
                      <span>24.8k views</span>
                      <div className="flex items-center gap-1">
                        <span>{currentTime}</span>
                        <CheckCheck className="w-3 h-3 text-[#2481cc]" />
                      </div>
                    </div>
                  </div>

                  {/* Inline interactive button simulation */}
                  <div className="space-y-1 pt-1">
                    <div className="w-full py-1.5 rounded-xl bg-[#2481cc]/20 border border-[#2481cc]/40 text-[#64b5f6] text-[10px] font-bold text-center flex items-center justify-center gap-1 hover:bg-[#2481cc]/30 transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      <span>Council Web Portal & Details</span>
                    </div>
                  </div>
                </div>

                {/* Telegram Mute Bar */}
                <div className="pt-2 text-center text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                  MUTE NOTIFICATIONS
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gateway Cost & Encoding Breakdown */}
      <div className="pt-3 border-t border-stone-800 space-y-1 text-xs">
        <div className="flex items-center justify-between text-stone-400">
          <span>Payload Length:</span>
          <span className="font-mono font-bold text-stone-200">
            {charLength} chars ({segmentCount} {segmentCount === 1 ? 'part' : 'parts'})
          </span>
        </div>
        <div className="flex items-center justify-between text-stone-400">
          <span>Encoding Standard:</span>
          <Badge variant={isUnicode ? 'amber' : 'emerald'} className="text-[10px]">
            {isUnicode ? 'Unicode (UCS-2 / 70 chars)' : 'GSM-7 Standard (160 chars)'}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-stone-400">
          <span>Carrier Cost Rate:</span>
          <span className="font-mono font-bold text-emerald-400">
            {activeTab === 'sms' ? `${estimatedCost} ETB / recipient` : '0.00 ETB (Free Bot API)'}
          </span>
        </div>
      </div>
    </div>
  );
};
