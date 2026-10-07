import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  HandHeart,
  FileCheck2,
  Clock,
  CheckCircle2,
  Search,
  ArrowRight,
  ShieldAlert,
  Send,
  Building,
  UserCheck,
  Calculator,
  Scale,
  Sparkles,
  HeartHandshake,
  BookOpen,
  Info,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ServiceItem } from '../../data/mockServices';
import { ZakatCalculator } from '../../components/services/ZakatCalculator';
import { IslamicPattern } from '../../components/common/IslamicPattern';
import { fetchDirectoryWoredas } from '../../services/directoryApi';
import { submitZakatApplication, trackZakatApplication } from '../../services/zakatApi';
import {
  JANAZAH_CATALOGUE_ID,
  submitJanazahRequest,
  trackJanazahRequest,
} from '../../services/janazahApi';
import { WaqfTransparencyPage } from './WaqfTransparencyPage';

async function resolveWoredaId(district: string) {
  const woredas = await fetchDirectoryWoredas();
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[-_]/g, ' ')
      .replace(/\b(town|district|woreda|sub city)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  const districtKey = normalize(district);
  const aliases: Record<string, string> = {
    'jimma central': 'jimma town',
    'jimma central hermata': 'jimma town',
  };
  const woreda = woredas.find((item) => {
    const code = normalize(item.code);
    const name = normalize(item.name);
    return code === (aliases[districtKey] || districtKey) || name === districtKey;
  });
  if (!woreda) throw new Error(`No registered woreda matches "${district}".`);
  return woreda.id;
}

