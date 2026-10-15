import React from 'react';
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

interface WoredaCount {
  woreda: string | null;
  count: number;
}

interface CommunityOperationsChartProps {
  mosques: WoredaCount[];
  madrasas: WoredaCount[];
}

export const CommunityOperationsChart: React.FC<CommunityOperationsChartProps> = ({
  mosques,
  madrasas,
}) => {
  const woredaCounts = new Map<string, { name: string; mosques: number; madrasas: number }>();
  const addCounts = (rows: WoredaCount[], key: 'mosques' | 'madrasas') => {
    rows.forEach(({ woreda, count }) => {
      const name = woreda?.trim() || 'Unassigned';
      const current = woredaCounts.get(name) ?? { name, mosques: 0, madrasas: 0 };
      current[key] += count;
      woredaCounts.set(name, current);
    });
  };

  addCounts(mosques, 'mosques');
  addCounts(madrasas, 'madrasas');
  const data = Array.from(woredaCounts.values()).sort(
    (a, b) => b.mosques + b.madrasas - (a.mosques + a.madrasas)
  );
  const chartHeight = Math.max(220, data.length * 42);

  if (data.length === 0) {
    return (
      <p className="rounded-xl bg-stone-50 p-4 text-center text-sm text-stone-500 dark:bg-stone-800">
        No mosque or madrasa distribution data is available.
      </p>
    );
  }

  return (
    <div className="max-h-[420px] overflow-y-auto pr-2">
      <div
        className="w-full text-stone-600 dark:text-stone-300"
        style={{ height: chartHeight }}
        role="img"
        aria-label="Mosques and madrasas by woreda"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 20, left: 8, bottom: 8 }}
            barCategoryGap="24%"
          >
            <CartesianGrid horizontal={false} stroke="#a8a29e" strokeDasharray="3 3" opacity={0.25} />
            <XAxis
              type="number"
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', fontSize: 11 }}
              tickFormatter={(value: number) => value.toLocaleString()}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip
              cursor={{ fill: '#a8a29e', opacity: 0.1 }}
              formatter={(value) => Number(value).toLocaleString()}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e7e5e4',
                backgroundColor: '#ffffff',
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
            <Bar dataKey="mosques" name="Mosques" fill="#047857" radius={[0, 5, 5, 0]} maxBarSize={22} />
            <Bar dataKey="madrasas" name="Madrasas" fill="#7c3aed" radius={[0, 5, 5, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
