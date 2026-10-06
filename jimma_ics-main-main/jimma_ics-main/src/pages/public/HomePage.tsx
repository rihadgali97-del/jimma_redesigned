import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Building,
  BookOpen,
  Users,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle,
  FileText,
  HandHeart,
  Landmark,
  Compass,
  Radio,
  Send,
  Smartphone,
  MessageSquare,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { IslamicPattern } from '../../components/common/IslamicPattern';
import { JimmaDistrictMap } from '../../components/charts/JimmaDistrictMap';
import { JimmaGisMiniWidget } from '../../components/gis/JimmaGisMiniWidget';

export const HomePage: React.FC = () => {
  const { mosques, madrasas, ulema, students, funds, events, announcements, publicServices } = useApp();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Prayer times ticker for Jimma City
  const prayerTimes = [
    { name: 'Fajr', time: '05:18 AM' },
    { name: 'Sunrise', time: '06:32 AM' },
    { name: 'Dhuhr', time: '12:44 PM' },
    { name: 'Asr', time: '04:02 PM' },
    { name: 'Maghrib', time: '06:52 PM' },
    { name: 'Isha', time: '08:04 PM' },
  ];

  const totalFundBalance = funds.reduce((acc, f) => acc + f.allocatedETB, 0);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-emerald-950 via-emerald-900 to-stone-900 text-white pt-12 sm:pt-20 pb-20 sm:pb-28 overflow-hidden">
        {/* Subtle geometric pattern overlay */}
        <IslamicPattern opacity={0.06} />

        {/* Ambient radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Islamic Basmalah & Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-700/80 text-amber-300 text-xs font-semibold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {language === 'ar'
                    ? 'المنصة الرقمية الموحدة لمنطقة جيما'
                    : language === 'om'
                    ? 'Sirna Bulchiinsa Majiilisa Godina Jimmaa'
                    : 'Unified Islamic Affairs Portal of Jimma Zone'}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15]">
                {language === 'ar' ? (
                  <>خدمة بيوت الله، رعاية التعليم القرآني، وتعزيز الوقف والتكافل</>
                ) : language === 'om' ? (
                  <>Masjiidota, Barumsa Quraanaa fi Hawaasa Islaamaa Godina Jimmaa Guddisuu</>
                ) : (
                  <>
                    Empowering Mosques, <span className="text-amber-300">Quranic Education</span>, and Community Welfare in Jimma.
                  </>
                )}
              </h1>

              {/* Subtext */}
              <p className="text-stone-300 text-base sm:text-lg max-w-2xl leading-relaxed mx-auto lg:mx-0">
                The centralized governance and public service platform for 18 administrative
                districts across Jimma Zone. Coordinating 128+ registered mosques, modern & traditional
                Madrasas, Fatwa guidance, and audited Zakat management.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Button
                  variant="gold"
                  size="lg"
                  icon={<HeartHandshake className="w-5 h-5" />}
                  onClick={() => navigate('/donate')}
                  className="font-bold shadow-lg"
                >
                  {t('donate')} to Council Funds
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  icon={<Building className="w-5 h-5 text-emerald-300" />}
                  onClick={() => navigate('/mosques')}
                  className="border-emerald-500/50 text-white hover:bg-emerald-800/40"
                >
                  Explore 128+ Mosques
                </Button>
              </div>

              {/* Trust & Governance Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-stone-300">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Shari'ah Compliant Oversight</span>
                </div>
                <span className="text-stone-600">•</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>Financial Stewardship</span>
                </div>
                <span className="text-stone-600">•</span>
                <div className="flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-blue-400" />
                  <span>18 Districts Coordinated</span>
                </div>
              </div>
            </div>

            {/* Right Card: Live Prayer Times & Daily Council Summary */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-stone-900/90 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <Clock className="w-4 h-4" />
                      <span>Jimma City Prayer Schedule</span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Standard Shafi'i / Hanafi calculation • Hijri 1447 AH
                    </p>
                  </div>
                  <Badge variant="emerald">Live Times</Badge>
                </div>

                {/* 6 Times Grid */}
                <div className="grid grid-cols-3 gap-2.5 mb-6">
                  {prayerTimes.map((p) => (
                    <div
                      key={p.name}
                      className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/80 text-center"
                    >
                      <span className="text-[11px] text-stone-400 block font-medium">
                        {p.name}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white font-mono mt-0.5 block">
                        {p.time}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Quick Service Application Launcher */}
                <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Public Civic Desk
                    </span>
                    <span className="text-[10px] text-emerald-300">Online Processing</span>
                  </div>
                  <p className="text-xs text-stone-300">
                    Apply for certified Nikah documents, calculate Zakat, or submit Janazah requests.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/services')}
                      className="text-xs justify-center"
                    >
                      Nikah & Marriage
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/services')}
                      className="text-xs justify-center"
                    >
                      Zakat Assessment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Council Statistics Ribbon */}
      <section id="stats" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20">
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200/90 dark:border-stone-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-stone-100 dark:divide-stone-800">
            {/* Stat 1: Mosques */}
            <div className="pt-3 md:pt-0 md:px-4 text-center md:text-left space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Building className="w-4 h-4" />
                <span>{t('mosques')}</span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 dark:text-stone-100">
                128+
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Registered across 18 districts
              </p>
            </div>

            {/* Stat 2: Madrasas & Students */}
            <div className="pt-3 md:pt-0 md:px-4 text-center md:text-left space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>{t('students')} Enrolled</span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 dark:text-stone-100">
                4,850+
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                In 45 Quranic & Hifz centers
              </p>
            </div>

            {/* Stat 3: Ulema & Mu'allims */}
            <div className="pt-3 md:pt-0 md:px-4 text-center md:text-left space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>{t('ulema')} & Teachers</span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 dark:text-stone-100">
                142+
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Certified scholars & Mu'allims
              </p>
            </div>

            {/* Stat 4: Funds & Zakat */}
            <div className="pt-3 md:pt-0 md:px-4 text-center md:text-left space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2 text-teal-700 dark:text-teal-400 text-xs font-bold uppercase tracking-wider">
                <HeartHandshake className="w-4 h-4" />
                <span>Managed Funds</span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 dark:text-stone-100">
                {(totalFundBalance / 1000000).toFixed(1)}M+
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                ETB allocated to community welfare
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mosques Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Building className="w-4 h-4" />
              <span>Sacred Spaces Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
              Featured Mosques of Jimma Zone
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
              Explore historic and central Jumu'ah mosques, prayer capacities, imams, and linked madrasas.
            </p>
          </div>
          <Link to="/mosques">
            <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              View All 128+ Mosques
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mosques.slice(0, 3).map((mosque) => (
            <Card key={mosque.id} hoverEffect className="flex flex-col justify-between">
              <div>
                {/* Image / Header banner */}
                <div className="h-44 rounded-xl overflow-hidden mb-4 relative bg-stone-800">
                  <img
                    src={mosque.imageUrl}
                    alt={mosque.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={mosque.status === 'Active' ? 'emerald' : 'gold'}>
                      {mosque.status}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-stone-950/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{mosque.district}</span>
                  </div>
                </div>

                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                  {mosque.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                  {mosque.description}
                </p>

                {/* Key metadata */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Imam Khatib:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {mosque.imam}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Prayer Capacity:</span>
                    <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                      {mosque.capacity.toLocaleString()} worshippers
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Linked Madrasa:</span>
                    <span className="text-amber-700 dark:text-amber-400 font-medium">
                      {mosque.madrasaName || 'Community Quran Circle'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-stone-100 dark:border-stone-800">
                <Link to={`/mosques/${mosque.id}`}>
                  <Button variant="secondary" size="sm" className="w-full justify-center text-xs">
                    View Mosque Profile & Schedule
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Interactive 18-District Geographic Map */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Zonal Coverage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
            Jimma Zone Administrative Districts
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            Click on any administrative district marker to view mosque counts, student enrollment, and local council desk.
          </p>
        </div>

        <JimmaDistrictMap />
      </section>

      {/* Madrasa Education & Hifz Spotlight */}
      <section className="bg-stone-100/80 dark:bg-stone-900/60 py-16 border-y border-stone-200/80 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Standardized Islamic Curricula</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Preserving Quranic Heritage with Modern Academic Excellence
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
                The Jimma Islamic Council oversees both classical Zawiya/Darasah institutions
                and accredited modern Madrasas across Oromia. We standardize Hifz milestones,
                Tajweed certifications, Arabic literacy, and moral character education.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Classical 30-Juz Hifz Tracking
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Sabaq (new lesson), Sabqi (weekly review), and Manzil (continuous retention).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Certified Mu'allim Faculty
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Teachers vetted with authentic Qira'at Sanads and pedagogical training.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Orphan & Needy Student Sponsorships
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      100% of education fund donations support board and tuition for students in need.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Link to="/madrasas">
                  <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                    Browse All Madrasas
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Featured Madrasas Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {madrasas.slice(0, 4).map((madrasa) => (
                <div
                  key={madrasa.id}
                  className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="gold">{madrasa.level}</Badge>
                      <span className="text-xs text-stone-500">{madrasa.district}</span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                      {madrasa.name}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                      {madrasa.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase">Students</span>
                        <span className="font-bold text-stone-900 dark:text-stone-100 font-mono">
                          {madrasa.totalStudents} Enrolled
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase">Head Teacher</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200 truncate block">
                          {madrasa.headTeacher}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <Link to={`/madrasas/${madrasa.id}`}>
                      <Button variant="secondary" size="sm" className="w-full justify-center text-xs">
                        View Madrasa Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Public Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            <HandHeart className="w-4 h-4" />
            <span>Civic & Community Support</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Public Services for the Jimma Ummah
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm">
            Convenient, accountable, and Shari'ah-compliant services accessible online or at district council desks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicServices.map((service) => (
            <div
              key={service.id}
              className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800">
                  <HandHeart className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="teal">{service.category}</Badge>
                  <span className="text-xs text-stone-400">• {service.processingTime}</span>
                </div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 mt-1">
                  {service.title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                  {service.shortDesc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-stone-500">
                  Fee: {service.feeETB}
                </span>
                <Link to={`/services?apply=${service.id}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    Apply Online
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive GIS Map Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <JimmaGisMiniWidget />
      </section>

      {/* Automated Communications & SMS Gateway Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-950 rounded-3xl p-6 sm:p-8 border border-emerald-800/60 shadow-xl relative overflow-hidden text-stone-100">
          <IslamicPattern opacity={0.06} />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-600 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  Ethio Telecom SMPP + Telegram Broadcast
                </span>
                <Badge variant="emerald" className="text-[10px]">
                  <Radio className="w-2.5 h-2.5 mr-1 animate-pulse" />
                  Live Dispatch
                </Badge>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Automated SMS Alerts & Community Broadcast Hub
              </h2>

              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                Connect directly with the Jimma Ummah. Automatically dispatch daily student Sabaq Hifz
                progress reports to parents, blast emergency Janazah announcements across 18 Woredas,
                and receive official Eid moon sighting declarations instantly on your handset.
              </p>

              <div className="flex flex-wrap gap-4 pt-1 text-xs text-stone-300">
                <div className="flex items-center gap-1.5 font-mono">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Shortcode: <strong>8345 (JIMMA-ISLAM)</strong></span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  <span>Telegram: <strong>@JimmaMuslimsOfficial (24.8k)</strong></span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-3">
              <Link to="/admin/gateway" className="w-full sm:w-auto lg:w-full">
                <Button variant="gold" size="md" className="w-full text-xs font-bold" icon={<Send className="w-4 h-4" />}>
                  Open Gateway Simulation
                </Button>
              </Link>
              <Link to="/announcements" className="w-full sm:w-auto lg:w-full">
                <Button variant="outline" size="md" className="w-full text-xs text-stone-300 border-stone-700 hover:bg-stone-800" icon={<Radio className="w-4 h-4 text-emerald-400" />}>
                  Live Public Feed
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Events & Council Announcements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upcoming Events (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Calendar</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                  Upcoming Council Events
                </h3>
              </div>
              <Link to="/events">
                <Button variant="ghost" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right" className="text-xs">
                  All Events
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-amber-300 flex flex-col items-center justify-center font-mono shrink-0 shadow-xs border border-emerald-700">
                      <span className="text-xs uppercase font-sans">
                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold leading-none">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="blue">{event.category}</Badge>
                        <span className="text-xs text-stone-500">{event.time}</span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                        {event.title}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        {event.location} • Keynote: {event.speaker}
                      </p>
                    </div>
                  </div>

                  <Link to="/events" className="shrink-0">
                    <Button variant="secondary" size="sm" className="text-xs w-full sm:w-auto">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Official Announcements (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Declarations</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                  Official Council Notices
                </h3>
              </div>
              <Link to="/announcements">
                <Button variant="ghost" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right" className="text-xs">
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={(ann.isUrgent || ann.priority === 'High') ? 'rose' : 'slate'}>
                      {(ann.isUrgent || ann.priority === 'High') ? 'Urgent / Decree' : ann.category}
                    </Badge>
                    <span className="text-[11px] text-stone-400 font-mono">{ann.date || ann.publishDate}</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Donation & Zakat Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-amber-500/30 shadow-2xl">
          <IslamicPattern opacity={0.06} />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                <HeartHandshake className="w-3.5 h-3.5" />
                Sadaqah Jariyah & Zakat ul-Mal
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                Support Jimma Islamic Council's Education & Welfare Funds
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Your contribution supports verified student scholarships, mosque renovations, and vulnerable
                families across Jimma Zone.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Button
                variant="gold"
                size="lg"
                icon={<HeartHandshake className="w-5 h-5" />}
                onClick={() => navigate('/donate')}
                className="font-bold text-center justify-center shadow-lg"
              >
                Donate Now Online
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
