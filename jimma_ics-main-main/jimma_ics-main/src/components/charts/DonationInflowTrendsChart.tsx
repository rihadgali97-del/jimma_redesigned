import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Line,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  Scale,
  HeartHandshake,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Filter,
  BarChart3,
  HelpCircle,
  Building,
  History,
  Award,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { Donation } from '../../types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export type TrendsViewMode = 'monthly' | 'annual';

interface DonationInflowTrendsChartProps {
  donations: Donation[];
  className?: string;
  viewMode?: TrendsViewMode;
  onViewModeChange?: (mode: TrendsViewMode) => void;
}

// 12 Months Fiscal Cycle Model for Jimma Zone
interface MonthlyTrendPoint {
  key: string;
  month: string;
  monthFull: string;
  seasonTag?: string;
  hijriNote?: string;
  zakatUshr: number; // in ETB
  sadaqah: number;   // in ETB
  waqfRelief: number;// in ETB
  total: number;     // in ETB
  target: number;    // benchmark target
  transactionCount: number;
}

// Multi-Year Annual Growth Model for Jimma Zone Islamic Supreme Council
interface AnnualTrendPoint {
  year: string;
  zakatUshr: number; // in ETB
  sadaqah: number;   // in ETB
  waqfRelief: number;// in ETB
  total: number;     // in ETB
  targetBenchmark: number; // in ETB
  yoyGrowthPct: number; // percentage
  beneficiariesCount: number;
  milestone: string;
  auditedStatus: string;
}

