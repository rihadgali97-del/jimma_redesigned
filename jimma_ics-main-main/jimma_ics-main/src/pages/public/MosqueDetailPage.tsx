import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Building,
  MapPin,
  Users,
  BookOpen,
  Calendar,
  Clock,
  Phone,
  HeartHandshake,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Navigation,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { QuickJanazahModal } from '../../components/gateway/QuickJanazahModal';

export const MosqueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { mosques = [], madrasas = [], addToast } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [isJanazahModalOpen, setIsJanazahModalOpen] = useState(false);

  const mosque =
    (mosques || []).find((m) => m.id === id) ||
    (mosques || [])[0] || {
      id: 'mosque-1',
      name: 'Grand Anwar Mosque of Jimma',
      arabicName: 'جامع الأنوار الكبير بجيما',
      district: 'Jimma Central',
      address: 'Merkato Center, Main Street, Jimma',
      imam: 'Sheikh Abdullah Ahmed Al-Jimmawi',
      muadhin: 'Ustadh Bilal Abdi',
      capacity: 5500,
      establishedYear: 1940,
      status: 'Active',
      facilities: ['Main Prayer Hall', 'Women Gallery', 'Wudhu Stations (120 taps)', 'Library & Manuscript Archive'],
      description: 'The historical spiritual epicenter of Jimma Zone, established in 1940.',
      contactPhone: '+251 47 111 8290',
    };

  const linkedMadrasa = (madrasas || []).find(
    (mad) => mad.id === mosque.madrasaId || mad.name === mosque.madrasaName || mad.mosqueId === mosque.id
  );

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Link Copied', 'Mosque profile URL copied to your clipboard.', 'info');
  };

  const facilitiesList = mosque.facilities || [];
  const imageSrc =
    mosque.image ||
    mosque.imageUrl ||
    'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/mosques"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mosques Directory</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Radio className="w-4 h-4 text-rose-600" />}
            onClick={() => setIsJanazahModalOpen(true)}
          >
            Janazah Broadcast
          </Button>
          <Button variant="ghost" size="sm" icon={<Share2 className="w-4 h-4" />} onClick={handleShare}>
            Share
          </Button>
          <Button
            variant="gold"
            size="sm"
            icon={<HeartHandshake className="w-4 h-4" />}
            onClick={() => navigate('/donate')}
          >
            Donate to Mosque Waqf
          </Button>
        </div>
      </div>

      {/* Mosque Hero Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual Image */}
        <div className="lg:col-span-5 h-64 lg:h-auto relative bg-stone-900 min-h-[260px]">
          <img
            src={imageSrc}
            alt={mosque.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4">
            <Badge variant="emerald">{mosque.status || 'Active'}</Badge>
          </div>
          <div className="absolute bottom-4 left-4 bg-stone-950/80 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {mosque.address || mosque.district}, {mosque.district}
            </span>
          </div>
        </div>

        {/* Right Details */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-400 font-mono mb-1">
              <span>Established: {mosque.establishedYear ? `${mosque.establishedYear} CE` : 'Not recorded'}</span>
              <span>•</span>
              <span>ID: {mosque.id}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
              {mosque.name}
            </h1>
            {mosque.arabicName && (
              <p className="font-serif text-amber-700 dark:text-amber-400 text-lg sm:text-xl font-medium mt-1" dir="rtl">
                {mosque.arabicName}
              </p>
            )}
            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base mt-2 leading-relaxed">
              {mosque.description}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700/60 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                Prayer Capacity
              </span>
              <span className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                {(mosque.capacity || 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                Kebele Office
              </span>
              <span className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 truncate block mt-1">
                {mosque.district}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                Friday Attendance
              </span>
              <span className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                {Math.round((mosque.capacity || 1000) * 0.95).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Content Layout: Key Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8-cols: Religious Staff, Linked Madrasa & Facilities */}
        <div className="lg:col-span-8 space-y-8">
          {/* Religious Leadership (Imam & Mu'adhin) */}
          <Card className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Imamate & Religious Leadership</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold font-serif text-sm">
                    IK
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">
                      Chief Imam Khatib
                    </span>
                    <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                      {mosque.imam}
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  Oversees daily 5-time congregational prayers, Friday Jumu'ah khutbah sermons, and community arbitration.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-bold font-serif text-sm">
                    M
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">
                      Official Mu'adhin
                    </span>
                    <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                      {mosque.muadhin || 'Ustadh Bilal Abdi'}
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  Call to prayer (Adhan), iqamah timings, acoustic maintenance, and Tahfeez assistance.
                </p>
              </div>
            </div>
          </Card>

          {/* Linked Madrasa */}
          <Card className="space-y-4 border-amber-300/60 dark:border-amber-900/60">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <span>Linked Quranic Madrasa & Hifz Center</span>
              </h3>
              {linkedMadrasa && (
                <Badge variant="gold">{linkedMadrasa.accreditationStatus || 'Accredited'}</Badge>
              )}
            </div>

            {linkedMadrasa ? (
              <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                      {linkedMadrasa.name}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                      Head Teacher: {linkedMadrasa.headTeacher}
                    </p>
                  </div>
                  <Link to={`/madrasas/${linkedMadrasa.id}`}>
                    <Button variant="secondary" size="sm" className="text-xs">
                      Inspect Madrasa File
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                    <span className="text-stone-400 block text-[10px] uppercase">Enrolled</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100 font-mono">
                      {linkedMadrasa.totalStudents} Students
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                    <span className="text-stone-400 block text-[10px] uppercase">Hifz Graduates</span>
                    <span className="font-bold text-emerald-600 font-mono">
                      {Math.round((linkedMadrasa.totalStudents || 100) * 0.22)}+ Huffaz
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                    <span className="text-stone-400 block text-[10px] uppercase">Faculty</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100 font-mono">
                      {linkedMadrasa.totalTeachers} Teachers
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                    <span className="text-stone-400 block text-[10px] uppercase">Shift</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {(linkedMadrasa.shifts || []).join(', ') || 'Morning, Afternoon'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500">
                Community Halaqat circles operate daily after Asr and Maghrib under the supervision of the resident Imam.
              </p>
            )}
          </Card>

          {/* Facilities & Infrastructure */}
          <Card className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
              Facilities & Infrastructure
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {facilitiesList.map((fac) => (
                <div
                  key={fac}
                  className="flex items-center gap-2 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700/60 text-xs text-stone-700 dark:text-stone-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 4-cols: Jumu'ah Schedule & Contact Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Jumu'ah Friday Prayer Box */}
          <div className="p-6 rounded-3xl bg-emerald-950 text-emerald-100 space-y-4 border border-emerald-800 shadow-lg">
            <div className="flex items-center justify-between border-b border-emerald-900 pb-3">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Friday Congregation (Jumu'ah)
              </span>
              <Badge variant="gold">Weekly</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-300">Khutbah Arabic:</span>
                <span className="font-mono font-bold text-white">12:30 PM</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-emerald-300">Salah Began:</span>
                <span className="font-mono font-bold text-white">01:00 PM</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-emerald-300">Language:</span>
                <span className="font-semibold text-amber-300">Afaan Oromoo & Arabic</span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-300/80 pt-2 border-t border-emerald-900 leading-relaxed">
              Arrive at least 30 minutes early. Dedicated women's gallery accessible via north entrance.
            </p>
          </div>

          {/* Contact & Kebele Secretariat Desk */}
          <Card className="space-y-4">
            <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              Mosque Administration Desk
            </h4>
            <div className="space-y-2.5 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{mosque.contactPhone || '+251 47 111 8290'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{mosque.address || mosque.district}, {mosque.district}</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => navigate('/contact')}
              >
                Contact Mosque Committee
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Janazah Modal */}
      <QuickJanazahModal
        isOpen={isJanazahModalOpen}
        onClose={() => setIsJanazahModalOpen(false)}
        defaultMosqueName={mosque.name}
        defaultDistrict={mosque.district}
      />
    </div>
  );
};
