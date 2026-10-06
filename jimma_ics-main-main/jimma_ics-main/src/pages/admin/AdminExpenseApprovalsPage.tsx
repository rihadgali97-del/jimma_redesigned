import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCheck2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const AdminExpenseApprovalsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <header>
        <div className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
          <FileCheck2 className="h-4 w-4" />
          <span>Finance & Endowment</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
          Expense Approvals
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 sm:text-sm">
          Review and approve submitted expense requests.
        </p>
      </header>

      <Card className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="rounded-2xl bg-amber-50 p-4 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
          <FileCheck2 className="h-8 w-8" />
        </div>
        <div className="max-w-xl space-y-2">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Expense approval records are not connected
          </h2>
          <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            The approval queue and approval actions are not currently backed by saved server records. Demo requests are intentionally not shown here, and actions cannot be recorded as approved until a persistent approval service is available.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate('/admin/finance')}
        >
          Back to Financial Control Center
        </Button>
      </Card>
    </div>
  );
};
