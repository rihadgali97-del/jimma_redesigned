import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Donation } from '../../types';
import { Card } from '../ui/Card';

interface DonationInflowTrendsChartProps {
  donations: (Donation & { createdAt?: string })[];
  className?: string;
}

interface MonthlyInflow {
  key: string;
  month: string;
  zakat: number;
  sadaqahWaqf: number;
  other: number;
  count: number;
}

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const DonationInflowTrendsChart: React.FC<DonationInflowTrendsChartProps> = ({
  donations,
  className = '',
}) => {
  const monthlyData = useMemo(() => {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const months: MonthlyInflow[] = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(currentMonth);
      date.setMonth(currentMonth.getMonth() - (11 - index));
      return {
        key: getMonthKey(date),
        month: new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date),
        zakat: 0,
        sadaqahWaqf: 0,
        other: 0,
        count: 0,
      };
    });
    const byMonth = new Map(months.map((month) => [month.key, month]));

    donations.forEach((donation) => {
      const date = new Date(donation.createdAt || donation.date);
      if (Number.isNaN(date.getTime())) return;
      const month = byMonth.get(getMonthKey(date));
      if (!month) return;

      const category = `${donation.categoryType || ''} ${donation.fundName}`.toLowerCase();
      if (/zakat|ushr/.test(category)) {
        month.zakat += donation.amountETB;
      } else if (/sadaqah|waqf/.test(category)) {
        month.sadaqahWaqf += donation.amountETB;
      } else {
        month.other += donation.amountETB;
      }
      month.count += 1;
    });

    return months;
  }, [donations]);

  const recordCount = monthlyData.reduce((total, month) => total + month.count, 0);
  const totalInflow = monthlyData.reduce(
    (total, month) => total + month.zakat + month.sadaqahWaqf + month.other,
    0,
  );

  return (
    <Card className={`space-y-4 ${className}`}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
            Confirmed Donation Inflows
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Confirmed backend records by month, for the last 12 months.
          </p>
        </div>
        <div className="text-sm text-stone-600 dark:text-stone-300">
          <span className="font-semibold text-stone-900 dark:text-stone-100">
            ETB {totalInflow.toLocaleString()}
          </span>
          <span className="ml-2">from {recordCount} records</span>
        </div>
      </div>

      {recordCount === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-800/40">
          No confirmed donation records are available for the last 12 months.
        </div>
      ) : (
        <div className="h-80 w-full" role="img" aria-label="Monthly confirmed donation amounts by category">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 12, right: 12, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => value.toLocaleString()}
                width={72}
              />
              <Tooltip
                formatter={(value) => `ETB ${Number(value).toLocaleString()}`}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Bar dataKey="zakat" name="Zakat / Ushr" stackId="inflow" fill="#0f766e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="sadaqahWaqf" name="Sadaqah / Waqf" stackId="inflow" fill="#d97706" />
              <Bar dataKey="other" name="Other confirmed" stackId="inflow" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
