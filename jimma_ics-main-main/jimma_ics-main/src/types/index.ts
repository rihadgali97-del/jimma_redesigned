export type Language = 'en' | 'om' | 'am' | 'ar';

export type UserRole =
  | 'Super Admin'
  | 'Council Director'
  | 'IT & Media Officer'
  | 'Finance Officer'
  | 'Education Officer'
  | 'Mosque Officer'
  | 'Ulema Coordinator'
  | 'Madrasa Administrator'
  | 'Teacher'
  | 'Imam'
  | 'Auditor'
  | string;

export type StaffStatus = 'Active' | 'On Leave' | 'Suspended' | 'Pending Invitation';

export type StaffDepartment =
  | 'Executive Secretariat'
  | 'IT & Media Communications'
  | 'Shariah & Fatwa Board'
  | 'Education Directorate'
  | 'Finance & Endowment'
  | 'Mosque & Waqf Affairs'
  | 'Social Services & Zakat';

export interface User {
  id: string;
  name: string;
  arabicName?: string;
  email: string;
  role: UserRole;
  authRole?: string;
  title?: string;
  department?: StaffDepartment | string;
  avatar?: string;
  phone: string;
  district?: string;
  status?: StaffStatus;
  joinedDate?: string;
  lastLogin?: string;
  twoFactorEnabled?: boolean;
  accessLevel?: string;
  permissions: string[];
  customPermissions?: string[];
  notes?: string;
}

