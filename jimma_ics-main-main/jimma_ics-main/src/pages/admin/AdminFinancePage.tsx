import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, Wallet } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const sampleTransactions = [
  {
    reference: 'SAMPLE-001',
    date: '2026-09-18',
    type: 'Income' as const,
    fund: 'Community Support Fund',
    description: 'Example: monthly contribution from a local business',
    method: 'Bank transfer',
    amount: 185000,
  },
  {
    reference: 'SAMPLE-002',
    date: '2026-09-16',
    type: 'Expense' as const,
    fund: 'Education Support Fund',
    description: 'Example: teaching materials for a community school',
    method: 'Bank transfer',
    amount: 96000,
  },
  {
    reference: 'SAMPLE-003',
    date: '2026-09-12',
    type: 'Income' as const,
    fund: 'Mosque Maintenance Fund',
    description: 'Example: community contribution for facility repairs',
    method: 'Cash receipt',
    amount: 50000,
  },
];

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

      <Card className="space-y-4 p-0">
        <div className="flex flex-col gap-3 border-b border-stone-100 p-5 dark:border-stone-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Example transaction preview
              </h2>
              <Badge variant="gold">Demo only</Badge>
            </div>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              These three sample rows show how a company-facing ledger could look. They are illustrative only—not real financial records, and they do not affect balances, reports, or saved data.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="border-b border-stone-200 text-[10px] uppercase tracking-wide text-stone-500 dark:border-stone-700">
              <tr>
                <th className="px-3 py-3">Reference</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Fund</th>
                <th className="px-3 py-3">Description</th>
                <th className="px-3 py-3">Method</th>
                <th className="px-3 py-3 text-right">Amount (ETB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {sampleTransactions.map((transaction) => (
                <tr key={transaction.reference} className="text-stone-700 dark:text-stone-300">
                  <td className="whitespace-nowrap px-3 py-4 font-mono text-stone-500">{transaction.reference}</td>
                  <td className="whitespace-nowrap px-3 py-4">{transaction.date}</td>
                  <td className="px-3 py-4">
                    <Badge variant={transaction.type === 'Income' ? 'emerald' : 'rose'}>
                      {transaction.type}
                    </Badge>
                  </td>
                  <td className="px-3 py-4 font-medium">{transaction.fund}</td>
                  <td className="max-w-xs px-3 py-4">{transaction.description}</td>
                  <td className="px-3 py-4">{transaction.method}</td>
                  <td className={`whitespace-nowrap px-3 py-4 text-right font-mono font-semibold ${transaction.type === 'Income' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                    {transaction.type === 'Income' ? '+' : '-'}{transaction.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 sm:flex-row sm:items-center sm:justify-between">
        <span>General-ledger transactions are not yet stored by the backend. Actual donation and Zakat records are available separately.</span>
        <Button
          variant="outline"
          size="sm"
          icon={<HeartHandshake className="h-4 w-4" />}
          onClick={() => navigate('/admin/finance/donations')}
        >
          View saved Donations & Zakat records
        </Button>
      </div>
    </div>
  );
};
