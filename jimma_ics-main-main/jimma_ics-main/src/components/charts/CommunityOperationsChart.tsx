import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Madrasa, Mosque } from '../../types';

interface CommunityOperationsChartProps {
  mosques: Mosque[];
  madrasas: Madrasa[];
}

export const CommunityOperationsChart: React.FC<CommunityOperationsChartProps> = ({
  mosques,
  madrasas,
}) => {
  const data = [
    { name: 'Mosques', count: mosques.length, fill: '#047857' },
    { name: 'Madrasas', count: madrasas.length, fill: '#7c3aed' },
    {
      name: 'Students',
      count: madrasas.reduce((total, madrasa) => total + madrasa.totalStudents, 0),
      fill: '#d97706',
    },
    {
      name: 'Teachers',
      count: madrasas.reduce((total, madrasa) => total + madrasa.totalTeachers, 0),
      fill: '#2563eb',
    },
  ];

  return (
    <div
      className="h-64 w-full text-stone-600 dark:text-stone-300"
      role="img"
      aria-label="Mosque and madrasa directory totals"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 28, left: 8, bottom: 8 }}
          barCategoryGap="28%"
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
            width={82}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
          />
          <Tooltip
            cursor={{ fill: '#a8a29e', opacity: 0.1 }}
            formatter={(value) => [Number(value).toLocaleString(), 'Records']}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e7e5e4',
              backgroundColor: '#ffffff',
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={26}>
            {data.map((item) => (
              <Cell key={item.name} fill={item.fill} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              fill="currentColor"
              fontSize={11}
              formatter={(value: number) => value.toLocaleString()}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
