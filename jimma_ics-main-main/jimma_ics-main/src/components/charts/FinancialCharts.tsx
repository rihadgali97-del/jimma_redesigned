import React from 'react';
import { Fund } from '../../types';

export const FundDistributionCard: React.FC<{ funds: Fund[]; className?: string }> = ({
  funds,
  className = '',
}) => {
  if (funds.length === 0) {
    return (
      <p className={`rounded-xl bg-stone-50 p-4 text-sm text-stone-500 dark:bg-stone-800 ${className}`}>
        Fund balances are unavailable because fund records are not connected to the backend.
      </p>
    );
  }

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
