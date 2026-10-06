import React, { useState } from 'react';
import { Fund } from '../../types';

interface IncomeExpenseChartProps {
  className?: string;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ className = '' }) => {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // 12 months simulated financial trajectory for Jimma Islamic Council in ETB ('000)
  const data = [
    { month: 'Sep', income: 1150, expense: 880, donations: 620 },
    { month: 'Oct', income: 1320, expense: 910, donations: 780 },
    { month: 'Nov', income: 1480, expense: 1020, donations: 840 },
    { month: 'Dec', income: 1890, expense: 1250, donations: 1100 },
    { month: 'Jan', income: 1410, expense: 980, donations: 790 },
    { month: 'Feb', income: 1650, expense: 1120, donations: 950 },
    { month: 'Mar', income: 2950, expense: 1840, donations: 2100 }, // Ramadan spike
    { month: 'Apr', income: 3200, expense: 2100, donations: 2450 }, // Eid & Zakat ul-Fitr
    { month: 'May', income: 1750, expense: 1180, donations: 1020 },
    { month: 'Jun', income: 1980, expense: 1340, donations: 1200 },
    { month: 'Jul', income: 2150, expense: 1420, donations: 1380 },
    { month: 'Aug', income: 2420, expense: 1560, donations: 1650 },
  ];

  const maxVal = 3500;

  return (
    <div className={`w-full ${className}`}>
      {/* Legend & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-600 dark:bg-emerald-500" />
            <span className="font-medium text-stone-700 dark:text-stone-300">Total Revenue / Inflow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500 dark:bg-amber-400" />
            <span className="font-medium text-stone-700 dark:text-stone-300">Donations & Zakat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-500 dark:bg-rose-400" />
            <span className="font-medium text-stone-700 dark:text-stone-300">Operational Expenses</span>
          </div>
        </div>
        <span className="text-[11px] text-stone-400 font-mono">Values in Thousands ETB ('000)</span>
      </div>

      {/* SVG Bar / Area Chart */}
      <div className="relative h-64 w-full flex items-end justify-between gap-1.5 sm:gap-3 pt-6 border-b border-stone-200 dark:border-stone-800 pb-2">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
          <div className="border-b border-dashed border-stone-300 dark:border-stone-700 w-full" />
          <div className="border-b border-dashed border-stone-300 dark:border-stone-700 w-full" />
          <div className="border-b border-dashed border-stone-300 dark:border-stone-700 w-full" />
          <div className="border-b border-dashed border-stone-300 dark:border-stone-700 w-full" />
        </div>

        {data.map((item, idx) => {
          const incomeHeight = (item.income / maxVal) * 100;
          const expenseHeight = (item.expense / maxVal) * 100;
          const donHeight = (item.donations / maxVal) * 100;
          const isHovered = hoveredMonth === idx;

          return (
            <div
              key={item.month}
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              onMouseEnter={() => setHoveredMonth(idx)}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full mb-3 z-30 bg-stone-900 text-stone-100 p-2.5 rounded-xl shadow-xl border border-stone-700 text-xs w-44 pointer-events-none animate-in fade-in zoom-in-95">
                  <div className="font-bold text-amber-400 border-b border-stone-800 pb-1 mb-1.5">
                    {item.month} 2026 Summary
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-emerald-400">Inflow:</span>
                      <span className="font-mono font-bold">{item.income.toLocaleString()}k ETB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-400">Donations:</span>
                      <span className="font-mono font-bold">{item.donations.toLocaleString()}k ETB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rose-400">Expenses:</span>
                      <span className="font-mono font-bold">{item.expense.toLocaleString()}k ETB</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-stone-800 text-stone-300 font-semibold">
                      <span>Net Surplus:</span>
                      <span className="font-mono text-emerald-300">
                        +{(item.income - item.expense).toLocaleString()}k ETB
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Grouped Bars */}
              <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                {/* Income */}
                <div
                  className="w-1/3 max-w-[12px] bg-emerald-600 dark:bg-emerald-500 rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                  style={{ height: `${incomeHeight}%` }}
                />
                {/* Donations */}
                <div
                  className="w-1/3 max-w-[12px] bg-amber-500 dark:bg-amber-400 rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                  style={{ height: `${donHeight}%` }}
                />
                {/* Expense */}
                <div
                  className="w-1/3 max-w-[12px] bg-rose-500 dark:bg-rose-400 rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                  style={{ height: `${expenseHeight}%` }}
                />
              </div>

              {/* Month Label */}
              <span
                className={`text-[11px] mt-2 transition-colors ${
                  isHovered
                    ? 'font-bold text-emerald-700 dark:text-emerald-400'
                    : 'text-stone-500 dark:text-stone-400'
                }`}
              >
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const FundDistributionCard: React.FC<{ funds: Fund[]; className?: string }> = ({
  funds,
  className = '',
}) => {
  const totalAllocated = funds.reduce((acc, f) => acc + f.allocatedETB, 0);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
        <span>Active Funds: {funds.length}</span>
        <span>Total Allocation: ETB {(totalAllocated / 1000000).toFixed(1)}M</span>
      </div>

      <div className="space-y-3.5">
        {funds.map((fund) => {
          const percent = Math.min(100, Math.round((fund.allocatedETB / fund.targetETB) * 100));
          return (
            <div key={fund.id} className="space-y-1.5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[200px]">
                  {fund.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-stone-900 dark:text-stone-100 font-medium">
                    ETB {(fund.allocatedETB / 1000000).toFixed(2)}M
                  </span>
                  <span className="text-[10px] text-stone-400">({percent}%)</span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: fund.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