export interface PermissionItem {
  id: string;
  name: string;
  description: string;
  module: string;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface PermissionCategory {
  id: string;
  name: string;
  arabicName?: string;
  description: string;
  iconName: string;
  permissions: PermissionItem[];
}

export interface RoleDefinition {
  id: string;
  name: string;
  arabicName?: string;
  department: StaffDepartment | string;
  description: string;
  isSystemRole: boolean;
  privilegeLevel: 'Critical' | 'High' | 'Medium' | 'Standard';
  defaultDashboard: string;
  color: string;
  assignedUsersCount?: number;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  hijriDate?: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  target: string;
  category: 'Auth' | 'Role_Change' | 'Permission_Override' | 'Staff_Record' | 'Finance_Security' | 'System_Config';
  status: 'Success' | 'Warning' | 'Blocked';
  ipAddress: string;
  details: string;
}

export interface Mosque {
  id: string;
  woredaId?: number;
  name: string;
  arabicName?: string;
  district: string;
  subCityOrWoreda: string;
  address: string;
  imam: string;
  deputyImam?: string;
  muazzin?: string;
  committeeChairman: string;
  establishedYear: number;
  capacity: number;
  students: number;
  status: 'active' | 'renovation' | 'planned';
  facilities: string[];
  hasMadrasa: boolean;
  madrasaId?: string;
  madrasaName?: string;
  contactPhone: string;
  image: string;
  jummahAttendance: number;
  monthlyExpensesETB: number;
  coordinates?: { lat: number; lng: number };
  description: string;
}

export interface Madrasa {
  id: string;
  woredaId?: number;
  name: string;
  arabicName?: string;
  mosqueId: string;
  mosqueName: string;
  district: string;
  headTeacher: string;
  headTeacherId?: string;
  hifzGraduatesCount?: number | null;
  establishedYear: number;
  totalStudents: number;
  totalTeachers: number;
  levels: string[]; // e.g. ['Level 1 (Tahfeez)', 'Level 2 (Tajweed & Fiqh)', 'Level 3 (Alimiyyah Prep)']
  programs: string[];
  status: 'active' | 'in-session' | 'recess';
  shifts: ('Morning' | 'Afternoon' | 'Weekend')[];
  contactPhone: string;
  image: string;
  description: string;
  accreditationStatus: 'Fully Accredited' | 'Provisional' | 'Under Review';
}

export interface Student {
  id: string;
  name: string;
  arabicName?: string;
  gender: 'Male' | 'Female';
  age: number;
  madrasaId: string;
  madrasaName: string;
  className: string;
  teacherId: string;
  teacherName: string;
  enrollmentDate: string;
  attendanceRate: number; // percentage e.g. 94
  quranJuzCompleted: number; // 0 to 30
  currentJuz: number;
  currentJuzProgress: number; // percentage e.g. 75
  hifzStatus: {
    sabaq: string; // current new lesson e.g. "Surah An-Nisa: 1-15"
    sabqi: string; // recent review e.g. "Juz 4"
    manzil: string; // long term retention e.g. "Juz 1 to 3"
  };
  tajweedRating: 'Excellent' | 'Good' | 'Needs Practice' | 'Very Good' | 'Needs Revision';
  examScoreAvg: number; // out of 100
  parentName: string;
  parentPhone: string;
  guardianName?: string;
  guardianPhone?: string;
  sabaqSurah?: string;
  sabaqAyahStart?: number;
  sabaqAyahEnd?: number;
  sabaqiJuz?: number;
  manzilJuz?: string;
  dailyAttendance?: 'Present' | 'Absent' | 'Late' | 'Excused';
  level?: string;
  status: 'Active' | 'On Leave' | 'Graduated';
  graduationYear?: number;
  avatar?: string;
}

export interface Teacher {
  id: string;
  name: string;
  madrasaId: string;
  madrasaName: string;
  qualification: string;
  specialization: string;
  experienceYears: number;
  studentsCount: number;
  assignedStudentsCount?: number;
  phone: string;
  email: string;
  status: 'Active' | 'On Leave';
  avatar?: string;
  sanad?: string;
  salaryETB?: number;
  isCertified?: boolean;
  isFeatured?: boolean;
  isPublished?: boolean;
}

export interface Ulema {
  id: string;
  name: string;
  arabicName?: string;
  title: string; // e.g. "Sheikh", "Mufti", "Ustadh", "Dr."
  specializations: string[]; // ['Tafseer', 'Fiqh & Fatwa', 'Hadith Sciences', 'Family Counselling', 'Waqf & Inheritance']
  district: string;
  assignedMosqueId?: string;
  assignedMosqueName?: string;
  qualifications: string[];
  languages: string[];
  areasOfService: string[];
  biography: string;
  contactPhone: string;
  email: string;
  status: 'Active' | 'Senior Advisor' | 'Visiting Scholar';
  avatar: string;
  yearsOfDawah: number;
  isFeatured?: boolean;
  isPublished?: boolean;
}

export interface Transaction {
  id: string;
  referenceNo: string;
  date: string;
  type: 'Income' | 'Expense' | 'Transfer' | 'Disbursement';
  fundId: string;
  fundName: string;
  category: string;
  amountETB: number;
  description: string;
  paymentMethod: 'Telebirr' | 'CBE Birr' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Awash Bank' | 'International Remittance';
  status: 'Completed' | 'Pending' | 'Flagged';
  recordedBy: string;
  approvedBy?: string;
  receiptUrl?: string;
}

export interface Donation {
  id: string;
  receiptNo: string;
  donorName: string;
  isAnonymous: boolean;
  phone?: string;
  email?: string;
  emailVerified?: boolean;
  amountETB: number;
  fundId: string;
  fundName: string;
  date: string;
  paymentMethod: 'Telebirr' | 'CBE Birr' | 'Bank Transfer' | 'Cash' | 'Awash Bank' | 'International Remittance';
  status: 'Completed' | 'Processing' | 'Refunded';
  notes?: string;
  certificateIssued: boolean;
  categoryType?: 'Zakat ul-Mal' | 'Zakat ul-Fitr' | 'Coffee Harvest Ushr' | 'Sadaqah Jariyah' | 'General Sadaqah' | 'Orphan Sponsorship' | 'Madrasa Scholarship' | 'Waqf Endowment' | 'Kaffarah / Fidyah' | 'Emergency Relief';
  district?: string;
  asnafCategory?: string;
  hijriDate?: string;
  transactionRef?: string;
  collectorName?: string;
  taxExemptCode?: string;
}

export interface ZakatCalculationRecord {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  title: string;
  date: string;
  hijriYear: string;
  nisabStandard: 'gold' | 'silver';
  nisabThresholdETB: number;
  totalAssetsETB: number;
  totalLiabilitiesETB: number;
  netZakatableWealthETB: number;
  isEligible: boolean;
  totalZakatObligationETB: number;
  status: 'Fulfilled / Discharged' | 'Obligation Pending' | 'Archived';
  linkedDonationReceiptNo?: string;
  assetBreakdown: {
    cashAndLiquidityETB: number;
    goldAndSilverETB: number;
    businessStockETB: number;
    investmentsETB: number;
    agricultureUshrETB: number;
    livestockETB: number;
  };
  inputSnapshot?: {
    cashInHand: number;
    bankDeposits: number;
    digitalWallets: number;
    foreignCurrencyETB?: number;
    goodDebtsReceivable?: number;
    gold24kGrams: number;
    gold21kGrams: number;
    gold18kGrams?: number;
    silverGrams: number;
    stockInventoryValue: number;
    rawMaterialsValue?: number;
    goodsInTransit?: number;
    tradeReceivables?: number;
    sharesLiquidValue?: number;
    retainedRentalIncome?: number;
    accessiblePension?: number;
    harvestQuintals: number;
    cropType: string;
    cropPricePerQuintal?: number;
    irrigationType: 'rain' | 'irrigated' | 'mixed';
    cattleCount?: number;
    sheepGoatCount?: number;
    shortTermDebts: number;
    livingExpensesImmediate?: number;
  };
  notes?: string;
}

export interface ZakatBeneficiaryDistribution {
  id: string;
  asnafCategory: string;
  arabicName?: string;
  woredaDistrict?: string;
  beneficiaryCount?: number;
  totalDisbursedETB?: number;
  lastDisbursalDate?: string;
  distributionChannel?: string;
  leadOfficer?: string;
  notes: string;
  beneficiaryName?: string;
  category?: string;
  amountETB?: number;
  district?: string;
  verificationStatus?: 'Verified' | 'Pending' | 'Disbursed' | 'Under Review' | string;
  disbursementDate?: string;
  approvedBy?: string;
}

export interface Fund {
  id: string;
  name: string;
  description: string;
  allocatedETB: number;
  disbursedETB: number;
  targetETB: number;
  color: string;
}

export interface ExpenseApproval {
  id: string;
  requestNo: string;
  title: string;
  category: string;
  amountETB: number;
  requestedBy: string;
  role: string;
  date: string;
  status: 'Pending Review' | 'Finance Approved' | 'Council Director Approved' | 'Rejected' | 'Disbursed';
  description: string;
  justification: string;
  fundId: string;
  fundName: string;
  comments?: string[];
}

export interface ServiceRequest {
  id: string;
  trackingNo: string;
  serviceType: 'Janazah Support' | 'Zakat Assistance' | 'Islamic Counselling' | 'Halal Certification Guidance' | 'Madrasa Registration' | 'Mosque Land & Waqf Support' | 'Orphan Sponsorship';
  applicantName: string;
  applicantPhone: string;
  applicantDistrict: string;
  submissionDate: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Disbursed' | 'Completed' | 'Rejected';
  assignedOfficer: string;
  notes: string;
  documentsCount: number;
  priority: 'Normal' | 'Urgent' | 'High';
}

export interface EventScheduleItem {
  time: string;
  activity: string;
  speaker?: string;
  hall?: string;
  notes?: string;
}

export interface EventSpeaker {
  name: string;
  title: string;
  role: string;
  avatar?: string;
  organization?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  fullName: string;
  phone: string;
  email?: string;
  district: string;
  organizationOrMadrasa?: string;
  attendeesCount: number;
  notes?: string;
  passNumber: string;
  status: 'Confirmed' | 'Checked-In' | 'Cancelled';
  createdAt: string;
}

export interface CouncilEvent {
  id: string;
  title: string;
  arabicTitle?: string;
  category: 'Lecture' | 'Quran Competition' | 'Ramadan Program' | 'Ulema Conference' | 'Youth Workshop' | 'Community Gathering';
  date: string;
  hijriDate: string;
  time: string;
  location: string;
  venueDetails?: string;
  district: string;
  organizer: string;
  speaker: string;
  description: string;
  attendeesCount: number;
  maxCapacity: number;
  isFeatured: boolean;
  image: string;
  registrationOpen: boolean;
  status?: 'Upcoming' | 'In Progress' | 'Completed' | 'Postponed' | 'Cancelled';
  format?: 'In-Person' | 'Hybrid' | 'Live Stream';
  entryFee?: 'Free' | string;
  targetAudience?: string;
  livestreamUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  schedule?: EventScheduleItem[];
  speakersList?: EventSpeaker[];
  tags?: string[];
  materials?: { title: string; fileType: string; size: string; downloadUrl?: string }[];
}

export interface EventNotificationSubscription {
  id: string;
  manageToken?: string;
  email?: string;
  name?: string;
  enableEmail: boolean;
  enableBrowser: boolean;
  enableAnnouncements?: boolean;
  categories: string[];
  districts: string[];
  reminderTiming: 'instant' | '24h_before' | '48h_before' | 'weekly_digest';
  subscribedAt: string;
  emailVerified?: boolean;
  specificEventIds?: string[];
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Official Communique' | 'Moon Sighting' | 'Zakat Nisab' | 'Academic Calendar' | 'Council Advisory';
  publishDate: string;
  date?: string;
  hijriDate: string;
  author: string;
  summary: string;
  content: string;
  isPinned: boolean;
  isUrgent?: boolean;
  priority?: 'High' | 'Normal';
  district?: string;
  targetAudience?: string;
  readTime: string;
  isPublished?: boolean;
  imageUrl?: string | null;
}

export type WaqfAssetType = 'LAND' | 'COMMERCIAL_RENTAL' | 'AGRICULTURAL' | 'CEMETERY';
export type WaqfAssetStatus = 'ACTIVE' | 'UNDER_MAINTENANCE' | 'DISPUTED' | 'INACTIVE';

export interface WaqfAsset {
  id: string;
  name: string;
  description?: string | null;
  type: WaqfAssetType;
  status: WaqfAssetStatus;
  documents?: { id: number; url: string; fileName: string; mimeType?: string }[];
  woreda: { id: number; code: string };
  locationNote?: string | null;
  isPublished?: boolean;
  monthlyIncome?: number | null;
  tenantName?: string | null;
  tenantContact?: string | null;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface StudentAttendanceEntry {
  studentId: string;
  studentName: string;
  arabicName?: string;
  gender: 'Male' | 'Female';
  age?: number;
  guardianName: string;
  guardianPhone: string;
  status: AttendanceStatus;
  arrivalTime?: string;
  lateMinutes?: number;
  sabaqRecited: boolean;
  sabaqRating?: 'Excellent' | 'Very Good' | 'Good' | 'Needs Revision' | 'Not Recited';
  currentLesson?: string;
  absenceReason?: 'Illness/Medical' | 'Family Matter' | 'Unexcused' | 'Weather/Transport' | 'Council Excused' | 'Other';
  parentNotified: boolean;
  notes?: string;
}

export interface DailyAttendanceSession {
  id: string;
  date: string;
  hijriDate: string;
  madrasaId: string;
  madrasaName: string;
  className: string;
  teacherId: string;
  teacherName: string;
  shift: 'Morning' | 'Afternoon' | 'Evening' | 'Weekend';
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number; // percentage e.g. 92.5
  status: 'Draft' | 'Submitted' | 'Verified by Supervisor';
  recordedBy: string;
  submittedAt: string;
  notes?: string;
  entries: StudentAttendanceEntry[];
}

export interface StaffAttendanceEntry {
  id: string;
  staffId: string;
  staffName: string;
  arabicName?: string;
  role: string;
  department: string;
  phone: string;
  avatar?: string;
  status: 'Present' | 'Absent' | 'Late' | 'On Leave' | 'Field Duty / Inspection' | 'Excused';
  clockInTime?: string;
  clockOutTime?: string;
  lateMinutes?: number;
  location: string;
  workSummary?: string;
  recordedBy: string;
}

// SMS / Telegram Gateway Types
export type MessageChannel = 'sms' | 'telegram' | 'hybrid';

export type MessageCategory =
  | 'sabaq_alert'
  | 'janazah_broadcast'
  | 'prayer_announcement'
  | 'moon_sighting'
  | 'khutbah_advisory'
  | 'general_bulletin';

export type MessageDeliveryStatus = 'queued' | 'transmitting' | 'delivered' | 'delivered_partial' | 'failed' | 'cancelled';

export interface DispatchLogItem {
  id: string;
  timestamp: string;
  title: string;
  category: MessageCategory;
  channel: MessageChannel;
  senderId: string;
  recipientTarget: string;
  recipientCount: number;
  content: string;
  status: MessageDeliveryStatus;
  gatewayResponseCode: string;
  costETB: number;
  deliveryRate: number;
  metadata?: {
    studentId?: string;
    studentName?: string;
    parentPhone?: string;
    madrasaName?: string;
    woreda?: string;
    mosqueName?: string;
    deceasedName?: string;
    janazahTime?: string;
    cemetery?: string;
    prayerName?: string;
    telegramMessageId?: string;
    telegramErrorMessage?: string;
  };
}

export type DispatchMessageInput = Omit<
  DispatchLogItem,
  'id' | 'timestamp' | 'status' | 'gatewayResponseCode' | 'deliveryRate'
> & {
  confirmation?: {
    title: string;
    message: string;
  };
};

export interface GatewayChannelStats {
  smsBalanceETB: number;
  smsTotalSent: number;
  smsSuccessRate: number;
  ethioShortCode: string;
  telegramBotUsername: string;
  telegramChannelName: string;
  telegramSubscribers: number;
  telegramMessagesSent: number;
}

// Educational Materials, PDF Handbooks & Khutbah Templates
export type ResourceCategory =
  | 'Khutbah Template'
  | 'Educational Material'
  | 'PDF Handbook'
  | 'Fiqh & Fatwa Guide'
  | 'Tajweed & Tahfeez'
  | 'Administrative Protocol';

export type ResourceTargetInstitution = 'Both' | 'Mosques Only' | 'Madrasas Only' | 'Community Wide';

export type ResourceLanguage = 'Arabic' | 'Afaan Oromoo' | 'English' | 'Amharic' | 'Multilingual';

export type ResourceFormat = 'PDF' | 'DOCX' | 'PPTX' | 'Audio/MP3' | 'Printable Sheet';

export interface ResourcePreviewContent {
  arabicText?: string;
  translationOromo?: string;
  translationEnglish?: string;
  keyThemes?: string[];
  tableOfContents?: string[];
  sampleExcerpt?: string;
}

export interface CouncilResource {
  id: string;
  title: string;
  arabicTitle?: string;
  oromoTitle?: string;
  category: ResourceCategory;
  subCategory?: string;
  targetInstitution: ResourceTargetInstitution;
  targetAudience: string;
  language: ResourceLanguage;
  format: ResourceFormat;
  fileSize: string;
  downloadUrl: string;
  uploadedBy: string;
  author: string;
  department: string;
  uploadDate: string;
  hijriDate: string;
  downloadsCount: number;
  isFeatured?: boolean;
  isPinnedForJummah?: boolean;
  seasonOrOccasion?: string;
  description: string;
  summaryPoints: string[];
  tags: string[];
  previewContent?: ResourcePreviewContent;
}

// Independent Audit & Shariah Compliance Types
export type AuditCategory =
  | 'Shariah_Compliance'
  | 'Financial_Integrity'
  | 'CSO_Regulatory'
  | 'Waqf_Endowment'
  | 'IT_Security'
  | 'Procurement_VAT';

export type AuditSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type AuditDirectiveStatus = 'Open' | 'Under Investigation' | 'Resolved' | 'Escalated to Shura';

export interface AuditDirective {
  id: string;
  title: string;
  category: AuditCategory;
  severity: AuditSeverity;
  status: AuditDirectiveStatus;
  targetEntity: string;
  department: StaffDepartment;
  findings: string;
  requiredAction: string;
  assignedAuditor: string;
  dueDate: string;
  createdDate: string;
  resolvedDate?: string;
  resolutionNote?: string;
  evidenceReference?: string;
  voucherId?: string;
  amountETB?: number;
}

export type CompliancePillar = 'Shariah' | 'Financial' | 'Regulatory' | 'Governance';

export interface AuditChecklistItem {
  id: string;
  title: string;
  pillar: CompliancePillar;
  description: string;
  status: 'Compliant' | 'Pending Review' | 'Action Required' | 'Exempt';
  lastVerified: string;
  verifiedBy: string;
  standardReference: string;
  evidenceNote?: string;
  frequency: 'Continuous' | 'Monthly' | 'Quarterly' | 'Annual';
}

export interface CryptographicLedgerBlock {
  blockHeight: number;
  timestamp: string;
  previousHash: string;
  blockHash: string;
  merkleRoot: string;
  transactionsCount: number;
  totalValueETB: number;
  status: 'Verified' | 'Sealed' | 'Validating';
  validator: string;
  blockType: 'Zakat_Disbursements' | 'Mosque_Endowment' | 'Expense_Vouchers' | 'Donor_Receipts' | 'General_Ledger';
}