const applicationStatusLabels: Record<string, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { publicServices, serviceRequests, submitServiceRequest, upsertServiceRequest, addToast, janazahPublicEnabled } = useApp();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [detailService, setDetailService] = useState<ServiceItem | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalogue' | 'zakat' | 'track' | 'waqf'>('catalogue');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [trackQuery, setTrackQuery] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [searchedRequest, setSearchedRequest] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [isTrackingApplication, setIsTrackingApplication] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'zakat') {
      setActiveTab('zakat');
    } else if (tabParam === 'track') {
      setActiveTab('track');
    } else if (tabParam === 'waqf') {
      setActiveTab('waqf');
    } else {
      setActiveTab('catalogue');
    }

    const applyId = searchParams.get('apply') || searchParams.get('service');
    if (applyId) {
      if (applyId === JANAZAH_CATALOGUE_ID && !janazahPublicEnabled) {
        setIsApplyModalOpen(false);
        setSelectedService(null);
        addToast(
          'Janazah intake unavailable',
          'The council has turned off online Janazah requests. Please use the 24/7 hotline.',
          'warning'
        );
        const next = new URLSearchParams(searchParams);
        next.delete('apply');
        next.delete('service');
        setSearchParams(next, { replace: true });
      } else {
        const match = publicServices.find((s) => s.id === applyId);
        if (match) {
          setSelectedService(match);
          setIsApplyModalOpen(true);
        }
      }
    }

    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }

    const trackParam = searchParams.get('trackingNo');
    if (trackParam) {
      setTrackQuery(trackParam);
      const found = serviceRequests.find(
        (r) => r.trackingNo.toLowerCase() === trackParam.toLowerCase().trim()
      );
      if (found) {
        setSearchedRequest(found);
      }
    }
  }, [searchParams, publicServices, serviceRequests, janazahPublicEnabled, setSearchParams]);

  // Form state
  const [applicantName, setApplicantName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Jimma Central');
  const [householdSize, setHouseholdSize] = useState('1');
  const [details, setDetails] = useState('');
  const [deceasedName, setDeceasedName] = useState('');
  const [needsGhusl, setNeedsGhusl] = useState(true);
  const [needsTransport, setNeedsTransport] = useState(true);
  const [needsCemeteryPlot, setNeedsCemeteryPlot] = useState(false);

  const isJanazahService = (service: ServiceItem | null) =>
    Boolean(
      service &&
        (service.id === JANAZAH_CATALOGUE_ID || service.title.toLowerCase().includes('janazah'))
    );

  const openApplication = (service: ServiceItem) => {
    setSelectedService(service);
    setIsApplyModalOpen(true);
  };

  const openDetails = (service: ServiceItem) => {
    setDetailService(service);
    setIsDetailModalOpen(true);
  };

  const handleTabChange = (tab: 'catalogue' | 'zakat' | 'track' | 'waqf') => {
    setActiveTab(tab);
    if (tab === 'catalogue') {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    publicServices.forEach((s) => set.add(s.category));
    return ['All', ...Array.from(set)];
  }, [publicServices]);

  const filteredServices = useMemo(() => {
    return publicServices.filter((s) => {
      const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
      const q = searchFilter.toLowerCase().trim();
      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        (s.arabicTitle && s.arabicTitle.includes(q)) ||
        s.shortDesc.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [publicServices, selectedCategory, searchFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !applicantName || !phone) {
      addToast('Missing Fields', 'Please fill in applicant name and phone number.', 'warning');
      return;
    }

    if (selectedService.title.toLowerCase().includes('zakat assistance')) {
      setIsSubmittingApplication(true);
      try {
        const woredaId = await resolveWoredaId(district);
        const application = await submitZakatApplication({
          woredaId,
          applicantFullName: applicantName.trim(),
          applicantPhone: phone.trim(),
          householdSize: Number(householdSize),
          eligibilityNotes: details.trim() || undefined,
        });
        const tracked = {
          trackingNo: application.referenceNumber,
          serviceType: 'Zakat Assistance',
          applicantName: applicantName.trim(),
          applicantPhone: phone.trim(),
          applicantDistrict: district,
          submissionDate: new Date(application.createdAt).toLocaleDateString(),
          status: 'Submitted',
          priority: 'Normal',
          documentsCount: 0,
          assignedOfficer: 'Not assigned',
          notes: details.trim() || 'Your application has been submitted to the Zakat team.',
        };
        setIsApplyModalOpen(false);
        setApplicantName('');
        setPhone('');
        setHouseholdSize('1');
        setDetails('');
        setTrackQuery(application.referenceNumber);
        setTrackPhone(tracked.applicantPhone);
        setActiveTab('track');
        setSearchedRequest(tracked);
        setSearchParams({ tab: 'track', trackingNo: application.referenceNumber });
        addToast('Zakat application submitted', `Save reference ${application.referenceNumber} to track your application.`, 'success');
      } catch (error) {
        addToast('Could not submit Zakat application', error instanceof Error ? error.message : 'Check your connection and try again.', 'error');
      } finally {
        setIsSubmittingApplication(false);
      }
      return;
    }

    if (isJanazahService(selectedService)) {
      if (!janazahPublicEnabled) {
        addToast(
          'Janazah intake unavailable',
          'The council has turned off online Janazah requests. Please use the 24/7 hotline.',
          'warning'
        );
        return;
      }
      if (!deceasedName.trim()) {
        addToast('Missing Fields', 'Please enter the deceased person’s full name.', 'warning');
        return;
      }
      setIsSubmittingApplication(true);
      try {
        const woredaId = await resolveWoredaId(district);
        const request = await submitJanazahRequest({
          woredaId,
          deceasedName: deceasedName.trim(),
          contactName: applicantName.trim(),
          contactPhone: phone.trim(),
          needsGhusl,
          needsTransport,
          needsCemeteryPlot,
          locationNote: details.trim() || undefined,
        });
        const tracked = {
          trackingNo: request.referenceNumber,
          serviceType: 'Janazah Support',
          applicantName: applicantName.trim(),
          applicantPhone: phone.trim(),
          applicantDistrict: district,
          submissionDate: new Date(request.createdAt).toLocaleDateString(),
          status: 'Submitted',
          priority: 'Urgent',
          documentsCount: 0,
          assignedOfficer: 'On-call Janazah desk',
          notes: [
            `Deceased: ${deceasedName.trim()}`,
            needsGhusl ? 'Ghusl requested' : null,
            needsTransport ? 'Transport requested' : null,
            needsCemeteryPlot ? 'Cemetery plot requested' : null,
            details.trim() || null,
          ]
            .filter(Boolean)
            .join(' • '),
        };
        setIsApplyModalOpen(false);
        setApplicantName('');
        setPhone('');
        setDeceasedName('');
        setNeedsGhusl(true);
        setNeedsTransport(true);
        setNeedsCemeteryPlot(false);
        setDetails('');
        upsertServiceRequest({
          id: `janazah-${Date.now()}`,
          trackingNo: request.referenceNumber,
          serviceType: 'Janazah Support',
          applicantName: applicantName.trim(),
          applicantPhone: phone.trim(),
          applicantDistrict: district,
          submissionDate: new Date(request.createdAt).toLocaleDateString(),
          status: 'Submitted',
          priority: 'Urgent',
          documentsCount: 0,
          assignedOfficer: 'On-call Janazah desk',
          notes: [
            `Deceased: ${deceasedName.trim()}`,
            needsGhusl ? 'Ghusl requested' : null,
            needsTransport ? 'Transport requested' : null,
            needsCemeteryPlot ? 'Cemetery plot requested' : null,
            details.trim() || null,
          ]
            .filter(Boolean)
            .join(' • '),
        });
        setTrackQuery(request.referenceNumber);
        setTrackPhone(tracked.applicantPhone);
        setActiveTab('track');
        setSearchedRequest(tracked);
        setSearchParams({ tab: 'track', trackingNo: request.referenceNumber });
        addToast(
          'Janazah request submitted',
          `Save reference ${request.referenceNumber}. An on-call officer will follow up urgently.`,
          'success'
        );
      } catch (error) {
        addToast(
          'Could not submit Janazah request',
          error instanceof Error ? error.message : 'Check your connection and try again.',
          'error'
        );
      } finally {
        setIsSubmittingApplication(false);
      }
      return;
    }

    const serviceCategoryMap: Record<string, any> = {
      'Zakat Assistance': 'Zakat Assistance',
      'Janazah': 'Janazah Support',
      'Counselling': 'Islamic Counselling',
      'Halal': 'Halal Certification Guidance',
      'Madrasa': 'Madrasa Registration',
      'Waqf': 'Mosque Land & Waqf Support',
      'Orphan': 'Orphan Sponsorship',
    };

    let resolvedType: any = 'Islamic Counselling';
    for (const key of Object.keys(serviceCategoryMap)) {
      if (selectedService.title.includes(key)) {
        resolvedType = serviceCategoryMap[key];
        break;
      }
    }

    const newReq = submitServiceRequest({
      serviceType: resolvedType,
      applicantName,
      applicantPhone: phone,
      applicantDistrict: district,
      notes: details || `Standard application for ${selectedService.title} by ${applicantName}`,
      documentsCount: (selectedService.requiredDocs || []).length,
      priority: selectedService.category === 'Funeral & Bereavement' ? 'Urgent' : 'Normal',
    });

    setIsApplyModalOpen(false);
    setApplicantName('');
    setPhone('');
    setDetails('');
    setTrackQuery(newReq.trackingNo);
    handleTabChange('track');
    setSearchedRequest(newReq);
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackQuery.toLowerCase().trim();
    if (!query) {
      addToast('Input Required', 'Please enter a tracking reference code.', 'warning');
      return;
    }
    if (query.startsWith('ZKT-')) {
      if (!trackPhone.trim()) {
        addToast('Phone number required', 'Enter the phone number used for the Zakat application.', 'warning');
        return;
      }
      setIsTrackingApplication(true);
      try {
        const result = await trackZakatApplication(trackQuery.trim(), trackPhone.trim());
        setSearchedRequest({
          trackingNo: result.referenceNumber,
          serviceType: 'Zakat Assistance',
          applicantName: result.applicantFullName,
          applicantPhone: trackPhone.trim(),
          applicantDistrict: 'Contact the Zakat desk for district information',
          submissionDate: new Date(result.createdAt).toLocaleDateString(),
          status: applicationStatusLabels[result.status] || result.status,
          priority: 'Normal',
          documentsCount: 0,
          assignedOfficer: 'Contact the Zakat desk for assistance',
          notes: 'This status is retrieved from the Zakat application service.',
        });
        addToast('Application located', 'Status retrieved from the Zakat application database.', 'success');
      } catch (error) {
        setSearchedRequest(null);
        addToast('Could not find Zakat application', error instanceof Error ? error.message : 'Check the reference and phone number.', 'error');
      } finally {
        setIsTrackingApplication(false);
      }
      return;
    }

    if (query.startsWith('JNZ-')) {
      if (!trackPhone.trim()) {
        addToast('Phone number required', 'Enter the contact phone number used for the Janazah request.', 'warning');
        return;
      }
      setIsTrackingApplication(true);
      try {
        const result = await trackJanazahRequest(trackQuery.trim(), trackPhone.trim());
        setSearchedRequest({
          trackingNo: result.referenceNumber,
          serviceType: 'Janazah Support',
          applicantName: result.deceasedName,
          applicantPhone: trackPhone.trim(),
          applicantDistrict: 'Contact the Janazah desk for district information',
          submissionDate: new Date(result.createdAt).toLocaleDateString(),
          status: applicationStatusLabels[result.status] || result.status,
          priority: 'Urgent',
          documentsCount: 0,
          assignedOfficer: 'Contact the Janazah desk for assistance',
          notes: `Deceased: ${result.deceasedName}. Status retrieved from the Janazah request service.`,
        });
        addToast('Request located', 'Status retrieved from the Janazah request database.', 'success');
      } catch (error) {
        setSearchedRequest(null);
        addToast(
          'Could not find Janazah request',
          error instanceof Error ? error.message : 'Check the reference and phone number.',
          'error'
        );
      } finally {
        setIsTrackingApplication(false);
      }
      return;
    }
    const found = serviceRequests.find(
      (r) => r.trackingNo.toLowerCase() === query || (r.id && r.id.toLowerCase() === query)
    );
    if (found) {
      setSearchedRequest(found);
      addToast('Application Located', `Found tracking record for ${found.applicantName}`, 'success');
    } else {
      setSearchedRequest(null);
      addToast('Tracking No Not Found', `No application with ID "${trackQuery}" was located.`, 'warning');
    }
  };

  const copyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    addToast('Copied', `Tracking #${code} copied to clipboard`, 'info');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
            <HandHeart className="w-4 h-4" />
            <span>Public Civic Desk & Shari'ah Services</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Council Public Services & Civic Affairs
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base mt-1 max-w-2xl">
            Official marriage certifications, Zakat evaluations & calculators, Janazah dispatch, and Fatwa inquiry processing.
          </p>
        </div>

        {/* Tab switch: Catalogue, Zakat Calculator, or Tracking */}
        <div className="flex flex-wrap items-center bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-xs">
          <button
            onClick={() => handleTabChange('catalogue')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'catalogue'
                ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Services Catalogue ({publicServices.length})
          </button>
          <button
            onClick={() => handleTabChange('zakat')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'zakat'
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Zakat Calculator</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse hidden sm:inline-block" />
          </button>
          <button
            onClick={() => handleTabChange('track')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'track'
                ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Application ({serviceRequests.length})</span>
          </button>
          <button
            onClick={() => handleTabChange('waqf')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'waqf'
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Waqf Registry</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Catalogue */}
      {activeTab === 'catalogue' && (
        <div className="space-y-8">
          {/* Featured Zakat Calculator Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 rounded-3xl p-6 sm:p-7 border border-emerald-800/80 shadow-xl relative overflow-hidden text-stone-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <IslamicPattern opacity={0.05} />
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="gold">Interactive Shari'ah Tool</Badge>
                <span className="text-[11px] text-amber-300 font-mono">Gold & Silver Nisab • Coffee Ushr • Livestock</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Need to Calculate Your Zakat or Agricultural Harvest (Ushr)?
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Use the official Jimma Islamic Council Zakat Calculator to input bank savings, 21k/24k gold,
                business stock at wholesale value, and Limmu/Agaro coffee harvests to instantly verify your Nisab and obligation.
              </p>
            </div>

            <div className="relative z-10 flex sm:flex-row md:flex-col items-center gap-2 shrink-0 w-full md:w-auto">
              <Button
                variant="gold"
                size="md"
                className="w-full sm:w-auto md:w-full text-xs font-bold"
                icon={<Calculator className="w-4 h-4" />}
                onClick={() => handleTabChange('zakat')}
              >
                Launch Zakat Calculator
              </Button>
            </div>
          </div>

          {/* Filtering and Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Keyword Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search services..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:border-emerald-500"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Services Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card key={service.id} hoverEffect className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="teal">{service.category}</Badge>
                    <span className="text-xs text-stone-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {service.processingTime}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                    {service.title}
                  </h3>
                  {service.arabicTitle && (
                    <p className="font-serif text-xs text-stone-400 dark:text-stone-500 dir-rtl mt-0.5">
                      {service.arabicTitle}
                    </p>
                  )}
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                    {service.shortDesc}
                  </p>

                  {/* Required Docs List */}
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2 text-xs">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">
                      Required Documents
                    </span>
                    <div className="space-y-1">
                      {(service.requiredDocs || []).map((doc) => (
                        <div key={doc} className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase block">Fee</span>
                    <span className="font-mono font-semibold text-stone-900 dark:text-stone-100 text-xs">
                      {service.feeETB}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Info className="w-3.5 h-3.5 text-stone-500" />}
                      onClick={() => openDetails(service)}
                      className="text-xs"
                      title="View Eligibility & How it Works"
                    >
                      Details
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<ArrowRight className="w-4 h-4" />}
                      iconPosition="right"
                      onClick={() => openApplication(service)}
                      className="text-xs"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
              <Info className="w-10 h-10 text-stone-400 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-lg text-stone-800 dark:text-stone-200">
                No matching services found
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Try selecting "All" or resetting your search filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-xs"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchFilter('');
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Interactive Zakat Calculator */}
      {activeTab === 'zakat' && (
        <ZakatCalculator
          onProceedToPaymentGateway={(amount) => {
            navigate(`/donate?tab=donate&amount=${amount}&fund=fund-4`);
          }}
          gatewayButtonText="Proceed to Donation Gateway with Calculated Zakat →"
        />
      )}

      {/* Mode 3: Tracking Desk */}
      {activeTab === 'track' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Track Your Council Service Application
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Enter a service tracking code, or a live database reference (ZKT-… / JNZ-…) with the phone number used at submission.
                </p>
              </div>
            </div>

            <form onSubmit={handleTrack} className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Tracking No (REQ-…, ZKT-…, or JNZ-…)"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden font-mono text-stone-900 dark:text-stone-100"
              />
              {(trackQuery.trim().toUpperCase().startsWith('ZKT-') ||
                trackQuery.trim().toUpperCase().startsWith('JNZ-')) && (
                <input
                  type="tel"
                  required
                  placeholder="Contact phone"
                  value={trackPhone}
                  onChange={(e) => setTrackPhone(e.target.value)}
                  className="w-full sm:w-48 px-3 py-2.5 text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden font-mono text-stone-900 dark:text-stone-100"
                />
              )}
              <Button variant="primary" type="submit" disabled={isTrackingApplication} icon={<Search className="w-4 h-4" />}>
                Track
              </Button>
            </form>

            {/* Quick Demo Reference Numbers */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2 flex-wrap text-xs text-stone-500">
              <span className="text-[11px] font-medium text-stone-400">Quick Test Codes:</span>
              {serviceRequests.slice(0, 3).map((req) => (
                <button
                  key={req.id}
                  type="button"
                  onClick={() => {
                    setTrackQuery(req.trackingNo);
                    setSearchedRequest(req);
                  }}
                  className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] rounded-md transition-colors cursor-pointer border border-stone-200 dark:border-stone-700"
                >
                  {req.trackingNo}
                </button>
              ))}
            </div>
          </Card>

          {searchedRequest && (
            <Card className="space-y-5 border-emerald-500/40 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-300">
                      Tracking #{searchedRequest.trackingNo}
                    </span>
                    <button
                      onClick={() => copyTracking(searchedRequest.trackingNo)}
                      className="text-stone-400 hover:text-emerald-700 transition-colors p-1"
                      title="Copy Tracking Number"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <h4 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 mt-1">
                    {searchedRequest.serviceType || searchedRequest.serviceName}
                  </h4>
                </div>
                <Badge
                  variant={
                    searchedRequest.status === 'Completed' || searchedRequest.status === 'Disbursed'
                      ? 'emerald'
                      : searchedRequest.status === 'Approved'
                      ? 'teal'
                      : searchedRequest.status === 'Under Review'
                      ? 'blue'
                      : 'gold'
                  }
                  size="md"
                >
                  Status: {searchedRequest.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Applicant</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {searchedRequest.applicantName}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Contact Phone</span>
                  <span className="font-mono text-stone-800 dark:text-stone-200">
                    {searchedRequest.applicantPhone || searchedRequest.phone}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">District Desk</span>
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {searchedRequest.applicantDistrict || searchedRequest.district}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Submission Date</span>
                  <span className="font-mono text-stone-800 dark:text-stone-200">
                    {searchedRequest.submissionDate}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Priority</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {searchedRequest.priority || 'Normal'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Documents</span>
                  <span className="font-mono text-stone-800 dark:text-stone-200">
                    {searchedRequest.documentsCount ?? 0} files attached
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-stone-400 block text-[10px] uppercase">Assigned Council Officer</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">
                    {searchedRequest.assignedOfficer}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs">
                <span className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Application Summary & Case Notes:
                </span>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  {searchedRequest.notes || searchedRequest.details || 'Standard Shari’ah document processing in progress.'}
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'waqf' && <WaqfTransparencyPage embedded />}

      {/* Service Details & Step-by-Step Modal */}
      {detailService && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={detailService.title}
          subtitle={`${detailService.category} • Official Jimma Council Desk`}
        >
          <div className="space-y-5 text-xs sm:text-sm">
            {detailService.arabicTitle && (
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 font-serif text-right text-emerald-800 dark:text-emerald-300 text-base dir-rtl">
                {detailService.arabicTitle}
              </div>
            )}

            <div>
              <h5 className="font-bold text-stone-800 dark:text-stone-200 uppercase text-[11px] tracking-wider mb-1">
                Overview
              </h5>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                {detailService.fullDesc || detailService.shortDesc}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60">
              <h5 className="font-bold text-amber-900 dark:text-amber-300 uppercase text-[11px] tracking-wider mb-1">
                Eligibility Criteria
              </h5>
              <p className="text-amber-800 dark:text-amber-200 leading-relaxed text-xs">
                {detailService.eligibility}
              </p>
            </div>

            <div>
              <h5 className="font-bold text-stone-800 dark:text-stone-200 uppercase text-[11px] tracking-wider mb-2">
                Step-by-Step Procedure
              </h5>
              <div className="space-y-2">
                {(detailService.howItWorks || []).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-stone-600 dark:text-stone-300 leading-relaxed text-xs">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-bold text-stone-800 dark:text-stone-200 uppercase text-[11px] tracking-wider mb-2">
                Required Documents
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(detailService.requiredDocs || []).map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60 text-xs text-stone-700 dark:text-stone-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Processing Time</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{detailService.processingTime}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Official Fee</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{detailService.feeETB}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-stone-400 block text-[10px] uppercase">Desk Officer</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">{detailService.contactPerson}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <Button
                variant="ghost"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  openApplication(detailService);
                }}
              >
                Proceed to Online Application
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Service Application Modal */}
      {selectedService && (
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title={`Apply for: ${selectedService.title}`}
          subtitle={`Processing Time: ${selectedService.processingTime} • Standard Shari'ah Compliance Review`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {isJanazahService(selectedService) ? 'Family / Contact Full Name *' : 'Applicant Full Name *'}
              </label>
              <input
                type="text"
                required
                placeholder={
                  isJanazahService(selectedService)
                    ? 'e.g. Family contact for dispatch'
                    : 'e.g. Ustadh Fuad Mohammed'
                }
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden focus:border-emerald-500 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +251 91 765 4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden text-stone-900 dark:text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  District Desk *
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                >
                  <option value="Jimma Central">Jimma Central (Hermata)</option>
                  <option value="Agaro Town">Agaro Town</option>
                  <option value="Kersa District">Kersa District</option>
                  <option value="Mana District">Mana District</option>
                  <option value="Gomma District">Gomma District</option>
                  <option value="Limmu Kosa">Limmu Kosa</option>
                  <option value="Seka Chekorsa">Seka Chekorsa</option>
                  <option value="Dedo District">Dedo District</option>
                  <option value="Omo Nada">Omo Nada</option>
                </select>
              </div>
            </div>

            {selectedService.title.toLowerCase().includes('zakat assistance') && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Household size *</label>
                <input type="number" min="1" max="100" required value={householdSize} onChange={(event) => setHouseholdSize(event.target.value)} className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden text-stone-900 dark:text-stone-100" />
              </div>
            )}

            {isJanazahService(selectedService) && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Deceased Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Haji Abadiga Mohammed"
                    value={deceasedName}
                    onChange={(e) => setDeceasedName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden focus:border-emerald-500 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 cursor-pointer">
                    <input type="checkbox" checked={needsGhusl} onChange={(e) => setNeedsGhusl(e.target.checked)} className="rounded" />
                    Needs Ghusl / shrouding
                  </label>
                  <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 cursor-pointer">
                    <input type="checkbox" checked={needsTransport} onChange={(e) => setNeedsTransport(e.target.checked)} className="rounded" />
                    Needs hearse transport
                  </label>
                  <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 cursor-pointer">
                    <input type="checkbox" checked={needsCemeteryPlot} onChange={(e) => setNeedsCemeteryPlot(e.target.checked)} className="rounded" />
                    Needs cemetery plot
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {isJanazahService(selectedService)
                  ? 'Location / pickup notes'
                  : 'Specific Request Notes / Case Summary'}
              </label>
              <textarea
                rows={3}
                placeholder={
                  isJanazahService(selectedService)
                    ? 'Hospital, home address, mosque for Salatul Janazah, or other urgent details...'
                    : 'Provide any relevant details, names of witnesses, or specific dates...'
                }
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden text-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="font-bold">Required to present at interview:</div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-800 dark:text-emerald-300">
                {(selectedService.requiredDocs || []).map((doc) => (
                  <li key={doc}>{doc}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmittingApplication}
                icon={<Send className="w-4 h-4" />}
              >
                Submit Application
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
