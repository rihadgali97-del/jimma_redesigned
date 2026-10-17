import React from 'react';
import {
  Landmark,
  ShieldCheck,
  Target,
  Compass,
  Building,
  CheckCircle2,
  BookOpen,
  Users,
} from 'lucide-react';
import { IslamicPattern } from '../../components/common/IslamicPattern';
import { Card } from '../../components/ui/Card';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { translatePublicCopy } from '../../i18n/publicCopy';

export const AboutPage: React.FC = () => {
  const { mosques, madrasas, ulema, ulemaLoading } = useApp();
  const { language } = useLanguage();
  const translate = (copy: string) => translatePublicCopy(copy, language);

  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* Header Banner */}
      <section className="relative bg-gradient-to-b from-emerald-950 to-stone-900 text-white py-16 sm:py-20 overflow-hidden">
        <IslamicPattern opacity={0.06} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700 text-amber-300 text-xs font-semibold mb-4">
            <Landmark className="w-3.5 h-3.5" />
            <span>{translate('Islamic Governance & Heritage')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            {translate('About the Jimma Islamic Council')}
          </h1>
          <p className="text-stone-300 text-sm sm:text-base mt-4 leading-relaxed">
            {translate('The supreme civic and religious authority coordinating the spiritual, educational, and charitable affairs of the Muslim community in Jimma City, Oromia, Ethiopia.')}
          </p>
        </div>
      </section>

      {/* Historical Legacy & Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              {translate('A Legacy of Knowledge & Faith')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 leading-tight">
              {translate('Honoring centuries of Islamic scholarship from the Kingdom of Jimma Abba Jifar')}
            </h2>
            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
              {translate('Jimma has stood as a beacon of Islamic learning, Sufi scholarship, and Quranic recitation in the Horn of Africa. Under the historic leadership of King Abba Jifar and renowned Ulema lineages, scholars established extensive zawiyas, endowments (Awqaf), and manuscript libraries.')}
            </p>
            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
              {translate('Today, the Jimma Islamic Council modernizes this profound trust: creating digital governance frameworks that bridge tradition with 21st-century administrative precision, transparency, and social welfare delivery.')}
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                {translate('Our Mission')}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {translate('To support mosques, Quranic and Islamic education, charitable recordkeeping, and unity in the community.')}
              </p>
            </Card>

            <Card className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                {translate('Our Vision')}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {translate('A digitally unified, highly educated, and socially prosperous Muslim community in Jimma grounded in authentic moderation.')}
              </p>
            </Card>

            <Card className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                {translate("Shari'ah Oversight")}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {translate('All financial disbursements, Fatwa rulings, and curriculum accreditations are vetted by a certified senior Ulema panel.')}
              </p>
            </Card>

            <Card className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                {translate('18 Kebele Desks')}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {translate('Empowering localized administrative desks in Kersa, Agaro, Mana, Gomma, Limmu, Seka, and all zonal subdivisions.')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Strategic Roadmap (Tour Step 18) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-stone-100 rounded-3xl p-8 sm:p-12 border border-stone-800 relative overflow-hidden">
          <IslamicPattern opacity={0.04} />

          <div className="relative z-10 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Landmark className="w-3.5 h-3.5" />
                {translate('Public directory')}
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {translate('Community records available in this portal')}
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm">
                {translate('Counts reflect records currently loaded from the public directories.')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Mosques', count: mosques.length, icon: Building },
                { label: 'Madrasas', count: madrasas.length, icon: BookOpen },
                { label: 'Ulema', count: ulema.length, icon: Users },
              ].map(({ label, count, icon: Icon }) => (
                <div key={label} className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700/80 space-y-2">
                  <Icon className="w-5 h-5 text-amber-400" />
                  <div className="font-serif text-2xl font-bold text-white">
                    {label === 'Ulema' && ulemaLoading ? '…' : count ? count.toLocaleString() : '—'}
                  </div>
                  <h4 className="font-semibold text-sm text-stone-200">{translate(`${label} directory records`)}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
