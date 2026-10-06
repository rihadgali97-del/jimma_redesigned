import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Building,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Search,
  FileCheck2,
  ChevronDown,
  Globe,
  Radio,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const ContactPage: React.FC = () => {
  const { addToast } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('General Secretariat');
  const [inquiryType, setInquiryType] = useState('General');
  const [message, setMessage] = useState('');
  const [submittedInquiry, setSubmittedInquiry] = useState<{
    id: string;
    name: string;
    department: string;
    timestamp: string;
  } | null>(null);

  // FAQ Filter
  const [faqSearch, setFaqSearch] = useState('');
  const [selectedFaqCat, setSelectedFaqCat] = useState('All');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');

  const faqs = [
    {
      id: 'faq-1',
      category: 'Services & Marriage',
      question: 'How do I obtain an official Islamic Marriage (Nikah) Certificate in Jimma?',
      answer:
        'You can register online through our Civic Services Desk on the Services page. Required documents include Kebele IDs of both bride and groom, two witnesses, and agreement with the officiating Imam at your registered local mosque.',
    },
    {
      id: 'faq-2',
      category: 'Zakat & Waqf',
      question: 'How is Agricultural Ushr on coffee harvest calculated and distributed in Jimma Zone?',
      answer:
        'For naturally rain-watered coffee farms in Limmu, Agaro, and Gomma woredas, the rate is 10% of harvest output when exceeding the 5 Wasq threshold (~653 kg). The Jimma Council Zakat Department conducts transparent distribution to verified local Asnaf beneficiaries across the zone.',
    },
    {
      id: 'faq-3',
      category: 'Education & Hifz',
      question: 'How can a madrasa register or affiliate with the Jimma Islamic Education Board?',
      answer:
        'Madrasa headmasters can apply through the Madrasas Portal. The council dispatches an inspection committee to assess curriculum standards, Tajweed qualifications of teachers, and safety facilities before issuing formal accreditation.',
    },
    {
      id: 'faq-4',
      category: 'Fatwa & Arbitration',
      question: 'How do I submit a question or dispute to the Ulema & Fatwa Advisory Panel?',
      answer:
        'Inquiries can be submitted directly through our online Public Services portal or during weekly office hours at the Grand Anwar Mosque Council Complex on Mondays and Thursdays.',
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
    const matchesCat = selectedFaqCat === 'All' || faq.category === selectedFaqCat;
    return matchesSearch && matchesCat;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      addToast('Missing Required Fields', 'Please complete all form fields.', 'warning');
      return;
    }

    const ticketId = `INQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedInquiry({
      id: ticketId,
      name,
      department,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    addToast(
      'Inquiry Dispatched Successfully',
      `Ticket #${ticketId} registered with the ${department}. We will reach out via ${phone}.`,
      'success'
    );
  };

  const handleResetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
    setSubmittedInquiry(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
            <Phone className="w-4 h-4" />
            <span>Council Secretariat HQ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Contact & Council Desks
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base mt-1 max-w-2xl">
            Get in touch with executive officers, district coordinators, religious desks, or submit public inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Badge variant="emerald" size="md">
            Live Secretariat Desk
          </Badge>
          <span className="text-stone-400 hidden sm:inline">• Response within 24-48h</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Contact Form or Confirmation Card */}
        <div className="lg:col-span-7">
          {submittedInquiry ? (
            <Card className="space-y-6 bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-500/40 p-6 sm:p-8 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div className="text-center space-y-2">
                <Badge variant="emerald">Ticket Dispatched</Badge>
                <h3 className="font-serif font-bold text-2xl text-stone-900 dark:text-stone-100">
                  Inquiry Successfully Received
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto">
                  Jazakallahu Khayran, Brother/Sister {submittedInquiry.name}. Your inquiry has been routed to the{' '}
                  <strong className="text-stone-900 dark:text-stone-100">{submittedInquiry.department}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800/80 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-stone-400">Tracking Reference:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{submittedInquiry.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Target Desk:</span>
                  <span className="text-stone-800 dark:text-stone-200">{submittedInquiry.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Recorded At:</span>
                  <span className="text-stone-800 dark:text-stone-200">{submittedInquiry.timestamp}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleResetForm}
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  Send Another Inquiry
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  icon={<FileCheck2 className="w-3.5 h-3.5" />}
                >
                  Print Confirmation Slip
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
                  Send an Official Inquiry
                </h3>
                <span className="text-xs text-stone-400">All fields with * are required</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Brother Ahmed Kebede"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden focus:border-emerald-500 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Phone / Telegram *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +251 91 234 5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden focus:border-emerald-500 text-stone-900 dark:text-stone-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden focus:border-emerald-500 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                    >
                      <option value="General">General Question</option>
                      <option value="Nikah">Marriage / Nikah Certificate</option>
                      <option value="Zakat">Zakat & Harvest Ushr</option>
                      <option value="Madrasa">Madrasa Enrollment / Affiliation</option>
                      <option value="Fatwa">Shari'ah / Fatwa Board Inquiry</option>
                      <option value="Mosque">Mosque Expansion / Waqf Support</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Target Department / Council Desk
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-medium"
                  >
                    <option value="General Secretariat">General Secretariat</option>
                    <option value="Madrasa Education Board">Madrasa Education Board</option>
                    <option value="Zakat & Waqf Affairs">Zakat & Waqf Affairs</option>
                    <option value="Ulema & Fatwa Advisory Panel">Ulema & Fatwa Advisory Panel</option>
                    <option value="Civic & Nikah Registration">Civic & Nikah Registration</option>
                    <option value="Mosque Expansion & Engineering">Mosque Expansion & Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Inquiry Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry, proposal, or question in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden focus:border-emerald-500 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  icon={<Send className="w-4 h-4" />}
                  className="w-full justify-center text-sm font-semibold"
                >
                  Dispatch Inquiry
                </Button>
              </form>
            </Card>
          )}
        </div>

        {/* Right: Council Headquarter Info & Emergency Desks */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              Headquarters Location & Visiting Hours
            </h3>

            <div className="space-y-3.5 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-stone-900 dark:text-stone-100 block">
                    Central Council Complex
                  </span>
                  <span>Grand Anwar Mosque Complex, Main Avenue, Jimma, Oromia, Ethiopia</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-stone-900 dark:text-stone-100 block">
                    Official Working Hours
                  </span>
                  <span>Monday – Friday: 8:30 AM – 4:30 PM</span>
                  <span className="block text-[11px] text-stone-400 mt-0.5">
                    Saturday: 9:00 AM – 1:00 PM (Public Halaqah only) • Sunday: Closed
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-stone-900 dark:text-stone-100 block">
                    Council Switchboard & Hotline
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    +251 47 111 2345 / +251 91 765 4321
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-stone-900 dark:text-stone-100 block">
                    Official Secretariat Email
                  </span>
                  <span className="font-mono">secretariat@jimmaislamiccouncil.org</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Regional District Liaison Desks */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                Sub-Zonal District Liaison Desks
              </h4>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">
                18 Woredas
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700/60 flex items-center justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                <div>
                  <span className="font-semibold text-stone-800 dark:text-stone-200 block">Agaro Town Desk</span>
                  <span className="text-[11px] text-stone-400">Nur Mosque Complex</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-600 font-bold">+251 47 222 1010</span>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700/60 flex items-center justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                <div>
                  <span className="font-semibold text-stone-800 dark:text-stone-200 block">Mana / Yebu Desk</span>
                  <span className="text-[11px] text-stone-400">Bilal Center</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-600 font-bold">+251 47 333 4512</span>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700/60 flex items-center justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                <div>
                  <span className="font-semibold text-stone-800 dark:text-stone-200 block">Gomma / Limmu Desk</span>
                  <span className="text-[11px] text-stone-400">Limmu Genet Secretariat</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-600 font-bold">+251 47 444 8920</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Interactive FAQ Section */}
      <div className="space-y-4 pt-6 border-t border-stone-200 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Quick answers about public certifications, Zakat evaluations, and council services.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? 'border-emerald-300 dark:border-emerald-800/80 bg-white dark:bg-stone-900 shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 hover:bg-stone-100/80'
                }`}
              >
                <button
                  onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 transition-transform ${
                      isExpanded ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed border-t border-stone-100 dark:border-stone-800 mt-1">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