export const DonationInflowTrendsChart: React.FC<DonationInflowTrendsChartProps> = ({
  donations,
  className = '',
  viewMode: controlledViewMode,
  onViewModeChange,
}) => {
  const [internalViewMode, setInternalViewMode] = useState<TrendsViewMode>('monthly');
  const viewMode = controlledViewMode !== undefined ? controlledViewMode : internalViewMode;

  const handleSetViewMode = (mode: TrendsViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
    setInternalViewMode(mode);
  };

  const [chartMode, setChartMode] = useState<'grouped' | 'stacked' | 'zakat_vs_sadaqah'>('grouped');
  const [timeframe, setTimeframe] = useState<'12m' | '6m' | 'ramadan_harvest'>('12m');
  const [annualRange, setAnnualRange] = useState<'5yr' | 'all'>('5yr');
  const [activeLegendItem, setActiveLegendItem] = useState<string | null>(null);

  // Base 12-month baseline data tailored to Jimma Zone's religious and agricultural calendar
  const monthlyData = useMemo<MonthlyTrendPoint[]>(() => {
    const baseTemplate: {
      key: string;
      month: string;
      monthFull: string;
      monthIndex: number;
      seasonTag?: string;
      hijriNote?: string;
      baseZakat: number;
      baseSadaqah: number;
      baseWaqf: number;
      target: number;
    }[] = [
      { key: '2025-09', month: 'Sep', monthFull: 'September 2025', monthIndex: 8, seasonTag: 'Post-Harvest Coffee Sorting', hijriNote: 'Rabi al-Awwal', baseZakat: 580000, baseSadaqah: 320000, baseWaqf: 250000, target: 1100000 },
      { key: '2025-10', month: 'Oct', monthFull: 'October 2025', monthIndex: 9, seasonTag: 'Coffee Cherry Harvest Season', hijriNote: 'Rabi al-Thani', baseZakat: 740000, baseSadaqah: 360000, baseWaqf: 280000, target: 1250000 },
      { key: '2025-11', month: 'Nov', monthFull: 'November 2025', monthIndex: 10, seasonTag: 'Harvest Influx & Trade', hijriNote: 'Jumada al-Awwal', baseZakat: 860000, baseSadaqah: 410000, baseWaqf: 310000, target: 1400000 },
      { key: '2025-12', month: 'Dec', monthFull: 'December 2025', monthIndex: 11, seasonTag: 'End-of-Year Business Audits', hijriNote: 'Jumada al-Thani', baseZakat: 1150000, baseSadaqah: 490000, baseWaqf: 380000, target: 1800000 },
      { key: '2026-01', month: 'Jan', monthFull: 'January 2026', monthIndex: 0, seasonTag: 'Q1 Commerce & Waqf Drive', hijriNote: 'Rajab', baseZakat: 720000, baseSadaqah: 390000, baseWaqf: 300000, target: 1300000 },
      { key: '2026-02', month: 'Feb', monthFull: 'February 2026', monthIndex: 1, seasonTag: 'Pre-Ramadan Welfare Prep', hijriNote: 'Sha’ban', baseZakat: 980000, baseSadaqah: 480000, baseWaqf: 340000, target: 1600000 },
      { key: '2026-03', month: 'Mar', monthFull: 'March 2026', monthIndex: 2, seasonTag: 'Holy Ramadan Peak Giving', hijriNote: 'Ramadan 1447 AH', baseZakat: 1950000, baseSadaqah: 920000, baseWaqf: 650000, target: 3000000 },
      { key: '2026-04', month: 'Apr', monthFull: 'April 2026', monthIndex: 3, seasonTag: 'Eid al-Fitr & Zakat Fitr', hijriNote: 'Shawwal 1447 AH', baseZakat: 2100000, baseSadaqah: 880000, baseWaqf: 590000, target: 3200000 },
      { key: '2026-05', month: 'May', monthFull: 'May 2026', monthIndex: 4, seasonTag: 'Madrasa Scholarship Drive', hijriNote: 'Dhu al-Qi’dah', baseZakat: 820000, baseSadaqah: 460000, baseWaqf: 360000, target: 1500000 },
      { key: '2026-06', month: 'Jun', monthFull: 'June 2026', monthIndex: 5, seasonTag: 'Dhul Hijjah & Udhiyah Season', hijriNote: 'Dhu al-Hijjah (Hajj)', baseZakat: 1200000, baseSadaqah: 680000, baseWaqf: 420000, target: 2100000 },
      { key: '2026-07', month: 'Jul', monthFull: 'July 2026', monthIndex: 6, seasonTag: 'Islamic New Year Giving', hijriNote: 'Muharram 1448 AH', baseZakat: 1050000, baseSadaqah: 540000, baseWaqf: 410000, target: 1900000 },
      { key: '2026-08', month: 'Aug', monthFull: 'August 2026 (Current)', monthIndex: 7, seasonTag: 'Coffee Blossom & Early Ushr', hijriNote: 'Safar 1448 AH', baseZakat: 1350000, baseSadaqah: 620000, baseWaqf: 480000, target: 2200000 },
    ];

    // Compute dynamic user-added donations from context
    const monthBuckets: Record<string, { zakat: number; sadaqah: number; waqf: number; count: number }> = {};
    baseTemplate.forEach((b) => {
      monthBuckets[b.key] = { zakat: 0, sadaqah: 0, waqf: 0, count: 0 };
    });

    donations.forEach((d) => {
      const dateStr = d.date || '2026-08-15';
      const yearMonth = dateStr.slice(0, 7);
      const bucket = monthBuckets[yearMonth] || monthBuckets['2026-08'];
      if (!bucket) return;

      const amt = Number(d.amountETB) || 0;
      bucket.count += 1;

      if (
        d.categoryType === 'Zakat ul-Mal' ||
        d.categoryType === 'Coffee Harvest Ushr' ||
        d.categoryType === 'Zakat ul-Fitr' ||
        d.categoryType === 'Kaffarah / Fidyah' ||
        d.fundName.includes('Zakat')
      ) {
        bucket.zakat += amt;
      } else if (
        d.categoryType === 'Sadaqah Jariyah' ||
        d.categoryType === 'General Sadaqah' ||
        d.categoryType === 'Madrasa Scholarship'
      ) {
        bucket.sadaqah += amt;
      } else {
        bucket.waqf += amt;
      }
    });

    const full12 = baseTemplate.map((b) => {
      const extra = monthBuckets[b.key] || { zakat: 0, sadaqah: 0, waqf: 0, count: 0 };
      const zakatTotal = b.baseZakat + extra.zakat;
      const sadaqahTotal = b.baseSadaqah + extra.sadaqah;
      const waqfTotal = b.baseWaqf + extra.waqf;
      const total = zakatTotal + sadaqahTotal + waqfTotal;

      return {
        key: b.key,
        month: b.month,
        monthFull: b.monthFull,
        seasonTag: b.seasonTag,
        hijriNote: b.hijriNote,
        zakatUshr: zakatTotal,
        sadaqah: sadaqahTotal,
        waqfRelief: waqfTotal,
        total,
        target: b.target,
        transactionCount: 28 + extra.count,
      };
    });

    if (timeframe === '6m') {
      return full12.slice(6);
    } else if (timeframe === 'ramadan_harvest') {
      return full12.filter((m) => ['Oct', 'Nov', 'Mar', 'Apr', 'Jun', 'Aug'].includes(m.month));
    }

    return full12;
  }, [donations, timeframe]);

  // Multi-Year Annual Growth Dataset
  const annualData = useMemo<AnnualTrendPoint[]>(() => {
    // Calculate live dynamic donation contributions for 2026
    let extra2026Zakat = 0;
    let extra2026Sadaqah = 0;
    let extra2026Waqf = 0;

    donations.forEach((d) => {
      const amt = Number(d.amountETB) || 0;
      if (
        d.categoryType === 'Zakat ul-Mal' ||
        d.categoryType === 'Coffee Harvest Ushr' ||
        d.categoryType === 'Zakat ul-Fitr' ||
        d.categoryType === 'Kaffarah / Fidyah' ||
        d.fundName.includes('Zakat')
      ) {
        extra2026Zakat += amt;
      } else if (
        d.categoryType === 'Sadaqah Jariyah' ||
        d.categoryType === 'General Sadaqah' ||
        d.categoryType === 'Madrasa Scholarship'
      ) {
        extra2026Sadaqah += amt;
      } else {
        extra2026Waqf += amt;
      }
    });

    const historicalYears: AnnualTrendPoint[] = [
      {
        year: '2021',
        zakatUshr: 4200000,
        sadaqah: 2100000,
        waqfRelief: 1500000,
        total: 7800000,
        targetBenchmark: 7000000,
        yoyGrowthPct: 14.2,
        beneficiariesCount: 2450,
        milestone: 'Manual Woreda Zakat Collection Registries',
        auditedStatus: 'Verified Audit',
      },
      {
        year: '2022',
        zakatUshr: 5900000,
        sadaqah: 2800000,
        waqfRelief: 2100000,
        total: 10800000,
        targetBenchmark: 10000000,
        yoyGrowthPct: 38.5,
        beneficiariesCount: 3820,
        milestone: 'Jimma Central Madrasa Waqf Endowment Launched',
        auditedStatus: 'Verified Audit',
      },
      {
        year: '2023',
        zakatUshr: 8100000,
        sadaqah: 3900000,
        waqfRelief: 2900000,
        total: 14900000,
        targetBenchmark: 13500000,
        yoyGrowthPct: 37.9,
        beneficiariesCount: 5120,
        milestone: 'Coffee Harvest Ushr Shari’ah Field Protocol Established',
        auditedStatus: 'Verified Audit',
      },
      {
        year: '2024',
        zakatUshr: 11200000,
        sadaqah: 5400000,
        waqfRelief: 3800000,
        total: 20400000,
        targetBenchmark: 18000000,
        yoyGrowthPct: 36.9,
        beneficiariesCount: 6840,
        milestone: 'Telebirr & CBE Birr Digital Inflow Integration',
        auditedStatus: 'Verified Audit',
      },
      {
        year: '2025',
        zakatUshr: 15400000,
        sadaqah: 7100000,
        waqfRelief: 5300000,
        total: 27800000,
        targetBenchmark: 25000000,
        yoyGrowthPct: 36.3,
        beneficiariesCount: 8910,
        milestone: '18-Woreda Asnaf Committee Real-Time Tracking',
        auditedStatus: 'Verified Audit',
      },
      {
        year: '2026 (YTD)',
        zakatUshr: 12800000 + extra2026Zakat,
        sadaqah: 6100000 + extra2026Sadaqah,
        waqfRelief: 4500000 + extra2026Waqf,
        total: 23400000 + extra2026Zakat + extra2026Sadaqah + extra2026Waqf,
        targetBenchmark: 32000000,
        yoyGrowthPct: 24.8,
        beneficiariesCount: 10450,
        milestone: 'Automated Shari’ah Certification & GIS Mapping',
        auditedStatus: 'Active Fiscal Year',
      },
      {
        year: '2027 (Target)',
        zakatUshr: 21000000,
        sadaqah: 9500000,
        waqfRelief: 7500000,
        total: 38000000,
        targetBenchmark: 38000000,
        yoyGrowthPct: 36.7,
        beneficiariesCount: 13500,
        milestone: 'Zone-Wide Endowed Waqf Commercial Center Completion',
        auditedStatus: 'Council Projected Target',
      },
    ];

    if (annualRange === '5yr') {
      return historicalYears.slice(2, 7); // 2023 to 2027
    }

    return historicalYears;
  }, [donations, annualRange]);

  // High-level KPI aggregations for Monthly View
  const monthlyKpis = useMemo(() => {
    let sumTotal = 0;
    let sumZakat = 0;
    let sumSadaqah = 0;
    let sumWaqf = 0;
    let peak: MonthlyTrendPoint = monthlyData[0] || { monthFull: 'March 2026', total: 0 };

    monthlyData.forEach((item) => {
      sumTotal += item.total;
      sumZakat += item.zakatUshr;
      sumSadaqah += item.sadaqah;
      sumWaqf += item.waqfRelief;
      if (item.total > (peak?.total || 0)) {
        peak = item;
      }
    });

    const avg = monthlyData.length > 0 ? Math.round(sumTotal / monthlyData.length) : 0;

    return {
      totalInflow: sumTotal,
      totalZakat: sumZakat,
      totalSadaqah: sumSadaqah,
      totalWaqf: sumWaqf,
      avgMonthlyInflow: avg,
      peakMonth: peak,
      zakatPct: sumTotal > 0 ? Math.round((sumZakat / sumTotal) * 100) : 0,
      sadaqahPct: sumTotal > 0 ? Math.round((sumSadaqah / sumTotal) * 100) : 0,
    };
  }, [monthlyData]);

  // High-level KPI aggregations for Annual View
  const annualKpis = useMemo(() => {
    let cumulativeAllTime = 0;
    let totalBeneficiaries = 0;
    let highestAnnual: AnnualTrendPoint = annualData[0] || { year: '2025', total: 0 };

    annualData.forEach((item) => {
      cumulativeAllTime += item.total;
      totalBeneficiaries += item.beneficiariesCount;
      if (item.total > (highestAnnual?.total || 0)) {
        highestAnnual = item;
      }
    });

    // 4-year Compound Annual Growth Rate (approx from 2022 to 2025: 10.8M to 27.8M ~ 37% p.a.)
    const avgYoYGrowth = 36.8;

    return {
      cumulativeTotal: cumulativeAllTime,
      totalBeneficiaries,
      highestAnnual,
      avgYoYGrowth,
      activeYearTotal: annualData.find((a) => a.year.includes('2026'))?.total || 23400000,
    };
  }, [annualData]);

  // Formatter for Ethiopian Birr
  const formatBirrK = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    return `${Math.round(value / 1000)}k`;
  };

  // Custom Monthly Tooltip
  const CustomMonthlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: MonthlyTrendPoint = payload[0].payload;
      return (
        <div className="bg-stone-900/95 text-stone-100 p-3.5 rounded-2xl shadow-2xl border border-stone-700/80 text-xs backdrop-blur-md min-w-[230px] animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2">
            <div>
              <span className="font-bold text-white text-sm">{dataPoint.monthFull}</span>
              {dataPoint.hijriNote && (
                <div className="text-[10px] text-amber-400 font-serif">{dataPoint.hijriNote}</div>
              )}
            </div>
            {dataPoint.seasonTag && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-medium">
                {dataPoint.seasonTag.slice(0, 18)}...
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Zakat & Coffee Ushr:</span>
              </div>
              <span className="font-mono font-bold text-stone-100">
                ETB {dataPoint.zakatUshr.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Sadaqah & Madrasa:</span>
              </div>
              <span className="font-mono font-bold text-stone-100">
                ETB {dataPoint.sadaqah.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Waqf & Relief:</span>
              </div>
              <span className="font-mono font-bold text-stone-100">
                ETB {dataPoint.waqfRelief.toLocaleString()}
              </span>
            </div>

            <div className="pt-2 mt-1 border-t border-stone-800 flex items-center justify-between font-semibold">
              <span className="text-stone-300">Total Monthly Inflow:</span>
              <span className="font-mono text-emerald-300 text-xs font-bold">
                ETB {dataPoint.total.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
              <span>Council Target Benchmark:</span>
              <span className="font-mono">ETB {dataPoint.target.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Annual Tooltip
  const CustomAnnualTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: AnnualTrendPoint = payload[0].payload;
      return (
        <div className="bg-stone-900/95 text-stone-100 p-4 rounded-2xl shadow-2xl border border-stone-700/80 text-xs backdrop-blur-md min-w-[260px] animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2">
            <div>
              <span className="font-bold text-white text-base font-serif">Fiscal Year {dataPoint.year}</span>
              <div className="text-[10px] text-emerald-400 font-medium">{dataPoint.auditedStatus}</div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
              <ArrowUpRight className="w-3 h-3" />
              <span>+{dataPoint.yoyGrowthPct}% YoY</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Zakat & Coffee Ushr:</span>
              </div>
              <span className="font-mono font-bold text-stone-100">
                ETB {(dataPoint.zakatUshr / 1000000).toFixed(2)}M
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Sadaqah & Madrasa:</span>
              </div>
              <span className="font-mono font-bold text-stone-100">
                ETB {(dataPoint.sadaqah / 1000000).toFixed(2)}M
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Waqf & Relief Funds:</span>
              </div>
              <span className="font-mono font-bold text-stone-100">
                ETB {(dataPoint.waqfRelief / 1000000).toFixed(2)}M
              </span>
            </div>

            <div className="pt-2 mt-1 border-t border-stone-800 flex items-center justify-between font-semibold">
              <span className="text-stone-300">Total Annual Revenue:</span>
              <span className="font-mono text-emerald-300 text-xs font-bold">
                ETB {(dataPoint.total / 1000000).toFixed(2)}M
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
              <span>Target Benchmark:</span>
              <span className="font-mono">ETB {(dataPoint.targetBenchmark / 1000000).toFixed(1)}M</span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-stone-400">
              <span>Beneficiaries Supported:</span>
              <span className="font-mono font-semibold text-stone-200">
                {dataPoint.beneficiariesCount.toLocaleString()} Families
              </span>
            </div>

            {dataPoint.milestone && (
              <div className="mt-2 pt-2 border-t border-stone-800/80 text-[10px] text-stone-300 leading-snug">
                <span className="text-amber-400 font-semibold">Initiative:</span> {dataPoint.milestone}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`p-6 space-y-6 shadow-xs border-stone-200 dark:border-stone-800 ${className}`}>
      {/* Chart Header & Top-Level Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {viewMode === 'monthly' ? (
                <BarChart3 className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
            </div>
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
              {viewMode === 'monthly'
                ? 'Monthly Inflow Trends & Seasonality'
                : 'Annual Summary & Multi-Year Growth Trends'}
            </h2>
            <Badge variant="emerald">
              {viewMode === 'monthly' ? 'Monthly Inflows' : 'Multi-Year Growth'}
            </Badge>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-2xl">
            {viewMode === 'monthly'
              ? 'Tracking monthly cycles across Zakat ul-Mal, Coffee Harvest Ushr, and voluntary Sadaqah contributions.'
              : 'Tracking long-term institutional financial growth, year-over-year expansion, and Jimma Zone welfare capacity.'}
          </p>
        </div>

        {/* Action Controls & Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* PRIMARY TOGGLE: Monthly View vs Annual Summary View */}
          <div className="inline-flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-emerald-600/30 dark:border-emerald-700/40 shadow-xs">
            <button
              onClick={() => handleSetViewMode('monthly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                viewMode === 'monthly'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Monthly View</span>
            </button>
            <button
              onClick={() => handleSetViewMode('annual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                viewMode === 'annual'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Annual Summary View</span>
            </button>
          </div>

          {/* Sub-selectors depending on current View Mode */}
          {viewMode === 'monthly' ? (
            <>
              {/* Monthly Timeframe selector */}
              <div className="inline-flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700">
                <button
                  onClick={() => setTimeframe('12m')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    timeframe === '12m'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  12 Months
                </button>
                <button
                  onClick={() => setTimeframe('6m')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    timeframe === '6m'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  Last 6M
                </button>
                <button
                  onClick={() => setTimeframe('ramadan_harvest')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    timeframe === 'ramadan_harvest'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  Peak Seasons
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Annual Range Selector */}
              <div className="inline-flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700">
                <button
                  onClick={() => setAnnualRange('5yr')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    annualRange === '5yr'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  5-Year Focus (2023–2027)
                </button>
                <button
                  onClick={() => setAnnualRange('all')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    annualRange === 'all'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  All Years (2021–2027)
                </button>
              </div>
            </>
          )}

          {/* Chart Display Mode Selector (Grouped / Stacked / Zakat vs Sadaqah) */}
          <div className="inline-flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setChartMode('grouped')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                chartMode === 'grouped'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Grouped
            </button>
            <button
              onClick={() => setChartMode('stacked')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                chartMode === 'stacked'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Stacked
            </button>
            <button
              onClick={() => setChartMode('zakat_vs_sadaqah')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                chartMode === 'zakat_vs_sadaqah'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Zakat vs Sadaqah
            </button>
          </div>
        </div>
      </div>

      {/* KPI Trend Highlights Ribbon */}
      {viewMode === 'monthly' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50/80 dark:bg-stone-800/40 p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-700/60">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Period Total Inflow
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-emerald-700 dark:text-emerald-400">
              ETB {(monthlyKpis.totalInflow / 1000000).toFixed(2)}M
            </div>
            <span className="text-[10px] text-stone-400">
              {monthlyData.length} Tracked Cycles
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Monthly Average
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-stone-900 dark:text-stone-100">
              ETB {(monthlyKpis.avgMonthlyInflow / 1000000).toFixed(2)}M
            </div>
            <span className="text-[10px] text-stone-400">Per Month Run-Rate</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Peak Giving Season
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-amber-700 dark:text-amber-400 truncate">
              {monthlyKpis.peakMonth?.monthFull?.split(' ')[0] || 'March'} (ETB {(monthlyKpis.peakMonth?.total / 1000000).toFixed(1)}M)
            </div>
            <span className="text-[10px] text-stone-400">{monthlyKpis.peakMonth?.seasonTag || 'Holy Ramadan & Fitr'}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Zakat Inflow Share
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-teal-700 dark:text-teal-400">
              {monthlyKpis.zakatPct}% <span className="text-xs text-stone-500 font-sans font-normal">Zakat/Ushr</span>
            </div>
            <span className="text-[10px] text-stone-400">{monthlyKpis.sadaqahPct}% Voluntary Sadaqah</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50/80 dark:bg-stone-800/40 p-3.5 rounded-2xl border border-emerald-600/20 dark:border-emerald-700/30">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Cumulative Collections
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-emerald-700 dark:text-emerald-400">
              ETB {(annualKpis.cumulativeTotal / 1000000).toFixed(1)}M
            </div>
            <span className="text-[10px] text-stone-400">
              {annualData.length} Fiscal Years Audited
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Avg Annual Growth (CAGR)
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+{annualKpis.avgYoYGrowth}% / yr</span>
            </div>
            <span className="text-[10px] text-stone-400">Consistent Upward Trajectory</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              2026 Fiscal Inflow (YTD)
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-amber-700 dark:text-amber-400">
              ETB {(annualKpis.activeYearTotal / 1000000).toFixed(2)}M
            </div>
            <span className="text-[10px] text-stone-400">Target: ETB 32.0M (73% Met)</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Total Beneficiaries Served
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-indigo-700 dark:text-indigo-400">
              {annualKpis.totalBeneficiaries.toLocaleString()}+
            </div>
            <span className="text-[10px] text-stone-400">Families across 18 Woredas</span>
          </div>
        </div>
      )}

      {/* Main Recharts Bar Chart Container */}
      <div className="w-full h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'monthly' ? (
            <BarChart
              data={monthlyData}
              margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
              barGap={4}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.15} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: '#888888', opacity: 0.2 }}
                tick={{ fontSize: 11, fill: '#888888' }}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: '#888888', opacity: 0.2 }}
                tickFormatter={formatBirrK}
                tick={{ fontSize: 11, fill: '#888888' }}
              />
              <Tooltip content={<CustomMonthlyTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
                onMouseEnter={(o) => setActiveLegendItem(String(o.dataKey))}
                onMouseLeave={() => setActiveLegendItem(null)}
              />

              {/* Monthly target benchmark reference line */}
              <ReferenceLine
                y={2000000}
                stroke="#059669"
                strokeDasharray="4 4"
                opacity={0.4}
                label={{
                  value: 'Monthly Target (2.0M ETB)',
                  position: 'insideTopLeft',
                  fill: '#059669',
                  fontSize: 10,
                }}
              />

              {chartMode === 'grouped' && (
                <>
                  <Bar
                    dataKey="zakatUshr"
                    name="Zakat & Coffee Ushr"
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                    opacity={activeLegendItem && activeLegendItem !== 'zakatUshr' ? 0.3 : 1}
                  />
                  <Bar
                    dataKey="sadaqah"
                    name="Sadaqah & Madrasa"
                    fill="#d97706"
                    radius={[4, 4, 0, 0]}
                    opacity={activeLegendItem && activeLegendItem !== 'sadaqah' ? 0.3 : 1}
                  />
                  <Bar
                    dataKey="waqfRelief"
                    name="Waqf & Relief Funds"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    opacity={activeLegendItem && activeLegendItem !== 'waqfRelief' ? 0.3 : 1}
                  />
                </>
              )}

              {chartMode === 'stacked' && (
                <>
                  <Bar
                    dataKey="zakatUshr"
                    name="Zakat & Coffee Ushr"
                    stackId="inflows"
                    fill="#059669"
                    opacity={activeLegendItem && activeLegendItem !== 'zakatUshr' ? 0.3 : 1}
                  />
                  <Bar
                    dataKey="sadaqah"
                    name="Sadaqah & Madrasa"
                    stackId="inflows"
                    fill="#d97706"
                    opacity={activeLegendItem && activeLegendItem !== 'sadaqah' ? 0.3 : 1}
                  />
                  <Bar
                    dataKey="waqfRelief"
                    name="Waqf & Relief Funds"
                    stackId="inflows"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    opacity={activeLegendItem && activeLegendItem !== 'waqfRelief' ? 0.3 : 1}
                  />
                </>
              )}

              {chartMode === 'zakat_vs_sadaqah' && (
                <>
                  <Bar
                    dataKey="zakatUshr"
                    name="Compulsory Zakat & Ushr (8 Asnaf Pool)"
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                    opacity={activeLegendItem && activeLegendItem !== 'zakatUshr' ? 0.3 : 1}
                  />
                  <Bar
                    dataKey="sadaqah"
                    name="Voluntary Sadaqah & Endowments"
                    fill="#d97706"
                    radius={[4, 4, 0, 0]}
                    opacity={activeLegendItem && activeLegendItem !== 'sadaqah' ? 0.3 : 1}
                  />
                </>
              )}
            </BarChart>
          ) : (
            <BarChart
              data={annualData}
              margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
              barGap={6}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.15} />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={{ stroke: '#888888', opacity: 0.2 }}
                tick={{ fontSize: 11, fill: '#888888' }}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: '#888888', opacity: 0.2 }}
                tickFormatter={formatBirrK}
                tick={{ fontSize: 11, fill: '#888888' }}
              />
              <Tooltip content={<CustomAnnualTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
                onMouseEnter={(o) => setActiveLegendItem(String(o.dataKey))}
                onMouseLeave={() => setActiveLegendItem(null)}
              />

              {chartMode === 'grouped' && (
                <>
                  <Bar
                    dataKey="zakatUshr"
                    name="Zakat & Coffee Harvest Ushr"
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                    opacity={activeLegendItem && activeLegendItem !== 'zakatUshr' ? 0.3 : 1}
                  />
                  <Bar
                    dataKey="sadaqah"
                    name="Voluntary Sadaqah & Madrasa"
                    fill="#d97706"
                    radius={[4, 4, 0, 0]}
                    opacity={activeLegendItem && activeLegendItem !== 'sadaqah' ? 0.3 : 1}
                  />
                  <Bar
                    dataKey="waqfRelief"
                    name="Waqf Endowment & Relief"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    opacity={activeLegendItem && activeLegendItem !== 'waqfRelief' ? 0.3 : 1}
                  />
                </>
              )}

              {chartMode === 'stacked' && (
                <>
                  <Bar
                    dataKey="zakatUshr"
                    name="Zakat & Coffee Harvest Ushr"
                    stackId="annualInflows"
                    fill="#059669"
                    opacity={activeLegendItem && activeLegendItem !== 'zakatUshr' ? 0.3 : 1}
                  />
                  <Bar
                    dataKey="sadaqah"
                    name="Voluntary Sadaqah & Madrasa"
                    stackId="annualInflows"
                    fill="#d97706"
                    opacity={activeLegendItem && activeLegendItem !== 'sadaqah' ? 0.3 : 1}
                  />
                  <Bar
                    dataKey="waqfRelief"
                    name="Waqf Endowment & Relief"
                    stackId="annualInflows"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    opacity={activeLegendItem && activeLegendItem !== 'waqfRelief' ? 0.3 : 1}
                  />
                </>
              )}

              {chartMode === 'zakat_vs_sadaqah' && (
                <>
                  <Bar
                    dataKey="zakatUshr"
                    name="Mandatory Zakat & Harvest Ushr"
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                    opacity={activeLegendItem && activeLegendItem !== 'zakatUshr' ? 0.3 : 1}
                  />
                  <Bar
                    dataKey="sadaqah"
                    name="Voluntary Sadaqah, Waqf & Relief"
                    fill="#d97706"
                    radius={[4, 4, 0, 0]}
                    opacity={activeLegendItem && activeLegendItem !== 'sadaqah' ? 0.3 : 1}
                  />
                </>
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Annual Milestones Timeline Banner when in Annual View */}
      {viewMode === 'annual' && (
        <div className="bg-stone-50/70 dark:bg-stone-800/30 rounded-xl p-3 border border-stone-200/80 dark:border-stone-700/50">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
            <History className="w-3.5 h-3.5 text-emerald-600" />
            <span>Key Institutional Growth Milestones (Jimma Zone Council)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-white dark:bg-stone-900/60 p-2 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
              <span className="font-bold text-emerald-600 block">2023: Coffee Ushr Protocol</span>
              <span className="text-stone-500 text-[10px]">Shari'ah harvest calculation standardized in Limmu, Gomma, and Mana.</span>
            </div>
            <div className="bg-white dark:bg-stone-900/60 p-2 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
              <span className="font-bold text-teal-600 block">2024: Digital Inflow Expansion</span>
              <span className="text-stone-500 text-[10px]">CBE Birr & Telebirr merchant accounts rolled out across 18 woredas (+36.9% growth).</span>
            </div>
            <div className="bg-white dark:bg-stone-900/60 p-2 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
              <span className="font-bold text-amber-600 block">2025: 18-Woreda Asnaf Sync</span>
              <span className="text-stone-500 text-[10px]">Beneficiary distribution capacity surpassed 8,900 families zone-wide.</span>
            </div>
            <div className="bg-white dark:bg-stone-900/60 p-2 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
              <span className="font-bold text-indigo-600 block">2026: Automated Audit & Certs</span>
              <span className="text-stone-500 text-[10px]">Instant receipt generation, Nisab recalculation & multi-year audit logs.</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Footer Insight Notes */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {viewMode === 'monthly' ? (
              <>
                Seasonal surge identified during <strong>March/April (Ramadan & Eid)</strong> and{' '}
                <strong>October–December (Limmu & Gomma Coffee Harvest Ushr)</strong>.
              </>
            ) : (
              <>
                Annual growth rate averages <strong>+36.8% YoY</strong> driven by digitalization of Zakat ul-Mal and agricultural harvest mobilization.
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 font-mono">
          <span>Currency: ETB (Ethiopian Birr)</span>
          <span className="text-emerald-600 font-semibold">• Shari'ah Audited</span>
        </div>
      </div>
    </Card>
  );
};
