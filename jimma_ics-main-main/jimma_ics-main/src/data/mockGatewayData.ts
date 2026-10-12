import { DispatchLogItem } from '../types';

export interface MessageTemplate {
  id: string;
  name: string;
  category: DispatchLogItem['category'];
  defaultChannel: DispatchLogItem['channel'];
  languages: {
    en: string;
    om: string;
    ar: string;
  };
}

export const gatewayTemplates: MessageTemplate[] = [
  {
    id: 'sabaq-daily-progress',
    name: 'Daily Sabaq & Hifz Progress to Guardian',
    category: 'sabaq_alert',
    defaultChannel: 'sms',
    languages: {
      en: "Jimma Islamic Supreme Council - {MadrasaName}\n\nAssalamu Alaykum {ParentName},\nDaily Hifz Report for {StudentName}:\n📖 Sabaq: {SabaqLesson}\n🔄 Sabqi: {SabqiJuz}\n📚 Manzil: {ManzilJuz}\n✨ Tajweed: {TajweedRating}\n📍 Attendance: {AttendanceStatus}\n\nJazakallahu Khayran.",
      om: "Majiilisa Dhimmoota Islaamummaa Jimmaa - {MadrasaName}\n\nNagaan isiniif haa tahu {ParentName},\nGabaasa Hifzii Guyyaa Barataa {StudentName}:\n📖 Sabaq: {SabaqLesson}\n🔄 Sabqii: {SabqiJuz}\n📚 Manzil: {ManzilJuz}\n✨ Qulqullina Tajwiidaa: {TajweedRating}\n📍 Argama: {AttendanceStatus}\n\nGalatoomaa.",
      ar: "المجلس الأعلى للشؤون الإسلامية بجيما - {MadrasaName}\n\nالسلام عليكم ورحمة الله {ParentName}،\nتقرير الحفظ اليومي للطالب {StudentName}:\n📖 السبق: {SabaqLesson}\n🔄 السبقي: {SabqiJuz}\n📚 المنزل: {ManzilJuz}\n✨ التجويد: {TajweedRating}\n📍 الحضور: {AttendanceStatus}\n\nجزاكم الله خيراً.",
    },
  },
  {
    id: 'janazah-urgent-broadcast',
    name: 'Emergency Janazah & Funeral Broadcast',
    category: 'janazah_broadcast',
    defaultChannel: 'hybrid',
    languages: {
      en: "JANAZAH PRAYER ANNOUNCEMENT - JIMMA CITY\n\n'Inna lillahi wa inna ilayhi raji'un'\n\nJanazah prayer for the late {DeceasedName} ({Age} yrs, {Kebele}) will take place:\nTime: {JanazahTime}\nMosque: {MosqueName}\nBurial: {Cemetery}\n\nMay Allah grant them Jannatul Firdaws. All are requested to attend.",
      om: "BEEKSIISA JANAASAA ARIIFACHISA - ZOOONII JIMMAA\n\n'Innaa lillaahi wa innaa ilayhi raaji'uun'\n\nSalaanni Janaizaa Obbo/Aaddee {DeceasedName} ({Age}, {Kebele}) ni gaggeeffama:\nSa'aatii: {JanazahTime}\nMasjiida: {MosqueName}\nAwwaalcha: {Cemetery}\n\nRabbii Jannata haa kennuuf. Hundi keessan akka hirmaattan kabajaan affeeramtaniittu.",
      ar: "إعلان جنازة عاجل - منطقة جيما\n\n'إنا لله وإنا إليه راجعون'\n\nستقام صلاة الجنازة على المرحوم/ة {DeceasedName} ({Age} عاماً، {Kebele}):\nالموعد: {JanazahTime}\nالمسجد: {MosqueName}\nالدفن: {Cemetery}\n\nنسأل الله له/ا الفردوس الأعلى.",
    },
  },
  {
    id: 'moon-sighting-communique',
    name: 'Moon Sighting / Eid / Ramadan Communique',
    category: 'moon_sighting',
    defaultChannel: 'telegram',
    languages: {
      en: "🌙 COUNCIL ANNOUNCEMENT: CRESCENT SIGHTING / EID\n\nOccasion: {Occasion}\nHijri date: {HijriDate}\nLocation: {Location}\nPrayer time: {PrayerTime}\nImam / Khateeb: {ImamKhateeb}\n\n{CouncilMessage}",
      om: "🌙 BEEKSISA MAJIILAA: BAATII ARGUU / IIDA\n\nAyyaana: {Occasion}\nGuyyaa Hijri: {HijriDate}\nIddoo: {Location}\nSa'aatii salaataa: {PrayerTime}\nImaama / Khaxiibaa: {ImamKhateeb}\n\n{CouncilMessage}",
      ar: "🌙 إعلان المجلس: رؤية الهلال / العيد\n\nالمناسبة: {Occasion}\nالتاريخ الهجري: {HijriDate}\nالمكان: {Location}\nوقت الصلاة: {PrayerTime}\nالإمام / الخطيب: {ImamKhateeb}\n\n{CouncilMessage}",
    },
  },
  {
    id: 'unified-khutbah-advisory',
    name: 'Unified Friday Khutbah Topic Advisory',
    category: 'khutbah_advisory',
    defaultChannel: 'telegram',
    languages: {
      en: "🕌 JUMU'AH KHUTBAH ADVISORY\n\nDate: {Date}\nTopic: {KhutbahTheme}\nKey focus: {KeyFocus}\nCommunity guidance: {Directives}\n\n{CouncilMessage}",
      om: "🕌 QAJEEFFAMA KHUXBAA JUM'AA\n\nGuyyaa: {Date}\nMata-duree: {KhutbahTheme}\nXiyyeeffannoo: {KeyFocus}\nQajeelfama hawaasaa: {Directives}\n\n{CouncilMessage}",
      ar: "🕌 توجيهات خطبة الجمعة\n\nالتاريخ: {Date}\nالموضوع: {KhutbahTheme}\nمحور التركيز: {KeyFocus}\nإرشادات المجتمع: {Directives}\n\n{CouncilMessage}",
    },
  },
  {
    id: 'absentee-parent-alert',
    name: 'Daily Student Absentee / Late SMS Alert',
    category: 'sabaq_alert',
    defaultChannel: 'sms',
    languages: {
      en: "Jimma Islamic Council Alert: Respected {ParentName}, your student {StudentName} was recorded as {AttendanceStatus} today ({Date}) at {MadrasaName}. For inquiries, contact Mu'allim at {TeacherPhone}.",
      om: "Beeksisa Majiilisa Jimmaa: Kabajamoo {ParentName}, barataan keessan {StudentName} har'a ({Date}) {MadrasaName} irratti akka {AttendanceStatus} galmaa'ee jira. Qunnamtiif: {TeacherPhone}.",
      ar: "تنبيه مجلس جيما الإسلامي: المكرم {ParentName}، نفيدكم بأن الطالب {StudentName} قد سُجل {AttendanceStatus} اليوم ({Date}) في {MadrasaName}. للاستفسار: {TeacherPhone}.",
    },
  },
];
