import { CouncilResource } from '../types';

export const initialCouncilResources: CouncilResource[] = [
  {
    id: 'res-1',
    title: 'Standard Friday Khutbah: Social Solidarity & Mutual Assistance (Takaful)',
    arabicTitle: 'خطبة الجمعة الموحدة: التكافل الاجتماعي والتراحم في الإسلام',
    oromoTitle: 'Xiba Jim’ataa: Tokkummaa fi Waliin-Dhaabbannaa Hawaasummaa (Takaaful)',
    category: 'Khutbah Template',
    subCategory: 'Friday Sermon',
    targetInstitution: 'Mosques Only',
    targetAudience: 'Imams, Khateebs & Mosque Committees',
    language: 'Multilingual',
    format: 'PDF',
    fileSize: '1.4 MB',
    downloadUrl: '#',
    uploadedBy: 'Sheikh Mustafa Jamal (Fatwa Board)',
    author: 'Supreme Shari’ah & Ifta Directorate of Jimma Zone',
    department: 'Shariah & Fatwa Board',
    uploadDate: '2026-08-25',
    hijriDate: '13 Safar 1448 AH',
    downloadsCount: 480,
    isFeatured: true,
    isPinnedForJummah: true,
    seasonOrOccasion: 'Upcoming Jummah / General Ethics',
    description: 'A comprehensive Friday sermon template with vocalized Arabic Quranic proofs, authentic Hadith citations, and parallel Afaan Oromoo & English explanations focusing on assisting vulnerable households, orphans, and students of knowledge.',
    summaryPoints: [
      'First Khutbah: Quranic injunctions on Takaful (Surah Al-Ma’idah: 2) and prophetic traditions on brotherhood.',
      'Practical local applications: Supporting community Zakat desks, feeding students in rural tahfeez centers, and winter clothing aid.',
      'Second Khutbah: Du’a for unity, peace across Ethiopia, rainfall blessing, and protection of public waqf.',
      'Includes 12-minute and 18-minute delivery pacing guides for Khateebs.'
    ],
    tags: ['Khutbah', 'Jummah', 'Takaful', 'Brotherhood', 'Arabic-Oromo', 'Sermon Template'],
    previewContent: {
      arabicText: `الخطبة الأولى:
الحمد لله الذي جعل المؤمنين إخوة متحابين، وحثهم على التعاون على البر والتقوى، ونهاهم عن التفرق والعدوان. وأشهد أن لا إله إلا الله وحده لا شريك له، جعل التكافل سمة الأمة المرحومة، وأشهد أن سيدنا ونبينا محمداً عبده ورسوله، القائل: «مثل المؤمنين في توادهم وتراحمهم وتعاطفهم مثل الجسد إذا اشتكى منه عضو تداعى له سائر الجسد بالسهر والحمى». اللهم صل وسلم وبارك عليه وعلى آله وأصحابه أجمعين.

أما بعد، فيا عباد الله: اتقوا الله تعالى حق التقوى، واعلموا أن من أعظم مقاصد شريعتنا الغراء ترسيخ روح التكافل بين أفراد المجتمع، فلا يبيت مؤمن شبعاناً وجاره إلى جنبه جائع وهو يعلم. إن إخوانكم من الفقراء والمساكين وطلبة العلم في كتاتيب القرآن الكريم ينتظرون مد يد العون والإحسان.

الخطبة الثانية:
الحمد لله حمداً كثيراً طيباً مباركاً فيه... أوصيكم عباد الله بالإكثار من الصدقات، ورعاية بيوت الله، ومساندة لجان المساجد في مشاريعها الخيرية. اللهم اغفر للمسلمين والمسلمات، وأصلح أحوالنا في جيما وفي سائر بلاد المسلمين، ووفق أئمتنا وولاة أمورنا لما تحبه وترضاه.`,
      translationOromo: `Xiba Tokkoffaa:
Faaruun hundi kan Rabbii mu’uminoota obbolaa wal-jaallatan godhee, toltuu fi sodaa Rabbii irratti wal-gargaaruu ajajee, wal-dhabdee fi badii irraa dhoorkeefi. Ragaan baha Rabbummaan malee dhugaan gabbaramaan akka hin jirre, Nabi Muhammadis (SAW) gabrichaafi ergamaa Isaati. Ergamaan Rabbii akkana jedhan: "Fakkeenyi mu'umintootaa jaalala, gara-laafummaa fi wal-mararfannaa keessatti akka qaama tokkooti; yoo kutaan tokko dhukkubsate qaamni hundi hirriba dhabuu fi ho’aan wajjin waxalama."

Yaa gabroota Rabbii! Dhugumatti Takaaful (waliin-dhaabbannaan) amantii keenya keessatti utubaa guddaadha. Hiyyeeyyii, daa’imman yatiimaa fi barattoota qur’aana baratan gargaaruun dirqama hawaasummaati.`,
      translationEnglish: `First Sermon Excerpt:
All praise belongs to Allah Who unified the believers as caring brethren and commanded mutual cooperation upon righteousness and piety. The Prophet (peace and blessings be upon him) said: "The believers in their mutual kindness, compassion, and sympathy are just like one body; when one limb suffers, the whole body responds with wakefulness and fever."

Khateeb Practical Action Plan:
Encourage worshippers to contribute to the local mosque waqf welfare box, check on elderly neighbors before Maghrib, and support regional tahfeez students who travel from rural districts.`,
      keyThemes: ['Mutual Solidarity (Takaful)', 'Compassion & Charity', 'Preserving Community Ties', 'Support for Madrasa Students'],
      tableOfContents: [
        '1. Khutbah Khutbat-ul-Haajah (Arabic Opening)',
        '2. Core Theological Injunctions on Mutual Aid',
        '3. Practical Community Examples in Jimma Zone',
        '4. Second Khutbah Arabic & Afaan Oromoo Translations',
        '5. Recommended Supplications (Ad’iyah)'
      ],
      sampleExcerpt: 'Standard 15-minute Friday Khutbah text endorsed by Jimma Zone Islamic Affairs Supreme Council for all Jami’ mosques.'
    }
  },
  {
    id: 'res-2',
    title: 'Tahfeez & Tajweed Standardized Curriculum Framework (Levels 1 to 3)',
    arabicTitle: 'المنهج النموذجي الموحد لحفظ القرآن الكريم وتجويده لمدارس منطقة جيما',
    oromoTitle: 'Sirna Barnoota Qor’aana Qulqulluu fi Tajwiidaa Qindaa’aa (Sadarkaa 1-3)',
    category: 'Educational Material',
    subCategory: 'Madrasa Curriculum',
    targetInstitution: 'Madrasas Only',
    targetAudience: 'Madrasa Directors, Mu’allims & Hifz Supervisors',
    language: 'Multilingual',
    format: 'PDF',
    fileSize: '5.8 MB',
    downloadUrl: '#',
    uploadedBy: 'Ustadh Fuad Jamal (Curriculum Director)',
    author: 'Jimma Zone Islamic Education Directorate',
    department: 'Education Directorate',
    uploadDate: '2026-08-18',
    hijriDate: '6 Safar 1448 AH',
    downloadsCount: 1120,
    isFeatured: true,
    seasonOrOccasion: 'Annual Madrasa Academic Cycle',
    description: 'The official 2026-2027 curriculum guide detailing daily lesson quotas (Sabaq, Sabqi, Manzil), weekly review milestones, Tajweed theory modules, and standardized evaluation rubrics for all accredited madrasas in Jimma Zone.',
    summaryPoints: [
      'Level 1 (Preparatory): Noorani Qa’idah mastery, Juz Amma memorization, Makharij & Sifaat foundations.',
      'Level 2 (Intermediate): Juz Tabarak to Juz 15, Noon Sakinah rules, Madd types, and daily retention systems.',
      'Level 3 (Advanced/Khatm): Completion of 30 Juz, Mutashabihat (similar verses) mastery, and Sanad exam preparation.',
      'Includes printable student milestone tracking cards and teacher weekly log templates.'
    ],
    tags: ['Curriculum', 'Tahfeez', 'Tajweed', 'Madrasa Guide', 'Syllabus', 'Hifz Rubric'],
    previewContent: {
      arabicText: `محتويات المنهج الموحد:
المرحلة الأولى: التأسيس وإتقان القاعدة النورانية ومخارج الحروف وجزء عم كاملاً مع تطبيق أحكام النون الساكنة والتنوين.
المرحلة الثانية: حفظ الأجزاء من تبارك إلى الكهف مع دراسة أحكام المدود والوقف والابتداء ومراجعة يومية لـ (السبقي) و(المنزل).
المرحلة الثالثة: إتمام الحفظ الكامل وضبط المتشابهات اللفظية وتأهيل الطالب لنيل الإجازة بالسند المتصل برواية حفص عن عاصم.`,
      translationEnglish: `Curriculum Structure Breakdown:
- Daily Sabaq Requirement: Minimum 1/2 page to 1 page depending on level.
- Daily Sabqi (Recent Memorization): Last 5-10 consecutive lessons recited with zero stops.
- Daily Manzil (Past Quarter Retention): 1/2 Juz to 1 full Juz daily rotation.
- Standard Exam Weighting: 40% Memorization Accuracy, 30% Tajweed Application, 20% Voice/Fluency, 10% Attendance & Discipline.`,
      keyThemes: ['Structured Memorization Schedule', 'Standardized Tajweed Grading', 'Teacher Lesson Planning', 'Student Retention Safeguards'],
      tableOfContents: [
        'Chapter 1: Educational Philosophy & Vision for Jimma Madrasas',
        'Chapter 2: Level 1 Syllabus & Weekly Breakdown',
        'Chapter 3: Level 2 Syllabus & Tajweed Exercises',
        'Chapter 4: Level 3 Advanced Khatm & Sanad Readiness',
        'Chapter 5: Examination Standards & Certificate Issuance Guidelines'
      ],
      sampleExcerpt: 'Approved by the Council Education Directorate for implementation across all 240+ accredited centers in Jimma Zone.'
    }
  },
  {
    id: 'res-3',
    title: 'Mosque Management Committee Governance & Waqf Operations Manual',
    arabicTitle: 'دليل إدارة المساجد وتنظيم لجان الأوقاف والشؤون الإدارية',
    oromoTitle: 'Qajeelfama Hoggansa Mana Sagadaa (Masjiidaa) fi Eegumsa Qabeenyaa Waqfii',
    category: 'PDF Handbook',
    subCategory: 'Administrative Guide',
    targetInstitution: 'Mosques Only',
    targetAudience: 'Mosque Chairmen, Treasurers, Committee Members & Imams',
    language: 'Afaan Oromoo',
    format: 'PDF',
    fileSize: '3.4 MB',
    downloadUrl: '#',
    uploadedBy: 'Sheikh Zakaria Nur (Mosque Affairs)',
    author: 'Mosque Affairs & Waqf Directorate',
    department: 'Mosque & Waqf Affairs',
    uploadDate: '2026-08-10',
    hijriDate: '27 Muharram 1448 AH',
    downloadsCount: 640,
    isFeatured: false,
    seasonOrOccasion: 'General Administration',
    description: 'Comprehensive operational handbook covering legal mosque committee formation, democratic election protocols, transparent financial accounting, utility and solar maintenance, and waqf commercial property management.',
    summaryPoints: [
      'Roles and mandates: Chairman, Vice-Chairman, Imam, Treasurer, Auditor, and Youth/Women Coordinators.',
      'Financial accountability: Double-signature check protocols, digital cash donation ledgers, and monthly public reporting.',
      'Facility maintenance: Solar panel maintenance schedules, wudu water filtration systems, sound amplification decibel limits.',
      'Dispute resolution: Step-by-step arbitration through district Ulema councils.'
    ],
    tags: ['Handbook', 'Mosque Governance', 'Waqf Management', 'Finance Control', 'Administration'],
    previewContent: {
      translationOromo: `Qabiyyeewwan Qajeelfama Hoggansa Masjiidaa:
1. Qaama Hoggansaa fi Gahee Hojii:
- Dura-taa'aa: Walitti qabaa fi bakka bu'aa seeraa masjiidichaa.
- Iimaama: Hoggansa amantii, salaataa fi barnoota masjiidaa.
- Qondaala Maallaqaa (Kazaanaa): Galii fi baasii hordofuu, ragaa qindeessuu fi herreega iftoomina qabu dhiyeessuu.

2. Iftoomina Faayinaansii:
- Saanduqa Buusaa Guyyaa Jim’ataa yoo xiqqaate namoota sadiin banamuu qaba.
- Kaffaltii kamiyyuu dura-taa'aa fi kazaanaan mallatteeffamuu qaba.`,
      translationEnglish: `Governance Standard Overview:
Section 3.2: Friday Collection Security. Collection boxes must be opened immediately after Jummah in the presence of at least three committee members, counted, documented with verified receipt slips, and deposited into the official bank account within 24 hours.`,
      keyThemes: ['Transparent Treasury Oversight', 'Committee Roles & Mandates', 'Facility & Solar Upkeep', 'Public Accountability'],
      tableOfContents: [
        'Section 1: Legal Standing & Registration Requirements',
        'Section 2: Committee Composition & Code of Conduct',
        'Section 3: Financial Management & Procurement Standards',
        'Section 4: Property, Waqf & Solar Maintenance',
        'Section 5: Emergency Preparedness & Security'
      ],
      sampleExcerpt: 'Mandatory operational manual for all registered Friday and local mosques across Jimma City and surrounding woredas.'
    }
  },
  {
    id: 'res-4',
    title: 'Friday Khutbah Template: Safeguarding Youth & Moral Upbringing in the Digital Age',
    arabicTitle: 'خطبة الجمعة: تحصين النشء ورعاية الشباب في عصر التقنية والرقمنة',
    oromoTitle: 'Xiba Jim’ataa: Dhaloota Qaruu fi Dargaggoota Ammayyummaa Dijitaalaa Keessatti Eeguu',
    category: 'Khutbah Template',
    subCategory: 'Friday Sermon',
    targetInstitution: 'Both',
    targetAudience: 'Imams, Parents, Youth Mentors',
    language: 'Multilingual',
    format: 'DOCX',
    fileSize: '890 KB',
    downloadUrl: '#',
    uploadedBy: 'Dr. Faisal Abdurahman',
    author: 'Supreme Shari’ah & Fatwa Board of Jimma',
    department: 'Shariah & Fatwa Board',
    uploadDate: '2026-08-20',
    hijriDate: '8 Safar 1448 AH',
    downloadsCount: 390,
    isFeatured: false,
    seasonOrOccasion: 'Youth Awareness Month',
    description: 'Ready-to-deliver Jummah sermon addressing smartphone habits, social media ethics, substance abuse prevention (Khat/Substance addiction awareness), and constructive engagement with Islamic centers.',
    summaryPoints: [
      'The prophetic approach to youth mentorship: gentleness, listening, and building self-worth.',
      'Digital hygiene: Avoiding destructive online content, cyber-bullying, and loss of time.',
      'Practical parental guidance on establishing warm communication and enrolling children in madrasas.',
      'Includes youth discussion question prompts for post-Maghrib halaqa circles.'
    ],
    tags: ['Khutbah', 'Youth', 'Digital Ethics', 'Parenting', 'Addiction Prevention', 'Social Media'],
    previewContent: {
      arabicText: `مقتطف من الخطبة:
عباد الله: إن أولادنا أمانة في أعناقنا، سيسألنا الله تعالى عنهم يوم القيامة: «كلكم راع وكلكم مسؤول عن رعيته». وإن من أعظم التحديات في عصرنا الحاضر هذا الفضاء الرقمي المفتوح الذي قد يسلب أوقات أبنائنا ويشغلهم عن طاعة ربهم وبر والديهم وطلب العلم النافع.
فكونوا لأبنائكم قدوة صالحة، واصبروا على توجيههم باللين والمحبة، واحرصوا على ربطهم بالمساجد وحلقات القرآن الكريم.`,
      translationEnglish: `Summary for Imams:
This sermon encourages Imams to avoid harsh condemnation and instead offer practical digital discipline tips: device-free family dinners, setting positive role models, and providing sports/academic clubs inside mosque premises.`,
      keyThemes: ['Youth Upbringing (Tarbiyah)', 'Digital Literacy & Ethics', 'Parental Responsibility', 'Mosque Youth Programs'],
      tableOfContents: [
        '1. Introduction & Prophetic Examples with Young Companions',
        '2. The Reality of Modern Screen Addiction',
        '3. Five Golden Rules for Muslim Parents',
        '4. Second Khutbah: Collective Community Safety Nets'
      ]
    }
  },
  {
    id: 'res-5',
    title: 'Janazah (Funeral) Protocols & Shari’ah Estate Settling Handbook',
    arabicTitle: 'دليل أحكام الجنائز وتجهيز الميت وتنظيم المقابر والمواريث الشرعية',
    oromoTitle: 'Qajeelfama Sirna Awwaalchaa (Janaazaa), Qophii fi Hirma Qabeenya Dhaalaa',
    category: 'PDF Handbook',
    subCategory: 'Religious Protocol',
    targetInstitution: 'Both',
    targetAudience: 'Imams, Janazah Committees, Family Arbitrators & Community Elders',
    language: 'Multilingual',
    format: 'PDF',
    fileSize: '4.1 MB',
    downloadUrl: '#',
    uploadedBy: 'Sheikh Mustafa Jamal (Fatwa Board)',
    author: 'Jimma Supreme Fatwa & Inheritance Directorate',
    department: 'Shariah & Fatwa Board',
    uploadDate: '2026-07-28',
    hijriDate: '14 Muharram 1448 AH',
    downloadsCount: 890,
    isFeatured: false,
    seasonOrOccasion: 'Fiqh & Community Services',
    description: 'A comprehensive Shari’ah protocol manual covering washing (Ghusl), shrouding (Kafan), Janazah prayer steps, cemetery registry protocols in Jimma Zone, and standard Mirath (inheritance) calculation worksheets.',
    summaryPoints: [
      'Step-by-step Ghusl & Kafan instructions with illustrated supply checklists.',
      'Etiquette of condolences (Ta’ziyah) and eliminating un-Islamic costly mourning customs.',
      'Cemetery waqf registry standards and emergency night burial logistics.',
      'Inheritance distribution flowcharts according to the four Sunni schools of jurisprudence.'
    ],
    tags: ['Janazah', 'Funeral Guide', 'Fiqh', 'Ghusl', 'Inheritance (Mirath)', 'Cemetery Protocol'],
    previewContent: {
      arabicText: `فصل في تجهيز الميت والصلاة عليه:
أولاً: الغسل - يبدأ بالوضوء الشرعي دون إدخال الماء في الفم والأنف، ثم غسل الرأس واللحية، ثم الشق الأيمن فالأيسر بماء السدر، وفي الغسلة الأخيرة يجعل كافوراً.
ثانياً: التكفين - يستحب في ثلاثة أثواب بيض للرجل، وخمسة للمرأة.
ثالثاً: صلاة الجنازة - أربع تكبيرات: الأولى الفاتحة، الثانية الصلاة الإبراهيمية، الثالثة الدعاء للميت، الرابعة الدعاء لعموم المسلمين.`,
      translationOromo: `Qabiyyeewwan Qajeelfama Janaazaa:
1. Dhiqinsa (Ghuslii): Bishaaniin qulqulleessuu fi qajeelfama Shari’aa hordofuu.
2. Kafana: Uffata adii qulqulluu dhiiraaf uffata sadii, dubartiif shaniin kafanuu.
3. Salaata Janaazaa: Takbiiraa afur - Fatihaa, Salawaata Nabiyyii (SAW), Du’aa Mayyitaaf fi Salaamtaa.`,
      keyThemes: ['Dignified Janazah Procedures', 'Sunnah Burial Etiquette', 'Eliminating Wasteful Customs', 'Inheritance Fair Division'],
      tableOfContents: [
        '1. Sickness & Deathbed Guidance (Talqeen)',
        '2. Practical Ghusl & Shrouding Step-by-Step',
        '3. The Funeral Prayer (Salat al-Janazah) Rulings',
        '4. Burial Standards in Jimma Municipal Cemeteries',
        '5. Simplified Mirath (Inheritance) Share Tables'
      ]
    }
  },
  {
    id: 'res-6',
    title: 'Madrasa Mu’allim Pedagogy, Lesson Planning & Classroom Management Handbook',
    arabicTitle: 'دليل المعلم في طرائق التدريس وإدارة الفصول وحلقات التحفيظ',
    oromoTitle: 'Qajeelfama Barsiisaa Madrasaa: Tooftaalee Barsiisummaa fi Hoggansa Daree',
    category: 'Educational Material',
    subCategory: 'Teacher Guide',
    targetInstitution: 'Madrasas Only',
    targetAudience: 'Madrasa Teachers, Mu’allims & Education Inspectors',
    language: 'Multilingual',
    format: 'PDF',
    fileSize: '3.9 MB',
    downloadUrl: '#',
    uploadedBy: 'Ustadh Fuad Jamal',
    author: 'Teacher Training & Curriculum Directorate',
    department: 'Education Directorate',
    uploadDate: '2026-08-14',
    hijriDate: '2 Safar 1448 AH',
    downloadsCount: 730,
    isFeatured: false,
    seasonOrOccasion: 'Teacher Professional Development',
    description: 'Modern instructional handbook for Islamic teachers focusing on positive discipline, multi-age classroom handling, active learning methodologies, and student psychological support without physical punishment.',
    summaryPoints: [
      'Child protection policy: Absolute ban on corporal punishment; implementing positive reinforcement reward systems.',
      'Lesson plan frameworks: 45-minute structured class division (Review 15m, New Sabaq 20m, Tajweed Rule 10m).',
      'Accommodating struggling students: Memory enhancement techniques, rhythmic repetition, and peer pairing.',
      'Parent-teacher communication log samples in Afaan Oromoo and Amharic.'
    ],
    tags: ['Pedagogy', 'Teacher Training', 'Classroom Management', 'Child Protection', 'Madrasa Muallim'],
    previewContent: {
      translationEnglish: `Core Pedagogical Principle:
Section 2: Positive Reinforcement Over Corporal Punishment. The Jimma Islamic Council upholds the dignity of every student of knowledge. Madrasa Mu’allims are required to replace punitive physical reprimands with structured motivational charts, gold star reward ledgers, and verbal encouragement reflecting the gentle teaching methodology of Prophet Muhammad (SAW).`,
      keyThemes: ['Modern Islamic Pedagogy', 'Positive Classroom Discipline', 'Lesson Time Management', 'Special Needs Support'],
      tableOfContents: [
        'Chapter 1: The Spiritual & Professional Ethics of a Mu’allim',
        'Chapter 2: Designing Effective 45-Minute Lesson Plans',
        'Chapter 3: Memory Enhancement & Quran Retention Techniques',
        'Chapter 4: Child Psychology & Positive Behavioral Support',
        'Chapter 5: Assessment & Report Card Documentation'
      ]
    }
  },
  {
    id: 'res-7',
    title: 'Special Occasion Khutbah: Welcoming Rabi’ al-Awwal & Emulating the Prophetic Character',
    arabicTitle: 'خطبة مناسبات: استقبال شهر ربيع الأول والاقتداء بأخلاق النبي المصطفى صلى الله عليه وسلم',
    oromoTitle: 'Xiba Addaa: Ji’a Rabi’al-Awwal Simachuu fi Fakkeenya Amala Nabiyyii (SAW) Hordofuu',
    category: 'Khutbah Template',
    subCategory: 'Occasion Sermon',
    targetInstitution: 'Both',
    targetAudience: 'Imams, Khateebs, Lecturers & Youth Halaqas',
    language: 'Multilingual',
    format: 'PDF',
    fileSize: '1.2 MB',
    downloadUrl: '#',
    uploadedBy: 'Sheikh Mustafa Jamal (Fatwa Board)',
    author: 'Supreme Shari’ah & Fatwa Board of Jimma',
    department: 'Shariah & Fatwa Board',
    uploadDate: '2026-08-28',
    hijriDate: '16 Safar 1448 AH',
    downloadsCount: 310,
    isFeatured: true,
    isPinnedForJummah: false,
    seasonOrOccasion: 'Rabi’ al-Awwal Season / Seerah',
    description: 'A rich seasonal sermon text celebrating the birth and sublime moral character of the Prophet Muhammad (SAW), detailing honesty in business, mercy to children, and fostering inter-communal peace in Jimma Zone.',
    summaryPoints: [
      'Extracts from authentic Shamail al-Muhammadiyyah (Prophetic attributes).',
      'The economic ethics of the Prophet: truthfulness in market trades and avoiding deceptive weights.',
      'Translating love of the Prophet into living Sunnah actions: feeding the hungry and spreading greetings of peace.',
      'Second sermon includes beautiful poetic salawat and council community supplications.'
    ],
    tags: ['Khutbah', 'Rabi al-Awwal', 'Seerah', 'Prophetic Ethics', 'Mercy', 'Occasion Sermon'],
    previewContent: {
      arabicText: `الخطبة الأولى:
الحمد لله الذي أرسل رسوله بالهدى ودين الحق ليظهره على الدين كله وكفى بالله شهيداً، محمداً رسول الله والذين معه أشداء على الكفار رحماء بينهم.
أيها المسلمون: نحن نستقبل في هذه الأيام المباركة شهر ربيع الأول، شهر ميلاد نبي الرحمة وخاتم الأنبياء والمرسلين سيدنا محمد صلى الله عليه وسلم. إن التعبير الصادق عن محبة النبي الكريم يتجلى في اتباعه والاقتداء به في شتى مناحي الحياة؛ في صدقه وأمانته، وفي حلمه وعفوه، وفي رحمته بالصغير والكبير.

قال تعالى: ﴿لَقَدْ كَانَ لَكُمْ فِي رَسُولِ اللَّهِ أُسْوَةٌ حَسَنَةٌ لِمَنْ كَانَ يَرْجُو اللَّهَ وَالْيَوْمَ الْآخِرَ وَذَكَرَ اللَّهَ كَثِيرًا﴾.`,
      translationOromo: `Xiba Tokkoffaa:
Yaa hawaasa Muslimaa! Ji’a barakeeffamaa Rabi’al-Awwal keessa gallee jirra. Jaalala Nabiyyii (SAW) dhugomsuun amala isaanii hordofuu, dhugaa dubbachuu, daldala keessatti amanamummaa qabaachuu fi wal-mararfannaadhaan mul’ata.`,
      keyThemes: ['Prophetic Character (Akhlaq)', 'Seerah Practical Lessons', 'Mercy to Humanity', 'Spiritual Rejuvenation'],
      tableOfContents: [
        '1. The Divine Gift of Prophethood',
        '2. Four Core Moral Pillars of the Prophetic Character',
        '3. Practical Seerah Applications for Jimma Youth & Merchants',
        '4. Closing Salawat & Community Supplication'
      ]
    }
  },
  {
    id: 'res-8',
    title: 'Tajweed Rules Master Chart & Practical Articulation Illustrated Guide',
    arabicTitle: 'لوحة أحكام التجويد الشاملة ومخارج الحروف المصورة برواية حفص',
    oromoTitle: 'Gabatee Seerota Tajwiidaa fi Bakkeewwan Sagaleen Qor’aanaa Itti Bahu (Makharij)',
    category: 'Tajweed & Tahfeez',
    subCategory: 'Visual Guide',
    targetInstitution: 'Madrasas Only',
    targetAudience: 'Madrasa Students, Teachers & Quran Learners',
    language: 'Multilingual',
    format: 'Printable Sheet',
    fileSize: '6.2 MB',
    downloadUrl: '#',
    uploadedBy: 'Ustadh Bilal Dawud',
    author: 'Grand Anwar Institute of Tajweed Studies',
    department: 'Education Directorate',
    uploadDate: '2026-08-05',
    hijriDate: '22 Muharram 1448 AH',
    downloadsCount: 1540,
    isFeatured: true,
    seasonOrOccasion: 'Classroom Wall Chart',
    description: 'High-resolution full-color printable poster and student booklet illustrating anatomical articulation points (Makharij), vocal characteristics (Sifaat), Noon/Meem Sakinah tables, and Madd types with QR-coded audio recitation demos.',
    summaryPoints: [
      'Anatomical diagrams of the 17 throat, tongue, lip, and nasal vocalization points.',
      'Comprehensive table of Ahkam An-Noon As-Sakinah (Izhar, Idgham, Iqlab, Ikhfa) with color-coded Quranic examples.',
      'Mudood (Elongations) classification matrix from 2 to 6 harakat.',
      'Sized for A2 wall poster printout and A4 student folder inserts.'
    ],
    tags: ['Tajweed', 'Makharij', 'Chart', 'Visual Poster', 'Hifz Tool', 'Noorani'],
    previewContent: {
      translationEnglish: `Tajweed Master Overview:
- 5 Major Articulation Areas: Al-Jawf (Oral Cavity), Al-Halq (Throat), Al-Lisaan (Tongue), Ash-Shafataan (Lips), Al-Khayshoom (Nasal Passage).
- Rules of Noon Sakinah & Tanween: Complete rules with 28 Arabic letter classifications.
- Rules of Meem Sakinah: Ikhfa Shafawi, Idgham Shafawi, Izhar Shafawi.`,
      keyThemes: ['Precision Pronunciation', 'Visual Learning', 'Color-Coded Rules', 'Standardized Hafs Recitation'],
      tableOfContents: [
        'Section 1: General Articulation Overview (Al-Makharij Al-Ammah)',
        'Section 2: Rules of Noon & Meem Sakinah',
        'Section 3: Sifaat Lazimah & Aaridhah (Letters Characteristics)',
        'Section 4: The Rules of Madd (Elongation)',
        'Section 5: Stop & Start Rules (Al-Waqf wal-Ibtida)'
      ]
    }
  },
  {
    id: 'res-9',
    title: 'Daily Sabaq, Sabqi, and Manzil Student Progress Tracking Ledger (Printable & Excel)',
    arabicTitle: 'سجل متابعة الحفظ والمراجعة اليومية (السبق والسبقي والمنزل) للكتاتيب القرآنية',
    oromoTitle: 'Galmee Hordoffii Qor’aana Guyyaa (Sabaq, Sabqii fi Manzil) Barsiisotaaf',
    category: 'Educational Material',
    subCategory: 'Administrative Tool',
    targetInstitution: 'Madrasas Only',
    targetAudience: 'Madrasa Teachers & Hifz Administrators',
    language: 'Multilingual',
    format: 'DOCX',
    fileSize: '720 KB',
    downloadUrl: '#',
    uploadedBy: 'Ustadh Fuad Jamal',
    author: 'Jimma Zone Islamic Education Directorate',
    department: 'Education Directorate',
    uploadDate: '2026-08-01',
    hijriDate: '18 Muharram 1448 AH',
    downloadsCount: 1290,
    isFeatured: false,
    seasonOrOccasion: 'Daily Record Keeping',
    description: 'Standardized monthly attendance and recitation ledger template allowing teachers to track daily new lines (Sabaq), recent revision pages (Sabqi), and quarter-Juz retention (Manzil) with automatic performance calculation.',
    summaryPoints: [
      'Space for 35 students per classroom with 30-day evaluation columns.',
      'Standard grading scale: Mumtaz (⭐ 3), Jayyid Jiddan (⭐ 2), Jayyid (⭐ 1), Makhalif (Needs Revision).',
      'Includes guardian signature verification row for weekly home monitoring.',
      'Available in printable PDF and editable Excel (.xlsx) / Word (.docx) formats.'
    ],
    tags: ['Tracker', 'Sabaq Ledger', 'Madrasa Record', 'Printable Sheet', 'Teacher Tool'],
    previewContent: {
      translationEnglish: `Tracking Format Structure:
Column 1: Student Name & Reg ID
Column 2-31: Daily Record split into [Sabaq (Surah/Ayah)] | [Sabqi (Pages)] | [Manzil (Juz)] | [Rating (M/JJ/J/R)]
Column 32: Monthly Total Juz Completed
Column 33: Guardian Verification Signature & Teacher Comments`,
      keyThemes: ['Daily Progress Accountability', 'Standardized Grading', 'Guardian Engagement', 'Data-Driven Madrasa Management']
    }
  },
  {
    id: 'res-10',
    title: 'Mosque Acoustic & Solar Power Inverter Operation Handbook',
    arabicTitle: 'دليل تشغيل وصيانة منظومات الصوت والطاقة الشمسية للمساجد والمراكز',
    oromoTitle: 'Qajeelfama Eegumsaa fi Tajaajila Sagaleessaa fi Solarii Mana Sagadaa',
    category: 'PDF Handbook',
    subCategory: 'Technical Guide',
    targetInstitution: 'Mosques Only',
    targetAudience: 'Muazzins, Mosque Maintenance Staff & Tech Committees',
    language: 'Afaan Oromoo',
    format: 'PDF',
    fileSize: '2.8 MB',
    downloadUrl: '#',
    uploadedBy: 'Eng. Oumer Ahmed (Waqf Infrastructure)',
    author: 'Jimma Council Technical & Renewable Energy Committee',
    department: 'Mosque & Waqf Affairs',
    uploadDate: '2026-07-15',
    hijriDate: '1 Muharram 1448 AH',
    downloadsCount: 410,
    isFeatured: false,
    seasonOrOccasion: 'Facility & Infrastructure Upkeep',
    description: 'Technical troubleshooting and preventive maintenance handbook for solar battery banks, hybrid inverters, adhan public address amplifier decibel tuning, and lightning arrestor grounding.',
    summaryPoints: [
      'Solar battery longevity: Weekly electrolyte checks, dusting panel surfaces, and avoiding deep discharge below 48V.',
      'Acoustic management: Eliminating feedback echo, optimal microphone placement for Mihrab and Minbar.',
      'Electrical safety: Fire extinguisher placement, surge protectors, and inverter cooling ventilation.',
      'Council subsidized spare parts procurement contact directory for Jimma Zone.'
    ],
    tags: ['Solar Power', 'Acoustics', 'Maintenance', 'Technical Manual', 'Mosque Infrastructure'],
    previewContent: {
      translationOromo: `Qabiyyee Qajeelfama Teeknikaa:
1. Sirna Solarii Eeguu:
- Baattiriyoota yeroo yeroon qulqulleessuu fi dhangala’aa (acid) isaanii ilaaluu.
- Invertara iddoo qabbanaawaa fi qilleensa qabutti kaa’uu.
2. Sirna Sagaleessaa (Sound System):
- Sagalee Azaanaa naannoo jireenyaa jeequtti ol ka’uu dhabuu.
- Mikrofoonii Minbaraa fi Mihraabaa qajeeltoon qindeessuu.`,
      keyThemes: ['Renewable Energy Reliability', 'Clear Audio & Adhan Tuning', 'Fire & Electrical Safety', 'Preventive Maintenance']
    }
  },
  {
    id: 'res-11',
    title: 'Nikah (Marriage) Contract Administration & Pre-Marital Counseling Guide',
    arabicTitle: 'دليل إجراءات عقود النكاح الشرعي والتأهيل الأسري والإرشاد الزواجي',
    oromoTitle: 'Qajeelfama Raawwii Sirna Fuudhaa fi Heerumaa (Nikaahaa) fi Gorsa Maatii',
    category: 'Administrative Protocol',
    subCategory: 'Family & Marriage',
    targetInstitution: 'Both',
    targetAudience: 'Imams, Marriage Registrars, Shari’ah Judges & Family Counselors',
    language: 'Multilingual',
    format: 'PDF',
    fileSize: '3.1 MB',
    downloadUrl: '#',
    uploadedBy: 'Sheikh Mustafa Jamal (Fatwa Board)',
    author: 'Family Welfare & Marriage Registration Bureau',
    department: 'Shariah & Fatwa Board',
    uploadDate: '2026-08-08',
    hijriDate: '25 Muharram 1448 AH',
    downloadsCount: 520,
    isFeatured: false,
    seasonOrOccasion: 'Family Welfare Protocol',
    description: 'Official procedure manual for licensed Imams conducting Islamic marriage ceremonies, including legal age verification, guardian consent verification (Wali), Mahr documentation, and pre-marital reconciliation counseling.',
    summaryPoints: [
      'Checklist of valid Islamic marriage conditions: Mutual consent, Wali approval, two reliable witnesses, and agreed Mahr.',
      'Integration with Ethiopian civil vital statistics and official Council Nikah certificates.',
      'Pre-marital counseling curriculum: Financial planning, conflict de-escalation, and mutual rights.',
      'Template marriage registration forms with QR-code security verification.'
    ],
    tags: ['Nikah', 'Marriage Guide', 'Family Welfare', 'Shariah Contract', 'Counseling'],
    previewContent: {
      translationEnglish: `Essential Nikah Registry Protocol:
Every licensed Imam in Jimma Zone must submit completed Form NK-01 with national ID copies of both spouses, the Wali, and two witnesses to the Council Secretariat within 7 business days for official archiving and holographic seal stamping.`,
      keyThemes: ['Legal Contract Rigor', 'Family Stability', 'Rights of Spouses', 'Official Documentation']
    }
  },
  {
    id: 'res-12',
    title: 'Friday Khutbah Template: Waqf Protection, Public Water & Environmental Stewardship',
    arabicTitle: 'خطبة الجمعة: حفظ الأوقاف ورعاية موارد المياه وحماية البيئة في الإسلام',
    oromoTitle: 'Xiba Jim’ataa: Eegumsa Waqfii, Qabeenya Bishaanii fi Qulqullina Naannoo',
    category: 'Khutbah Template',
    subCategory: 'Friday Sermon',
    targetInstitution: 'Both',
    targetAudience: 'Imams, Khateebs, Environmental Committees',
    language: 'Multilingual',
    format: 'PDF',
    fileSize: '1.1 MB',
    downloadUrl: '#',
    uploadedBy: 'Sheikh Zakaria Nur',
    author: 'Mosque Affairs & Waqf Directorate',
    department: 'Mosque & Waqf Affairs',
    uploadDate: '2026-08-22',
    hijriDate: '10 Safar 1448 AH',
    downloadsCount: 290,
    isFeatured: false,
    isPinnedForJummah: false,
    seasonOrOccasion: 'Community Infrastructure & Water Month',
    description: 'A practical sermon text highlighting the immense reward of continuous charity (Sadaqah Jariyah), preserving public wells and spring water sources around Jimma, tree planting (Gadaa reforestation), and eliminating wudu water waste.',
    summaryPoints: [
      'Prophetic narrations on water charity: «أفضل الصدقة سقي الماء» (The best charity is providing water).',
      'The prohibition of wasting water even while making ablution at a flowing river.',
      'Protecting Jimma’s lush forests, coffee plantations, and natural springs from pollution.',
      'Encouraging endowments (Waqf) for solar-powered water boreholes for drought-prone rural woredas.'
    ],
    tags: ['Khutbah', 'Waqf', 'Water Charity', 'Environment', 'Sadaqah Jariyah', 'Conservation'],
    previewContent: {
      arabicText: `مقتطف من الخطبة:
أيها المؤمنون: إن الماء عصب الحياة، ونعمة كبرى من نعم الله تعالى علينا، قال سبحانه: ﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ أَفَلَا يُؤْمِنُونَ﴾. وإن من أفضل القربات وأجل الصدقات الجارية حفر الآبار وتوفير مياه الشرب النقية للمحتاجين.
كما نهى نبينا الكريم صلى الله عليه وسلم عن الإسراف في الماء ولو كان أحدنا يتوضأ على نهر جار. فحافظوا على نظافة ينابيع المياه في مدينتنا وقرانا، واغرسوا الأشجار، وكونوا حراساً لبيئتكم.`,
      translationOromo: `Xiba Tokkoffaa:
Yaa hawaasa Muslimaa! Bishaanni madda jireenyaati. Qabeenya bishaanii fi naannoo qulqulleessuun, mukeen dhaabuu fi bishaan qisaasuu dhabuun ajaja amantii keenyaati. Sadaqaa keessatti kan irra caalu bishaan dhugaatii namaaf dhiyeessuudha.`,
      keyThemes: ['Water Conservation', 'Environmental Stewardship', 'Endowment (Waqf) Impact', 'Ablution Discipline']
    }
  }
];
