import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Award,
  BookOpen,
  Loader2,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Shield,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { UlemaAvatar } from '../../components/ulema/UlemaAvatar';

export const UlemaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { ulema, ulemaLoading, ulemaError, refreshUlema } = useApp();
  const navigate = useNavigate();

  const scholar = ulema.find((u) => u.id === id && u.isPublished);

  if (ulemaLoading && !scholar) {
    return <div role="status" className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-stone-500"><Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />Loading scholar profile…</div>;
  }

  if (!scholar) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Users className="mx-auto h-10 w-10 text-stone-300" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">Scholar profile unavailable</h1>
        <p className="mt-2 text-sm text-stone-500">{ulemaError || 'This profile may have been removed or is not published.'}</p>
        {ulemaError && <button type="button" className="mt-3 font-semibold text-emerald-700 underline" onClick={() => void refreshUlema().catch(() => undefined)}>Retry loading</button>}
        <Link to="/ulema" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300"><ArrowLeft className="h-4 w-4" />Back to Ulema Directory</Link>
      </div>
    );
  }

  const specializationsList = scholar.specializations;
  const qualificationsList = scholar.qualifications;
  const areasOfServiceList = scholar.areasOfService;
  const languagesList = scholar.languages;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <Link
          to="/ulema"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ulema Directory</span>
        </Link>
        <Button
          variant="gold"
          size="sm"
          icon={<HelpCircle className="w-4 h-4" />}
          onClick={() => navigate('/services')}
        >
          Submit Direct Fatwa Question
        </Button>
      </div>

      {/* Scholar Profile Hero */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-6 border-b border-stone-100 dark:border-stone-800 pb-6">
          <UlemaAvatar name={scholar.name} src={scholar.avatar} className="h-24 w-24 shrink-0 rounded-3xl border-2 border-amber-400/40 text-3xl shadow-md" />

          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="blue">{scholar.status || 'Active Scholar'}</Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
              {scholar.name}
            </h1>
            {scholar.arabicName && (
              <p className="font-serif text-amber-700 dark:text-amber-400 text-lg sm:text-xl font-medium" dir="rtl">
                {scholar.arabicName}
              </p>
            )}
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {scholar.title} • {scholar.district}
            </p>
            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed pt-1">
              {scholar.biography}
            </p>
          </div>
        </div>

        {/* 3 Overview Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700">
            <span className="text-stone-400 uppercase font-bold text-[10px] block">
              Assigned Mosque / Institution
            </span>
            <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm block mt-1">
              {scholar.assignedMosqueName || 'Supreme Council Central Mosque'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700">
            <span className="text-stone-400 uppercase font-bold text-[10px] block">
              Years of Dawah & Service
            </span>
            <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm block mt-1 font-mono">
              {scholar.yearsOfDawah}+ Years
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700">
            <span className="text-stone-400 uppercase font-bold text-[10px] block">
              Contact Phone & Desk
            </span>
            <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm block mt-1 font-mono">
              {scholar.contactPhone}
            </span>
          </div>
        </div>
      </div>

      {/* Specializations & Qualifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Disciplines of Expertise & Shari'ah Specializations</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {specializationsList.map((spec) => (
                <div
                  key={spec}
                  className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Academic Sanad, Alma Mater & Qualifications</span>
            </h3>
            <div className="space-y-3">
              {qualificationsList.map((qual, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700/60 text-xs flex items-center justify-between"
                >
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {qual}
                  </span>
                  <Badge variant="slate">Verified Ijazah</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>Council Service Portfolios & Commitments</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {areasOfServiceList.map((area, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700/60 text-xs text-stone-700 dark:text-stone-300 font-medium"
                >
                  • {area}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right side: Languages & Weekly Public Halaqah schedule */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="space-y-3">
            <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              Languages of Instruction
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {languagesList.map((lang) => (
                <span
                  key={lang}
                  className="px-2.5 py-1 text-xs rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium"
                >
                  {lang}
                </span>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Weekly Public Halaqah</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
              <div className="font-bold text-emerald-950 dark:text-emerald-200">
                Sharh Bulugh al-Maram & Tafsir
              </div>
              <div className="text-stone-600 dark:text-stone-300">
                Every Saturday after Asr Prayer
              </div>
              <div className="text-[11px] text-stone-500">
                {scholar.assignedMosqueName || 'Grand Anwar Central Mosque'} • Open to all students of knowledge
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
