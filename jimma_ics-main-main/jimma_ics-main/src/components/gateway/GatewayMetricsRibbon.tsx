import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Send,
  Radio,
  CheckCircle2,
  Zap,
  PlusCircle,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

export const GatewayMetricsRibbon: React.FC = () => {
  const { gatewayStats, topUpSmsBalance } = useApp();
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [refillAmount, setRefillAmount] = useState(500);
  const [refillMethod, setRefillMethod] = useState<'Telebirr' | 'CBE Birr'>('Telebirr');

  const handleRefill = (e: React.FormEvent) => {
    e.preventDefault();
    topUpSmsBalance(refillAmount);
    setIsRefillModalOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ethio Telecom SMS Gateway Status */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Ethio Telecom SMS
                </span>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  {gatewayStats.ethioShortCode}
                </span>
              </div>
            </div>
            <Badge variant="emerald" className="text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
              Online
            </Badge>
          </div>

          <div className="mt-4 flex items-baseline justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
            <div>
              <span className="text-xs text-stone-500 block">Credit Balance</span>
              <span className="text-xl font-bold font-mono text-emerald-900 dark:text-emerald-300">
                {gatewayStats.smsBalanceETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
              </span>
            </div>
            <Button
              variant="outline"
              size="xs"
              icon={<PlusCircle className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={() => setIsRefillModalOpen(true)}
            >
              Refill
            </Button>
          </div>
        </div>

        {/* Telegram Broadcast Channel */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Council Telegram Bot
                </span>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  {gatewayStats.telegramBotUsername}
                </span>
              </div>
            </div>
            <Badge variant="blue" className="text-[10px]">
              Verified
            </Badge>
          </div>

          <div className="mt-4 flex items-baseline justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
            <div>
              <span className="text-xs text-stone-500 block">Community Subscribers</span>
              <span className="text-xl font-bold font-mono text-blue-900 dark:text-blue-300">
                {gatewayStats.telegramSubscribers.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-stone-400 font-mono">18 Woredas</span>
          </div>
        </div>

        {/* Dispatch Delivery Rate */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Carrier Delivery Rate
                </span>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  SMS / Bot Combined
                </span>
              </div>
            </div>
            <Badge variant="gold" className="text-[10px]">
              99.4% SLA
            </Badge>
          </div>

          <div className="mt-4 flex items-baseline justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
            <div>
              <span className="text-xs text-stone-500 block">Total Messages Dispatched</span>
              <span className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100">
                {(gatewayStats.smsTotalSent + gatewayStats.telegramMessagesSent).toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">Zero Dropped</span>
          </div>
        </div>

        {/* Zonal Coverage Scope */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Zonal Broadcast Radius
                </span>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  All 18 Districts
                </span>
              </div>
            </div>
            <span className="text-[10px] text-purple-700 dark:text-purple-400 font-mono font-bold">
              42ms Latency
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
            <div>
              <span className="text-xs text-stone-500 block">Verified Endpoints</span>
              <span className="text-xl font-bold font-mono text-purple-900 dark:text-purple-300">
                142 Mosques
              </span>
            </div>
            <span className="text-[10px] text-stone-400">50+ Madrasas</span>
          </div>
        </div>
      </div>

      {/* Refill SMS Balance Modal */}
      <Modal
        isOpen={isRefillModalOpen}
        onClose={() => setIsRefillModalOpen(false)}
        title="Top-Up Ethio Telecom SMS Gateway Balance"
        subtitle="Purchase bulk SMS units for automated student Sabaq alerts and community broadcasts."
      >
        <form onSubmit={handleRefill} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Select Top-Up Amount (ETB)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[200, 500, 1000, 2500, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setRefillAmount(amt)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    refillAmount === amt
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                      : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs'
                  }`}
                >
                  <span className="block font-mono font-bold text-sm">{amt} ETB</span>
                  <span className="text-[10px] text-stone-500">{(amt / 0.25).toLocaleString()} SMS</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Payment Gateway Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['Telebirr', 'CBE Birr'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setRefillMethod(method)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                    refillMethod === method
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <span>{method} Merchant</span>
                  {refillMethod === method && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 space-y-1">
            <div className="flex justify-between">
              <span>Standard Tariff:</span>
              <span className="font-mono font-bold">0.25 ETB / 160 GSM chars</span>
            </div>
            <div className="flex justify-between">
              <span>Shortcode ID:</span>
              <span className="font-mono font-bold">JIMMA-ISLAM (Ethio Telecom)</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <Button variant="ghost" type="button" onClick={() => setIsRefillModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={<Zap className="w-4 h-4" />}>
              Confirm Refill ({refillAmount} ETB)
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
