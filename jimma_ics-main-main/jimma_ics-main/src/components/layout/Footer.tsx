import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import {
  Landmark,
  MapPin,
  Phone,
  Mail,
  Clock,
  Shield,
  HeartHandshake,
  ExternalLink,
  ChevronRight,
  Send,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
} from 'lucide-react';
import { IslamicPattern } from '../common/IslamicPattern';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const { addToast } = useApp();

  const socialLinks = [
    {
      id: 'footer-social-telegram',
      name: 'Telegram',
      handle: 't.me/emyc1',
      icon: <Send className="w-4 h-4 text-sky-400" />,
      hoverBorder: 'hover:border-sky-500/60 hover:bg-sky-950/40 hover:text-sky-300',
      tagColor: 'text-sky-400',
      href: 'https://t.me/emyc1',
      isPlaceholder: false,
      description: 'Official announcements, prayer schedules & emergency alerts',
    },
    {
      id: 'footer-social-facebook',
      name: 'Facebook',
      handle: 'Jimma Zone Islamic Affairs Council',
      icon: <Facebook className="w-4 h-4 text-blue-400" />,
      hoverBorder: 'hover:border-blue-500/60 hover:bg-blue-950/40 hover:text-blue-300',
      tagColor: 'text-blue-400',
      href: '#',
      isPlaceholder: true,
      description: 'Community news, Friday khutbah summaries & press releases',
    },
    {
      id: 'footer-social-instagram',
      name: 'Instagram',
      handle: '@jimma_islamic_council',
      icon: <Instagram className="w-4 h-4 text-rose-400" />,
      hoverBorder: 'hover:border-rose-500/60 hover:bg-rose-950/40 hover:text-rose-300',
      tagColor: 'text-rose-400',
      href: '#',
      isPlaceholder: true,
      description: 'Photo highlights, Islamic heritage & youth educational events',
    },
    {
      id: 'footer-social-youtube',
      name: 'YouTube',
      handle: 'Jimma Islamic Council Broadcast',
      icon: <Youtube className="w-4 h-4 text-red-400" />,
      hoverBorder: 'hover:border-red-500/60 hover:bg-red-950/40 hover:text-red-300',
      tagColor: 'text-red-400',
      href: '#',
      isPlaceholder: true,
      description: 'Recorded lectures, Ulema symposiums & Qur’an competitions',
    },
    {
      id: 'footer-social-twitter',
      name: 'X (Twitter)',
      handle: '@JimmaIslamic',
      icon: <Twitter className="w-4 h-4 text-stone-300" />,
      hoverBorder: 'hover:border-stone-500/60 hover:bg-stone-900 hover:text-white',
      tagColor: 'text-stone-300',
      href: '#',
      isPlaceholder: true,
      description: 'Official brief dispatches and institutional bulletins',
    },
  ];

  const handleSocialClick = (e: React.MouseEvent, item: (typeof socialLinks)[0]) => {
    if (item.isPlaceholder) {
      e.preventDefault();
      addToast(
        `${item.name} Link Placeholder`,
        `The official ${item.name} channel link (${item.handle}) is pending confirmation from the secretariat.`,
        'info'
      );
    }
  };

  return (
    <footer className="relative bg-stone-950 text-stone-300 pt-16 pb-24 border-t border-stone-800 overflow-hidden">
      {/* Decorative Islamic Star Pattern Watermark */}
      <IslamicPattern opacity={0.03} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-stone-800/80">
          {/* Col 1: Brand & Civic Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-amber-300 flex items-center justify-center border border-amber-400/40 shadow-lg">
                <Landmark className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white tracking-tight">
                  {language === 'ar'
                    ? 'مجلس الشؤون الإسلامية لمنطقة جيما'
                    : language === 'om'
                    ? 'Majiilisa Dhimmoota Islaamummaa Godina Jimmaa'
                    : 'Jimma Zone Islamic Affairs Supreme Council'}
                </h3>
                <p className="text-xs text-amber-400 font-sans">
                  Serving 18 Districts • Islamic Education • Zakat & Community Development
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Official digital institutional infrastructure for Jimma Zone, coordinating
              mosque administration, traditional and modern madrasa curricula, Fatwa guidance,
              Zakat disbursals, and public social welfare services.
            </p>

            <div className="pt-2 text-xs text-stone-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Central Secretariat Building, Grand Mosque Ave, Jimma City, Oromia, Ethiopia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+251 47 111 8842 / +251 47 111 9020</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>secretariat@jimmaislamiccouncil.org</span>
              </div>
            </div>

            {/* Official Social Media & Broadcast Channels */}
            <div className="pt-4 border-t border-stone-800/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-sans">
                  Official Channels & Social Media
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Telegram Active</span>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.id}
                    id={item.id}
                    href={item.href}
                    target={item.isPlaceholder ? undefined : '_blank'}
                    rel={item.isPlaceholder ? undefined : 'noopener noreferrer'}
                    onClick={(e) => handleSocialClick(e, item)}
                    title={
                      item.isPlaceholder
                        ? `${item.name} (${item.handle}) - ${item.description}`
                        : `Open official ${item.name} channel: ${item.handle}`
                    }
                    className={`group flex items-center justify-between p-2 rounded-xl bg-stone-900/80 border border-stone-800/90 text-stone-300 transition-all cursor-pointer ${item.hoverBorder}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0 p-1.5 rounded-lg bg-stone-950 border border-stone-800">
                        {item.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold leading-tight group-hover:text-white truncate">
                            {item.name}
                          </span>
                          {!item.isPlaceholder && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Active Link" />
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-stone-500 truncate group-hover:text-stone-300">
                          {item.handle}
                        </span>
                      </div>
                    </div>
                    {!item.isPlaceholder && (
                      <ExternalLink className="w-3 h-3 text-sky-400 opacity-60 group-hover:opacity-100 shrink-0 ml-1" />
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: Institutional Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans">
              Institutions
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/mosques" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Mosques Directory (128+)</span>
                </Link>
              </li>
              <li>
                <Link to="/madrasas" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Madrasas & Hifz Centers</span>
                </Link>
              </li>
              <li>
                <Link to="/ulema" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Ulema Scholars Directory</span>
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Interactive GIS Map (18 Woredas)</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Executive Leadership</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/students" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Students & Hifz Records</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Public Services & Welfare */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-sans">
              Public Services
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/services" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Nikah Registration & Certificate</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Zakat Calculator & Distribution</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Janazah & Burial Coordination</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Fatwa & Shari'ah Inquiries</span>
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Public Donation Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Governance & Transparency */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 font-sans">
              Governance
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/announcements" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Official Council Declarations</span>
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>Conferences & Mawlid Programs</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                  <span>{t('contact')} & Secretariat</span>
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Council Management Portal</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © 2026 Jimma Zone Islamic Affairs Supreme Council. All rights reserved.
          </div>

          {/* Quick social icon links in bottom bar */}
          <div className="flex items-center gap-2" id="footer-bottom-social-bar">
            <span className="text-[11px] text-stone-500 hidden sm:inline-block">Channels:</span>
            {socialLinks.map((item) => (
              <a
                key={`bottom-${item.id}`}
                id={`bottom-${item.id}`}
                href={item.href}
                target={item.isPlaceholder ? undefined : '_blank'}
                rel={item.isPlaceholder ? undefined : 'noopener noreferrer'}
                onClick={(e) => handleSocialClick(e, item)}
                title={
                  item.isPlaceholder
                    ? `${item.name}: ${item.handle} (Placeholder link)`
                    : `Visit official ${item.name}: ${item.handle}`
                }
                aria-label={`Official ${item.name}`}
                className={`p-2 rounded-lg bg-stone-900/90 border border-stone-800 text-stone-400 transition-colors cursor-pointer ${item.hoverBorder}`}
              >
                {item.icon}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-stone-400 text-center md:text-right">
              Verified Shari'ah Oversight Board • Jimma, Oromia, Ethiopia
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
