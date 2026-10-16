import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, Wallet } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const AdminFinancePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            <Wallet className="h-4 w-4" />
            <span>Financial Control Center</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Treasury & General Ledger
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 sm:text-sm">
            Review persisted financial records and reports.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<HeartHandshake className="h-4 w-4 text-emerald-600" />}
          onClick={() => navigate('/admin/finance/donations')}
        >
          Donations & Zakat Logs
        </Button>
      </header>

      <Card className="space-y-3 border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20">
        <h2 className="font-semibold text-stone-900 dark:text-stone-100">
          General-ledger data is not available
        </h2>
        <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
          The backend does not currently store treasury transactions, balances, or expense approvals. No example
          financial records are shown. Persisted donation requests and Zakat disbursements remain available in their
          dedicated register.
        </p>
        <Button
          variant="outline"
          size="sm"
          icon={<HeartHandshake className="h-4 w-4" />}
          onClick={() => navigate('/admin/finance/donations')}
        >
          View saved Donations & Zakat records
        </Button>
      </Card>
    </div>
  );
};
