import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Building,
  CalendarDays,
  CheckCircle2,
  Compass,
  FileText,
  HeartHandshake,
  MapPin,
  Radio,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';

const shortcuts = [
  { label: 'Mosques', detail: 'Find a nearby mosque', path: '/mosques', icon: Building },
  { label: 'Madrasas', detail: 'Explore Quranic education', path: '/madrasas', icon: BookOpen },
  { label: 'Teachers', detail: 'Find teachers & Mu’allims', path: '/teachers', icon: Users },
  { label: 'Ulema', detail: 'Browse scholars', path: '/ulema', icon: Users },
  { label: 'Public services', detail: 'Apply or track a request', path: '/services', icon: CheckCircle2 },
  { label: 'Kebele map', detail: 'Explore Jimma City', path: '/map', icon: Compass },
  { label: 'Events', detail: 'See what is happening', path: '/events', icon: CalendarDays },
  { label: 'Announcements', detail: 'Read council notices', path: '/announcements', icon: FileText },
];

const sectionClass = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';

export const CommunityHomePage: React.FC = () => {
  const { mosques, madrasas, ulema, students, funds, publicServices } = useApp();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const totalFundBalance = funds.reduce((total, fund) => total + fund.allocatedETB, 0);

  return (
    <div className="space-y-14 pb-10 sm:space-y-20">
      <section className="relative overflow-hidden border-b border-emerald-950/10 bg-[#f3f0e5] dark:border-stone-800 dark:bg-stone-900">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-8 h-96 w-96 rounded-full border border-emerald-900/10 sm:right-8">
          <div className="absolute inset-8 rounded-full border border-emerald-900/10">
            <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle,rgba(212,177,103,.2),transparent_70%)]" />
          </div>
        </div>
        <div className={`${sectionClass} relative flex justify-center py-14 sm:py-20 lg:py-24`}>
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.13em] text-emerald-900 dark:border-emerald-300/20 dark:bg-stone-800 dark:text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Jimma City · Public community portal
            </div>
            <h1 className="mx-auto max-w-3xl font-serif text-4xl font-extrabold leading-[1.08] tracking-tight text-stone-900 dark:text-stone-50 sm:text-5xl lg:text-6xl">
              {language === 'ar' ? (
                'خدمة المجتمع، معًا'
              ) : language === 'om' ? (
                'Hawaasa keenya waliin tajaajiluu'
              ) : (
                <>A clearer way to connect with <span className="text-emerald-800 dark:text-emerald-300">your community.</span></>
              )}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-stone-600 dark:text-stone-300 sm:text-lg">
              Find local institutions, public services, community updates and practical guidance in one welcoming place.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/services" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600">
                Explore public services <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/mosques" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-5 py-3 text-sm font-bold text-stone-800 transition hover:border-emerald-700 hover:text-emerald-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:text-emerald-200">
                Find an institution
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-stone-600 dark:text-stone-300">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-800 dark:text-emerald-300" /> Serving Jimma City communities</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-700 dark:text-amber-400" /> 18 kebeles</span>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Community overview" className={`${sectionClass} -mt-10 relative z-10`}>
        <div className="grid grid-cols-2 divide-x divide-y divide-stone-200 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:divide-stone-700 dark:border-stone-700 dark:bg-stone-900 sm:grid-cols-4 sm:divide-y-0">
          {[
            { label: 'Mosques', value: '128+', detail: 'Across 18 kebeles', icon: Building },
            { label: 'Students enrolled', value: `${Math.max(4_850, students.length).toLocaleString()}+`, detail: 'In Quranic education', icon: BookOpen },
            { label: 'Ulema & teachers', value: `${Math.max(142, ulema.length)}+`, detail: 'Community educators', icon: Users },
            { label: 'Community funds', value: `${(totalFundBalance / 1_000_000).toFixed(1)}M+`, detail: 'ETB allocated', icon: HeartHandshake },
          ].map(({ label, value, detail, icon: Icon }) => (
            <div key={label} className="p-4 sm:p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <Icon className="h-4 w-4" /> {label}
              </div>
              <p className="mt-2 font-serif text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">{value}</p>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-emerald-800 dark:text-emerald-300">Start here</p>
            <h2 className="mt-2 font-serif text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">Community life, made easier.</h2>
          </div>
          <p className="hidden text-sm text-stone-500 dark:text-stone-400 sm:block">The most-used services and directories, all in one place.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {shortcuts.map(({ label, detail, path, icon: Icon }) => (
            <Link key={path} to={path} className="group flex min-h-36 flex-col rounded-2xl border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-700/40 hover:shadow-md dark:border-stone-700 dark:bg-stone-900 sm:min-h-40 sm:p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-900 transition-colors group-hover:bg-emerald-900 group-hover:text-white dark:bg-emerald-950 dark:text-emerald-200 dark:group-hover:bg-emerald-700">
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-4 font-bold text-stone-900 dark:text-stone-100">{label}</span>
              <span className="mt-1 text-xs leading-5 text-stone-500 dark:text-stone-400">{detail}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={`${sectionClass} grid gap-6 lg:grid-cols-2`}>
        <div className="rounded-3xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900 sm:p-6">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.17em] text-emerald-800 dark:text-emerald-300">Local directory</p>
              <h2 className="mt-1 font-serif text-xl font-extrabold text-stone-900 dark:text-stone-50 sm:text-2xl">Places to learn and worship</h2>
            </div>
            <Link to="/mosques" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-600 dark:text-emerald-300">
              All institutions <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {mosques.slice(0, 2).map((mosque) => (
              <Link key={mosque.id} to={`/mosques/${mosque.id}`} className="flex items-center gap-3 rounded-2xl border border-stone-100 p-3 transition hover:border-emerald-700/30 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800">
                <img src={mosque.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-16 w-16 shrink-0 rounded-xl bg-stone-200 object-cover dark:bg-stone-700" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-stone-900 dark:text-stone-100">{mosque.name}</span>
                  <span className="mt-1 block truncate text-xs text-stone-500 dark:text-stone-400">{mosque.district} · {mosque.capacity.toLocaleString()} worshippers</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-emerald-800 dark:text-emerald-300" />
              </Link>
            ))}
            {madrasas.slice(0, 2).map((madrasa) => (
              <Link key={madrasa.id} to={`/madrasas/${madrasa.id}`} className="flex items-center gap-3 rounded-2xl border border-stone-100 p-3 transition hover:border-emerald-700/30 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300"><BookOpen className="h-6 w-6" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-stone-900 dark:text-stone-100">{madrasa.name}</span>
                  <span className="mt-1 block truncate text-xs text-stone-500 dark:text-stone-400">{madrasa.district} · {madrasa.totalStudents.toLocaleString()} students</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-emerald-800 dark:text-emerald-300" />
              </Link>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-stone-100 pt-4 dark:border-stone-800">
            <Link to="/teachers" className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 dark:bg-stone-800 dark:text-stone-200">Find a teacher</Link>
            <Link to="/ulema" className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 dark:bg-stone-800 dark:text-stone-200">Browse Ulema</Link>
            <Link to="/map" className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 dark:bg-stone-800 dark:text-stone-200">Open kebele map</Link>
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900 sm:p-6">
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[.17em] text-emerald-800 dark:text-emerald-300">Public services</p>
            <h2 className="mt-1 font-serif text-xl font-extrabold text-stone-900 dark:text-stone-50 sm:text-2xl">What can we help with?</h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Browse services, start an application, or check its status.</p>
          </div>
          <div className="space-y-2">
            {publicServices.slice(0, 4).map((service) => (
              <Link key={service.id} to={`/services?apply=${service.id}`} className="flex items-center gap-3 rounded-xl border border-stone-100 px-3 py-3 transition hover:border-emerald-700/30 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"><HeartHandshake className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-stone-900 dark:text-stone-100">{service.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-stone-500 dark:text-stone-400">{service.category} · {service.processingTime}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-stone-400" />
              </Link>
            ))}
            <Link to="/services?tab=track" className="flex items-center justify-between rounded-xl bg-emerald-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-900">
              Track an application <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className={`${sectionClass} grid gap-5 lg:grid-cols-2`}>
        <div className="flex flex-col justify-between gap-5 rounded-3xl bg-emerald-950 p-6 text-white sm:p-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700 bg-emerald-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
              <Radio className="h-3.5 w-3.5" /> Community alerts
            </span>
            <h2 className="mt-4 font-serif text-2xl font-extrabold sm:text-3xl">Stay connected to local updates.</h2>
            <p className="mt-3 text-sm leading-6 text-emerald-100/80">Find official announcements, community gatherings and urgent notices for Jimma City.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/announcements" className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-bold text-emerald-950 hover:bg-amber-400"><Send className="h-4 w-4" /> View public updates</Link>
            <Link to="/admin/gateway" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"><Radio className="h-4 w-4" /> Communications gateway</Link>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-5 rounded-3xl bg-amber-100 p-6 dark:bg-amber-950/50 sm:p-8">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-emerald-900 dark:text-amber-200"><HeartHandshake className="h-4 w-4" /> Giving, with care</span>
            <h2 className="mt-3 font-serif text-2xl font-extrabold text-emerald-950 dark:text-stone-50 sm:text-3xl">Support education and community welfare.</h2>
            <p className="mt-3 text-sm leading-6 text-stone-700 dark:text-stone-200">Explore giving options, review Zakat guidance, or submit a donation reference.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="md" onClick={() => navigate('/donate')} icon={<HeartHandshake className="h-4 w-4" />}>
              {t('donateNowBtn')}
            </Button>
            <Link to="/services?tab=zakat" className="inline-flex items-center gap-2 rounded-full border border-emerald-900/25 px-4 py-2.5 text-sm font-bold text-emerald-950 hover:bg-white/50 dark:border-amber-200/30 dark:text-amber-100 dark:hover:bg-white/10">
              Zakat guidance <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
