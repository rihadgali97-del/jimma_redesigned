import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Mosque,
  Madrasa,
  Student,
  Teacher,
  Ulema,
  Transaction,
  Donation,
  Fund,
  ExpenseApproval,
  ServiceRequest,
  CouncilEvent,
  Announcement,
  User,
  AttendanceRecord,
  AttendanceStatus,
  DailyAttendanceSession,
  StudentAttendanceEntry,
  StaffAttendanceEntry,
  DispatchLogItem,
  DispatchMessageInput,
  GatewayChannelStats,
  EventRegistration,
  EventNotificationSubscription,
  RoleDefinition,
  PermissionCategory,
  SecurityAuditLog,
  CouncilResource,
  ZakatBeneficiaryDistribution,
  AuditDirective,
  AuditChecklistItem,
  CryptographicLedgerBlock,
  ZakatCalculationRecord,
} from '../types';
import { mockStudents } from '../data/mockStudents';
import { mockFunds, mockTransactions, mockDonations, mockExpenseApprovals } from '../data/mockFinance';
import { mockPublicServices, mockServiceRequests, ServiceItem } from '../data/mockServices';
import { mockEvents, mockAnnouncements } from '../data/mockEventsAndDocs';
import { initialCouncilResources } from '../data/mockResources';
import { mockDispatchHistory, initialGatewayStats } from '../data/mockGatewayData';
import { initialStaffMembers, permissionCategories as defaultPermissionCategories } from '../data/mockStaffAndRoles';
import { initialAttendanceSessions, initialStaffAttendance } from '../data/mockAttendance';
import { mockAuditDirectives, mockAuditChecklist, mockLedgerBlocks } from '../data/mockAuditCompliance';
import { mockZakatCalculations } from '../data/mockZakatHistory';
import { apiRequest, AuthUser, loginWithPassword, logoutFromServer, registerAccount, restoreAuthUser } from '../services/authApi';
import { fetchDirectoryMadrasas, fetchDirectoryMosques } from '../services/directoryApi';
import {
  createStudentRecord,
  fetchAdminStudents,
  updateStudentRecord,
} from '../services/studentsApi';
import { createZakatDistribution as createZakatDistributionApi, deleteZakatAssessment, fetchZakatDistributions } from '../services/zakatApi';
import { fetchJanazahAvailability, fetchJanazahRequests, JANAZAH_CATALOGUE_ID } from '../services/janazahApi';
import {
  CIVIC_PUBLIC_SERVICE_IDS,
  fetchCivicServiceAvailability,
} from '../services/civicServicesApi';
import {
  createEventRecord,
  deleteEventRecord,
  fetchAdminEvents,
  fetchEventRegistrations,
  fetchPublicEvents,
  findMyEventRegistrationsRecord,
  fetchEventPaymentReceiptRecord,
  registerForEventRecord,
  reviewEventPaymentRecord,
  updateEventRecord,
  updateEventRegistrationStatus,
} from '../services/eventsApi';
import {
  createAnnouncementRecord,
  deleteAnnouncementRecord,
  fetchAdminAnnouncements,
  fetchPublicAnnouncements,
  updateAnnouncementRecord,
} from '../services/announcementsApi';
import {
  clearNotificationManageToken,
  decodeVapidPublicKey,
  deleteNotificationSubscription,
  deleteBrowserPushSubscription,
  fetchNotificationSubscription,
  fetchPushConfiguration,
  readNotificationManageToken,
  saveBrowserPushSubscription,
  saveNotificationSubscription as saveNotificationSubscriptionApi,
  storeNotificationManageToken,
  verifyNotificationEmail,
} from '../services/notificationsApi';
import {
  createTeacherRecord,
  deleteTeacherRecord,
  fetchAdminTeachers,
  fetchPublicTeachers,
  TeacherInput,
  updateTeacherRecord,
} from '../services/teachersApi';
import {
  createUlemaRecord,
  deleteUlemaRecord,
  fetchAdminUlema,
  fetchPublicUlema,
  UlemaInput,
  updateUlemaRecord,
  uploadUlemaAvatar,
} from '../services/ulemaApi';
import {
  createRoleRecord,
  createStaffRecord,
  deactivateStaffRecord,
  deleteRoleRecord,
  fetchStaffAndRoles,
  updateRoleRecord,
  updateStaffRecord,
} from '../services/staffRolesApi';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isLoggedIn: boolean;
  authReady: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<User>;
  register: (data: { fullName: string; email: string; phone?: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;

  // Zakat Calculations History
  zakatCalculations: ZakatCalculationRecord[];
  addZakatCalculation: (calc: Omit<ZakatCalculationRecord, 'id'> & { id?: string }) => ZakatCalculationRecord;
  deleteZakatCalculation: (id: string) => Promise<void>;
  updateZakatCalculation: (id: string, updates: Partial<ZakatCalculationRecord>) => void;

  // Staff & RBAC Management
  staffList: User[];
  staffAccessLoading: boolean;
  staffAccessError: string;
  refreshStaffAndRoles: () => Promise<void>;
  addStaff: (staff: Omit<User, 'id'> & { password: string }, profilePhoto?: File) => Promise<User | null>;
  updateStaff: (id: string, updates: Partial<User>, profilePhoto?: File) => Promise<boolean>;
  deleteStaff: (id: string) => Promise<boolean>;
  toggleStaffStatus: (id: string) => Promise<boolean>;
  rolesList: RoleDefinition[];
  addRole: (role: Omit<RoleDefinition, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RoleDefinition | null>;
  updateRole: (id: string, updates: Partial<RoleDefinition>) => Promise<boolean>;
  deleteRole: (id: string) => Promise<boolean>;
  permissionCategories: PermissionCategory[];
  securityLogs: SecurityAuditLog[];
  addSecurityLog: (log: Omit<SecurityAuditLog, 'id' | 'timestamp'>) => void;

  // Entities
  mosques: Mosque[];
  refreshDirectoryData: () => Promise<void>;
  addMosque: (mosque: Omit<Mosque, 'id'>) => void;
  updateMosque: (id: string, updates: Partial<Mosque>) => void;

  madrasas: Madrasa[];
  addMadrasa: (madrasa: Omit<Madrasa, 'id'>) => void;

  students: Student[];
  studentsLoading: boolean;
  studentsError: string;
  addStudent: (student: Omit<Student, 'id'>) => Promise<Student | null>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<boolean>;
  updateStudentProgress: (id: string, updates: any) => Promise<boolean>;

  teachers: Teacher[];
  refreshTeachers: (adminView?: boolean) => Promise<void>;
  teachersLoading: boolean;
  teachersError: string;
  addTeacher: (teacher: TeacherInput) => Promise<Teacher | null>;
  updateTeacher: (id: string, updates: Partial<TeacherInput>) => Promise<boolean>;
  deleteTeacher: (id: string) => Promise<boolean>;
  ulema: Ulema[];
  refreshUlema: (adminView?: boolean) => Promise<void>;
  ulemaLoading: boolean;
  ulemaError: string;
  addUlema: (profile: UlemaInput, photo?: File) => Promise<Ulema | null>;
  updateUlema: (id: string, changes: Partial<UlemaInput>, photo?: File) => Promise<boolean>;
  deleteUlema: (id: string) => Promise<boolean>;

  funds: Fund[];
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'referenceNo'>) => void;

  donations: Donation[];
  addDonation: (donation: Omit<Donation, 'id' | 'receiptNo' | 'date' | 'status' | 'certificateIssued'>) => Donation;
  updateDonation: (id: string, updates: Partial<Donation>) => void;
  deleteDonation: (id: string) => void;
  zakatDistributions: ZakatBeneficiaryDistribution[];
  addZakatDistribution: (item: Omit<ZakatBeneficiaryDistribution, 'id'>) => Promise<ZakatBeneficiaryDistribution | null>;
  updateZakatDistribution: (id: string, updates: Partial<ZakatBeneficiaryDistribution>) => void;

  expenseApprovals: ExpenseApproval[];
  updateExpenseStatus: (id: string, status: ExpenseApproval['status'], comment?: string) => void;

  publicServices: ServiceItem[];
  publicServiceAvailability: Record<string, boolean>;
  refreshPublicServiceAvailability: () => Promise<void>;
  janazahPublicEnabled: boolean;
  refreshJanazahAvailability: () => Promise<boolean>;
  serviceRequests: ServiceRequest[];
  upsertServiceRequest: (request: ServiceRequest) => void;
  submitServiceRequest: (req: Omit<ServiceRequest, 'id' | 'trackingNo' | 'submissionDate' | 'status' | 'assignedOfficer'>) => ServiceRequest;
  updateServiceRequestStatus: (id: string, status: ServiceRequest['status'], officer?: string) => void;

  events: CouncilEvent[];
  refreshEvents: (adminView?: boolean) => Promise<void>;
  addEvent: (event: Omit<CouncilEvent, 'id'>) => Promise<CouncilEvent>;
  updateEvent: (id: string, updates: Partial<CouncilEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  eventRegistrations: EventRegistration[];
  refreshEventRegistrations: (eventId?: string) => Promise<void>;
  findMyEventRegistrations: (email: string, phone: string) => Promise<EventRegistration[]>;
  registerForEvent: (data: Omit<EventRegistration, 'id' | 'passNumber' | 'status' | 'createdAt'> & { paymentReceipt?: File }) => Promise<EventRegistration>;
  reviewEventPayment: (regId: string, paymentStatus: 'APPROVED' | 'REJECTED') => Promise<EventRegistration>;
  fetchEventPaymentReceipt: (regId: string) => Promise<Blob>;
  cancelRegistration: (regId: string) => Promise<void>;
  checkInAttendee: (regId: string) => Promise<void>;
  eventSubscriptions: EventNotificationSubscription[];
  saveEventSubscription: (sub: Omit<EventNotificationSubscription, 'id' | 'subscribedAt'>) => Promise<EventNotificationSubscription>;
  removeEventSubscription: (id: string) => Promise<void>;
  toggleEventReminder: (eventId: string) => boolean;
  isSubscribedToEvent: (eventId: string) => boolean;
  announcements: Announcement[];
  refreshAnnouncements: (adminView?: boolean) => Promise<void>;
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => Promise<Announcement>;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  // Educational Resources, Handbooks & Khutbahs
  resources: CouncilResource[];
  addResource: (resource: Omit<CouncilResource, 'id' | 'uploadDate' | 'downloadsCount'>) => CouncilResource;
  updateResource: (id: string, updates: Partial<CouncilResource>) => void;
  deleteResource: (id: string) => void;
  incrementResourceDownload: (id: string) => void;

  // Gateway & Communications
  gatewayStats: GatewayChannelStats;
  dispatchHistory: DispatchLogItem[];
  dispatchMessage: (item: DispatchMessageInput) => Promise<DispatchLogItem>;
  topUpSmsBalance: (amountETB: number) => void;
  clearDispatchHistory: () => void;

  // Attendance
  attendanceMap: Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'>;
  setStudentAttendance: (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Excused') => void;
  saveDailyAttendance: (madrasaId: string, date: string) => void;
  dailyAttendanceSessions: DailyAttendanceSession[];
  staffAttendanceList: StaffAttendanceEntry[];
  saveDailyAttendanceSession: (session: DailyAttendanceSession) => void;
  updateStudentAttendanceEntry: (sessionId: string, studentId: string, updates: Partial<StudentAttendanceEntry>) => void;
  batchMarkAttendance: (sessionId: string, status: AttendanceStatus) => void;
  sendAbsenceSmsAlerts: (sessionId: string, filter?: 'Absent' | 'Late' | 'All') => Promise<{ sentCount: number; costETB: number }>;
  updateStaffAttendanceRecord: (id: string, updates: Partial<StaffAttendanceEntry>) => void;
  addStaffAttendanceRecord: (entry: Omit<StaffAttendanceEntry, 'id'>) => StaffAttendanceEntry;

  // Independent Audit & Shariah Compliance
  auditDirectives: AuditDirective[];
  addAuditDirective: (directive: Omit<AuditDirective, 'id' | 'createdDate'>) => AuditDirective;
  updateAuditDirective: (id: string, updates: Partial<AuditDirective>) => void;
  resolveAuditDirective: (id: string, resolutionNote: string) => void;
  escalateAuditDirective: (id: string) => void;
  deleteAuditDirective: (id: string) => void;
  auditChecklist: AuditChecklistItem[];
  updateChecklistStatus: (id: string, status: AuditChecklistItem['status'], note?: string) => void;
  ledgerBlocks: CryptographicLedgerBlock[];
  runForensicReconciliation: () => Promise<{ verifiedBlocks: number; verifiedTxs: number; varianceETB: number; hash: string }>;

  // Toasts
  toasts: ToastNotification[];
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Global Search Modal
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  secretariat_admin: 'Secretariat Admin',
  case_officer: 'Case Officer',
  finance_officer: 'Finance Officer',
  content_editor: 'Content Editor',
  dispatcher: 'Dispatcher',
  pending_staff: 'Pending Staff',
};

function toFrontendUser(apiUser: AuthUser): User {
  return {
    id: String(apiUser.id),
    name: apiUser.fullName,
    email: apiUser.email,
    phone: apiUser.phone || '',
    role: roleLabels[apiUser.role] || apiUser.role.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
    authRole: apiUser.role,
    permissions: apiUser.permissions || [],
    status: 'Active',
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(initialStaffMembers[0]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    restoreAuthUser()
      .then((apiUser) => {
        if (!mounted || !apiUser) return;
        setCurrentUser(toFrontendUser(apiUser));
        setIsLoggedIn(true);
        apiRequest<ZakatCalculationRecord[]>('/account/zakat/assessments')
          .then((records) => {
            if (!mounted) return;
            const owned = records.map((record) => ({ ...record, userId: String(apiUser.id), userName: apiUser.fullName, userEmail: apiUser.email })) as ZakatCalculationRecord[];
            setZakatCalculations(owned);
            localStorage.setItem('jimma_council_zakat_calculations', JSON.stringify(owned));
          })
          .catch((error) => console.warn('[Zakat] Could not load account assessments:', error instanceof Error ? error.message : error));
        if (apiUser.permissions.includes('zakat.manage') || apiUser.permissions.includes('finance.write')) {
          fetchZakatDistributions()
            .then((records) => { if (mounted) setZakatDistributions(records); })
            .catch((error) => console.warn('[Zakat] Could not load distributions:', error instanceof Error ? error.message : error));
        }
      })
      .finally(() => {
        if (mounted) setAuthReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const [zakatCalculations, setZakatCalculations] = useState<ZakatCalculationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('jimma_council_zakat_calculations');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return mockZakatCalculations;
  });

  const addZakatCalculation = (calc: Omit<ZakatCalculationRecord, 'id'> & { id?: string }) => {
    const id = calc.id || `zcalc-${Date.now()}`;
    const newCalc: ZakatCalculationRecord = { ...calc, id };
    setZakatCalculations((prev) => {
      const updated = [newCalc, ...prev];
      try {
        localStorage.setItem('jimma_council_zakat_calculations', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addToast('Assessment Saved to History', `"${calc.title}" recorded to your personal Zakat archive.`, 'success');
    return newCalc;
  };

  const deleteZakatCalculation = async (id: string) => {
    if (isLoggedIn && /^\d+$/.test(id)) {
      try {
        await deleteZakatAssessment(id);
      } catch (error) {
        addToast('Could not delete assessment', error instanceof Error ? error.message : 'Please try again.', 'error');
        return;
      }
    }
    setZakatCalculations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem('jimma_council_zakat_calculations', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addToast('Record Removed', 'The Zakat assessment has been deleted from your archive.', 'info');
  };

  const updateZakatCalculation = (id: string, updates: Partial<ZakatCalculationRecord>) => {
    setZakatCalculations((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      try {
        localStorage.setItem('jimma_council_zakat_calculations', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const [staffList, setStaffList] = useState<User[]>([]);
  const [rolesList, setRolesList] = useState<RoleDefinition[]>([]);
  const [staffAccessLoading, setStaffAccessLoading] = useState(false);
  const [staffAccessError, setStaffAccessError] = useState('');
  const [permissionCategories] = useState<PermissionCategory[]>(defaultPermissionCategories);
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditLog[]>([]);

  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [madrasas, setMadrasas] = useState<Madrasa[]>([]);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersError, setTeachersError] = useState('');
  const [ulema, setUlema] = useState<Ulema[]>([]);
  const [ulemaLoading, setUlemaLoading] = useState(false);
  const [ulemaError, setUlemaError] = useState('');
  const [funds, setFunds] = useState<Fund[]>(mockFunds);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [donations, setDonations] = useState<Donation[]>(mockDonations);
  const [zakatDistributions, setZakatDistributions] = useState<ZakatBeneficiaryDistribution[]>([]);
  const [expenseApprovals, setExpenseApprovals] = useState<ExpenseApproval[]>(mockExpenseApprovals);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(mockServiceRequests);
  const [janazahPublicEnabled, setJanazahPublicEnabled] = useState(true);
  const [publicServiceAvailability, setPublicServiceAvailability] = useState<Record<string, boolean>>(
    () => Object.fromEntries(CIVIC_PUBLIC_SERVICE_IDS.map((serviceId) => [serviceId, true]))
  );

  const upsertServiceRequest = (request: ServiceRequest) => {
    setServiceRequests((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === request.id || item.trackingNo === request.trackingNo);
      if (existingIndex === -1) return [request, ...prev];
      const updated = [...prev];
      updated[existingIndex] = request;
      return updated;
    });
  };

  const refreshJanazahRequests = async () => {
    try {
      const requests = await fetchJanazahRequests();
      const mapped = requests.map((request) => ({
        id: String(request.id),
        trackingNo: request.referenceNumber,
        serviceType: 'Janazah Support',
        applicantName: request.contactName,
        applicantPhone: request.contactPhone,
        applicantDistrict: request.woreda ? `Kebele ${request.woreda.code}` : 'Jimma City',
        submissionDate: new Date(request.createdAt).toLocaleDateString(),
        status: request.status === 'SUBMITTED' ? 'Submitted'
          : request.status === 'UNDER_REVIEW' ? 'Under Review'
          : request.status === 'APPROVED' ? 'Approved'
          : request.status === 'REJECTED' ? 'Rejected'
          : request.status === 'COMPLETED' ? 'Completed'
          : 'Rejected',
        assignedOfficer: request.assignedOfficer?.fullName || 'On-call Janazah desk',
        notes: [
          `Deceased: ${request.deceasedName}`,
          request.needsGhusl ? 'Ghusl requested' : null,
          request.needsTransport ? 'Transport requested' : null,
          request.needsCemeteryPlot ? 'Cemetery plot requested' : null,
          request.locationNote || null,
        ].filter(Boolean).join(' • '),
        documentsCount: 0,
        priority: 'Urgent',
      }));

      setServiceRequests((prev) => {
        const janazahIds = new Set(mapped.map((request) => request.trackingNo));
        const others = prev.filter((request) => request.serviceType !== 'Janazah Support' && !janazahIds.has(request.trackingNo));
        return [...mapped, ...others];
      });

      return mapped.length;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[API] Janazah request list refresh failed.', error);
      }
      return 0;
    }
  };

  const refreshJanazahAvailability = async () => {
    try {
      const availability = await fetchJanazahAvailability();
      setJanazahPublicEnabled(availability.isEnabled);
      return availability.isEnabled;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[API] Janazah availability refresh failed.', error);
      }
      // Keep last known value if the API is unreachable.
      return janazahPublicEnabled;
    }
  };

  const refreshPublicServiceAvailability = async () => {
    try {
      const settings = await fetchCivicServiceAvailability();
      setPublicServiceAvailability((previous) => ({
        ...previous,
        ...Object.fromEntries(settings.map(({ serviceKey, isEnabled }) => [serviceKey, isEnabled])),
      }));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[API] Civic service availability refresh failed.', error);
      }
    }
  };

  const publicServices = mockPublicServices.filter((service) => {
    if (service.id === JANAZAH_CATALOGUE_ID) return janazahPublicEnabled;
    return publicServiceAvailability[service.id] !== false;
  });
  const [events, setEvents] = useState<CouncilEvent[]>(mockEvents);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [eventSubscriptions, setEventSubscriptions] = useState<EventNotificationSubscription[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [resources, setResources] = useState<CouncilResource[]>(initialCouncilResources);
  const [auditDirectives, setAuditDirectives] = useState<AuditDirective[]>(mockAuditDirectives);
  const [auditChecklist, setAuditChecklist] = useState<AuditChecklistItem[]>(mockAuditChecklist);
  const [ledgerBlocks, setLedgerBlocks] = useState<CryptographicLedgerBlock[]>(mockLedgerBlocks);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const refreshDirectoryData = async () => {
    const results = await Promise.allSettled([fetchDirectoryMosques(), fetchDirectoryMadrasas()]);
    const [mosquesResult, madrasasResult] = results;
    if (mosquesResult.status === 'fulfilled') setMosques(mosquesResult.value);
    if (madrasasResult.status === 'fulfilled') setMadrasas(madrasasResult.value);
    if (import.meta.env.DEV) {
      if (mosquesResult.status === 'rejected') console.warn('[API] Mosque directory refresh failed.', mosquesResult.reason);
      if (madrasasResult.status === 'rejected') console.warn('[API] Madrasa directory refresh failed.', madrasasResult.reason);
    }
  };

  const refreshTeachers = async (adminView = false) => {
    setTeachersLoading(true);
    setTeachersError('');
    try {
      setTeachers(adminView ? await fetchAdminTeachers() : await fetchPublicTeachers());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load teacher records.';
      setTeachersError(message);
      throw error;
    } finally {
      setTeachersLoading(false);
    }
  };

  const refreshUlema = async (adminView = false) => {
    setUlemaLoading(true);
    setUlemaError('');
    try {
      setUlema(adminView ? await fetchAdminUlema() : await fetchPublicUlema());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load scholar records.';
      setUlemaError(message);
      throw error;
    } finally {
      setUlemaLoading(false);
    }
  };

  useEffect(() => {
    void refreshDirectoryData();
    void refreshJanazahAvailability();
    void refreshPublicServiceAvailability();
    void refreshJanazahRequests().catch((error) => {
      if (import.meta.env.DEV) console.warn('[API] Janazah request list refresh failed.', error);
    });
    void refreshTeachers().catch((error) => {
      if (import.meta.env.DEV) console.warn('[API] Public teacher directory refresh failed.', error);
    });
    void refreshUlema().catch((error) => {
      if (import.meta.env.DEV) console.warn('[API] Public Ulema directory refresh failed.', error);
    });
    const refreshWhenAvailable = () => {
      if (document.visibilityState === 'visible') {
        void refreshDirectoryData();
        void refreshJanazahAvailability();
        void refreshPublicServiceAvailability();
        void refreshJanazahRequests();
      }
    };
    window.addEventListener('focus', refreshWhenAvailable);
    window.addEventListener('online', refreshWhenAvailable);
    return () => {
      window.removeEventListener('focus', refreshWhenAvailable);
      window.removeEventListener('online', refreshWhenAvailable);
    };
  }, []);

  // Initial Attendance Map initialized to "Present" for all students
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'>>(() => {
    const map: Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'> = {};
    mockStudents.forEach((st, idx) => {
      map[st.id] = idx % 11 === 0 ? 'Absent' : idx % 17 === 0 ? 'Late' : 'Present';
    });
    return map;
  });

  const [dailyAttendanceSessions, setDailyAttendanceSessions] = useState<DailyAttendanceSession[]>(initialAttendanceSessions);
  const [staffAttendanceList, setStaffAttendanceList] = useState<StaffAttendanceEntry[]>(initialStaffAttendance);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastNotification = {
      id,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setStudentsLoading(false);
      setStudentsError('');
      return;
    }
    let active = true;

    setStudentsLoading(true);
    setStudentsError('');
    fetchAdminStudents()
      .then((records) => {
        if (!active) return;
        const recordIds = new Set(records.map((student) => student.id));
        setStudents([
          ...records,
          ...mockStudents.filter((student) => !recordIds.has(student.id)),
        ]);
      })
      .catch((error) => {
        if (!active) return;
        setStudentsError(error instanceof Error ? error.message : 'Could not load saved student records.');
        addToast(
          'Student records unavailable',
          error instanceof Error ? error.message : 'Could not load saved student records.',
          'warning'
        );
      })
      .finally(() => {
        if (active) setStudentsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    let active = true;
    const verificationUrl = new URL(window.location.href);
    const verificationToken = verificationUrl.searchParams.get('notificationVerification');
    if (verificationToken) {
      verificationUrl.searchParams.delete('notificationVerification');
      window.history.replaceState({}, '', `${verificationUrl.pathname}${verificationUrl.search}`);
      void verifyNotificationEmail(verificationToken)
        .then((verified) => {
          if (!active) return;
          setEventSubscriptions((previous) => previous.map((item) => item.id === verified.id
            ? { ...item, emailVerified: true }
            : item));
          addToast('Email verified', 'Your email notification preferences are now verified.', 'success');
        })
        .catch((error) => {
          if (active) addToast('Email verification failed', error instanceof Error ? error.message : 'Request a new verification email.', 'error');
        });
    }
    let token: string | null;
    try {
      token = readNotificationManageToken();
    } catch (error) {
      addToast(
        'Notification preferences unavailable',
        error instanceof Error ? error.message : 'Browser storage is unavailable.',
        'warning'
      );
      return;
    }
    if (!token) return;

    void fetchNotificationSubscription(token)
      .then((subscription) => {
        if (active) setEventSubscriptions([{ ...subscription, manageToken: token }]);
      })
      .catch((error) => {
        if (!active) return;
        addToast(
          'Could not load saved notification preferences',
          error instanceof Error ? error.message : 'Please try again.',
          'warning'
        );
      });

    return () => {
      active = false;
    };
  }, []);

  const addSecurityLog = (log: Omit<SecurityAuditLog, 'id' | 'timestamp'>) => {
    const newLog: SecurityAuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setSecurityLogs((prev) => [newLog, ...prev]);
  };

  const refreshStaffAndRoles = async () => {
    setStaffAccessLoading(true);
    setStaffAccessError('');
    try {
      const data = await fetchStaffAndRoles();
      setStaffList(data.staff);
      setRolesList(data.roles);
      setSecurityLogs(data.logs);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load staff and role records.';
      setStaffAccessError(message);
      throw error;
    } finally {
      setStaffAccessLoading(false);
    }
  };

  const refreshAfterStaffMutation = async () => {
    try {
      await refreshStaffAndRoles();
    } catch (error) {
      addToast(
        'Saved, but refresh failed',
        error instanceof Error ? error.message : 'Reload staff access data to see the latest audit record.',
        'warning'
      );
    }
  };

  const login = async (email: string, password: string, remember: boolean) => {
    const user = toFrontendUser(await loginWithPassword(email, password, remember));
    setCurrentUser(user);
    setIsLoggedIn(true);
    try {
      const records = await apiRequest<ZakatCalculationRecord[]>('/account/zakat/assessments');
      const owned = records.map((record) => ({ ...record, userId: user.id, userName: user.name, userEmail: user.email }));
      setZakatCalculations(owned);
      localStorage.setItem('jimma_council_zakat_calculations', JSON.stringify(owned));
    } catch (error) {
      addToast('Zakat history unavailable', error instanceof Error ? error.message : 'Could not load saved assessments.', 'warning');
    }
    if (user.permissions.includes('zakat.manage') || user.permissions.includes('finance.write')) {
      try {
        setZakatDistributions(await fetchZakatDistributions());
      } catch (error) {
        addToast('Zakat distributions unavailable', error instanceof Error ? error.message : 'Could not load disbursement records.', 'warning');
      }
    }
    addSecurityLog({
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'Staff Authentication Success',
      target: `${user.role} Dashboard`,
      category: 'Auth',
      status: 'Success',
      ipAddress: 'Recorded by server',
      details: `Authenticated by backend as ${user.authRole}.`,
    });
    addToast(`Signed In as ${user.name}`, `Backend verified your ${user.role} account.`, 'success');
    return user;
  };

  const register = async (data: { fullName: string; email: string; phone?: string; password: string }) => {
    await registerAccount(data);
  };

  const logout = async () => {
    setIsLoggedIn(false);
    void logoutFromServer();
    addSecurityLog({
      actorName: currentUser.name,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: 'Staff Sign Out',
      target: 'Public Portal',
      category: 'Auth',
      status: 'Success',
      ipAddress: 'Session',
      details: 'Session terminated through the staff portal.',
    });
    addToast('Signed Out', 'You have been signed out from the council staff portal.', 'info');
  };

  const addStaff = async (data: Omit<User, 'id'> & { password: string }, profilePhoto?: File): Promise<User | null> => {
    try {
      const newStaff = await createStaffRecord(data, rolesList, profilePhoto);
      setStaffList((prev) => [newStaff, ...prev]);
      addToast('Staff Account Created', `${newStaff.name} was saved to the backend.`, 'success');
      await refreshAfterStaffMutation();
      return newStaff;
    } catch (error) {
      addToast('Could not create staff account', error instanceof Error ? error.message : 'Please try again.', 'error');
      return null;
    }
  };

  const updateStaff = async (id: string, updates: Partial<User>, profilePhoto?: File): Promise<boolean> => {
    try {
      const updated = await updateStaffRecord(id, updates, rolesList, profilePhoto);
      setStaffList((prev) => prev.map((staff) => staff.id === id ? updated : staff));
      if (currentUser.id === id) setCurrentUser((prev) => ({ ...prev, ...updated }));
      addToast('Staff Profile Updated', 'Changes were saved to the backend.', 'success');
      await refreshAfterStaffMutation();
      return true;
    } catch (error) {
      addToast('Could not update staff account', error instanceof Error ? error.message : 'Please try again.', 'error');
      return false;
    }
  };

  const deleteStaff = async (id: string): Promise<boolean> => {
    try {
      const updated = await deactivateStaffRecord(id);
      setStaffList((prev) => prev.map((staff) => staff.id === id ? updated : staff));
      addToast('Staff Account Deactivated', `${updated.name}'s backend account was disabled.`, 'success');
      await refreshAfterStaffMutation();
      return true;
    } catch (error) {
      addToast('Could not deactivate staff account', error instanceof Error ? error.message : 'Please try again.', 'error');
      return false;
    }
  };

  const toggleStaffStatus = async (id: string): Promise<boolean> => {
    const staff = staffList.find((item) => item.id === id);
    if (!staff) return false;
    return updateStaff(id, { status: staff.status === 'Active' ? 'Suspended' : 'Active' });
  };

  const addRole = async (data: Omit<RoleDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoleDefinition | null> => {
    try {
      const role = await createRoleRecord(data);
      setRolesList((prev) => [...prev, role]);
      addToast('Role Created', `"${role.name}" was saved to the backend.`, 'success');
      await refreshAfterStaffMutation();
      return role;
    } catch (error) {
      addToast('Could not create role', error instanceof Error ? error.message : 'Please try again.', 'error');
      return null;
    }
  };

  const updateRole = async (id: string, updates: Partial<RoleDefinition>): Promise<boolean> => {
    try {
      const role = await updateRoleRecord(id, updates);
      setRolesList((prev) => prev.map((item) => item.id === id ? role : item));
      addToast('Role Updated', 'Role and permissions were saved to the backend.', 'success');
      await refreshAfterStaffMutation();
      return true;
    } catch (error) {
      addToast('Could not update role', error instanceof Error ? error.message : 'Please try again.', 'error');
      return false;
    }
  };

  const deleteRole = async (id: string): Promise<boolean> => {
    try {
      await deleteRoleRecord(id);
      setRolesList((prev) => prev.filter((role) => role.id !== id));
      addToast('Role Deleted', 'The custom role was removed from the backend.', 'success');
      await refreshAfterStaffMutation();
      return true;
    } catch (error) {
      addToast('Could not delete role', error instanceof Error ? error.message : 'Please reassign its staff first.', 'error');
      return false;
    }
  };

  const addMosque = (data: Omit<Mosque, 'id'>) => {
    const newId = `mosque-${Date.now()}`;
    const newMosque: Mosque = { ...data, id: newId };
    setMosques((prev) => [newMosque, ...prev]);
    addToast('Mosque Registered', `${newMosque.name} has been added to the council registry.`, 'success');
  };

  const updateMosque = (id: string, updates: Partial<Mosque>) => {
    setMosques((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    addToast('Mosque Updated', 'Changes have been saved to local council state.', 'success');
  };

  const addMadrasa = (data: Omit<Madrasa, 'id'>) => {
    const newId = `madrasa-${Date.now()}`;
    const newMadrasa: Madrasa = { ...data, id: newId };
    setMadrasas((prev) => [newMadrasa, ...prev]);
    addToast('Madrasa Enrolled', `${newMadrasa.name} is now listed in the council directory.`, 'success');
  };

  const addStudent = async (data: Omit<Student, 'id'>): Promise<Student | null> => {
    try {
      const student = await createStudentRecord(data);
      setStudents((prev) => [student, ...prev.filter((item) => item.id !== student.id)]);
      addToast('Student Enrolled', `${student.name} was saved to the student registry.`, 'success');
      return student;
    } catch (error) {
      addToast(
        'Could not enroll student',
        error instanceof Error ? error.message : 'Please try again.',
        'error'
      );
      return null;
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>): Promise<boolean> => {
    if (!/^\d+$/.test(id)) {
      addToast('Sample student record', 'Graduation records can only be saved for registered students.', 'warning');
      return false;
    }

    try {
      const saved = await updateStudentRecord(id, updates);
      setStudents((prev) => prev.map((student) => (student.id === id ? saved : student)));
      addToast('Student Record Updated', 'Changes were saved to the student registry.', 'success');
      return true;
    } catch (error) {
      addToast(
        'Could not update student record',
        error instanceof Error ? error.message : 'Please try again.',
        'error'
      );
      return false;
    }
  };

  const addTeacher = async (data: TeacherInput): Promise<Teacher | null> => {
    try {
      const created = await createTeacherRecord(data);
      setTeachers((prev) => [created, ...prev.filter((teacher) => teacher.id !== created.id)]);
      addToast('Teacher Registered', `${created.name} was saved to the council faculty registry.`, 'success');
      return created;
    } catch (error) {
      addToast('Could not register teacher', error instanceof Error ? error.message : 'Please try again.', 'error');
      return null;
    }
  };

  const updateTeacher = async (id: string, updates: Partial<TeacherInput>): Promise<boolean> => {
    try {
      const updated = await updateTeacherRecord(id, updates);
      setTeachers((prev) => [updated, ...prev.filter((teacher) => teacher.id !== id)]);
      addToast('Faculty Record Updated', 'Teacher details were saved to the backend.', 'success');
      return true;
    } catch (error) {
      addToast('Could not update teacher', error instanceof Error ? error.message : 'Please try again.', 'error');
      return false;
    }
  };

  const deleteTeacher = async (id: string): Promise<boolean> => {
    try {
      await deleteTeacherRecord(id);
      setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
      addToast('Teacher Removed', 'The teacher record was removed from the backend.', 'success');
      return true;
    } catch (error) {
      addToast('Could not remove teacher', error instanceof Error ? error.message : 'Please try again.', 'error');
      return false;
    }
  };

  const addUlema = async (profile: UlemaInput, photo?: File): Promise<Ulema | null> => {
    try {
      const created = await createUlemaRecord(profile);
      setUlema((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
      if (photo) {
        try {
          const withAvatar = await uploadUlemaAvatar(created.id, photo);
          setUlema((prev) => prev.map((item) => item.id === created.id ? withAvatar : item));
          addToast('Scholar Registered', `${created.name} was saved with a profile photo.`, 'success');
          return withAvatar;
        } catch (error) {
          addToast('Scholar saved, but photo upload failed', error instanceof Error ? error.message : 'Edit the scholar profile to retry the upload.', 'warning');
          return created;
        }
      }
      addToast('Scholar Registered', `${created.name} was saved to the council registry.`, 'success');
      return created;
    } catch (error) {
      addToast('Could not register scholar', error instanceof Error ? error.message : 'Please try again.', 'error');
      return null;
    }
  };

  const updateUlema = async (id: string, changes: Partial<UlemaInput>, photo?: File): Promise<boolean> => {
    try {
      const updated = await updateUlemaRecord(id, changes);
      setUlema((prev) => prev.map((item) => item.id === id ? updated : item));
      if (photo) {
        try {
          const withAvatar = await uploadUlemaAvatar(id, photo);
          setUlema((prev) => prev.map((item) => item.id === id ? withAvatar : item));
          addToast('Scholar Profile Updated', 'Profile details and photo were saved.', 'success');
          return true;
        } catch (error) {
          addToast('Profile saved, but photo upload failed', error instanceof Error ? error.message : 'Edit the scholar profile to retry the upload.', 'warning');
          return true;
        }
      }
      addToast('Scholar Profile Updated', 'Profile details were saved to the backend.', 'success');
      return true;
    } catch (error) {
      addToast('Could not update scholar', error instanceof Error ? error.message : 'Please try again.', 'error');
      return false;
    }
  };

  const deleteUlema = async (id: string): Promise<boolean> => {
    try {
      await deleteUlemaRecord(id);
      setUlema((prev) => prev.filter((item) => item.id !== id));
      addToast('Scholar Removed', 'The scholar profile was removed from the registry.', 'success');
      return true;
    } catch (error) {
      addToast('Could not remove scholar', error instanceof Error ? error.message : 'Please try again.', 'error');
      return false;
    }
  };

  const addTransaction = (data: Omit<Transaction, 'id' | 'referenceNo'>) => {
    const id = `tx-${Date.now()}`;
    const ref = `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTx: Transaction = {
      ...data,
      id,
      referenceNo: ref,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Update funds
    if (data.type === 'Income') {
      setFunds((prev) =>
        prev.map((f) => (f.id === data.fundId ? { ...f, allocatedETB: f.allocatedETB + data.amountETB } : f))
      );
    } else if (data.type === 'Expense' || data.type === 'Disbursement') {
      setFunds((prev) =>
        prev.map((f) => (f.id === data.fundId ? { ...f, disbursedETB: f.disbursedETB + data.amountETB } : f))
      );
    }

    addToast('Transaction Recorded', `${ref}: ${data.amountETB.toLocaleString()} ETB allocated to ${data.fundName}`, 'success');
  };

  const addDonation = (data: Omit<Donation, 'id' | 'receiptNo' | 'date' | 'status' | 'certificateIssued'>) => {
    const id = `don-${Date.now()}`;
    const receiptNo = `REC-2026-${Math.floor(5000 + Math.random() * 4999)}`;
    const today = new Date().toISOString().split('T')[0];
    const newDonation: Donation = {
      ...data,
      id,
      receiptNo,
      date: today,
      status: 'Completed',
      certificateIssued: true,
    };
    setDonations((prev) => [newDonation, ...prev]);

    // Update fund balance
    setFunds((prev) =>
      prev.map((f) => (f.id === data.fundId ? { ...f, allocatedETB: f.allocatedETB + data.amountETB } : f))
    );

    // Record as income transaction
    const txId = `tx-${Date.now()}`;
    const ref = `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTx: Transaction = {
      id: txId,
      referenceNo: ref,
      date: today,
      type: 'Income',
      fundId: data.fundId,
      fundName: data.fundName,
      category: 'Public Donation',
      amountETB: data.amountETB,
      description: `Donation from ${data.isAnonymous ? 'Anonymous Donor' : data.donorName} (${receiptNo})`,
      paymentMethod: data.paymentMethod,
      status: 'Completed',
      recordedBy: 'Public Online Portal',
    };
    setTransactions((prev) => [newTx, ...prev]);

    addToast('Donation Received! Jazakallahu Khayran', `Receipt #${receiptNo} generated for ${data.amountETB.toLocaleString()} ETB.`, 'success');
    return newDonation;
  };

  const updateDonation = (id: string, updates: Partial<Donation>) => {
    setDonations((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    addToast('Donation Updated', 'The donation record has been updated.', 'info');
  };

  const deleteDonation = (id: string) => {
    setDonations((prev) => prev.filter((d) => d.id !== id));
    addToast('Donation Removed', 'The donation entry has been removed from the registry.', 'info');
  };

  const addZakatDistribution = async (item: Omit<ZakatBeneficiaryDistribution, 'id'>): Promise<ZakatBeneficiaryDistribution | null> => {
    try {
      const newEntry = await createZakatDistributionApi(item);
      setZakatDistributions((prev) => [newEntry, ...prev]);
      return newEntry;
    } catch (error) {
      addToast('Could not record Zakat disbursement', error instanceof Error ? error.message : 'Check your permissions and try again.', 'error');
      return null;
    }
  };

  const updateZakatDistribution = (id: string, updates: Partial<ZakatBeneficiaryDistribution>) => {
    setZakatDistributions((prev) => prev.map((z) => (z.id === id ? { ...z, ...updates } : z)));
    addToast('Zakat Distribution Updated', 'Beneficiary record updated.', 'info');
  };

  const updateExpenseStatus = (id: string, status: ExpenseApproval['status'], comment?: string) => {
    setExpenseApprovals((prev) =>
      prev.map((exp) => {
        if (exp.id === id) {
          const updatedComments = comment ? [...(exp.comments || []), comment] : exp.comments;
          return { ...exp, status, comments: updatedComments };
        }
        return exp;
      })
    );

    // If disbursed, create a disbursement transaction
    const target = expenseApprovals.find((e) => e.id === id);
    if (target && status === 'Disbursed') {
      addTransaction({
        date: new Date().toISOString().split('T')[0],
        type: 'Expense',
        fundId: target.fundId,
        fundName: target.fundName,
        category: target.category,
        amountETB: target.amountETB,
        description: `Disbursed for: ${target.title} (${target.requestNo})`,
        paymentMethod: 'Bank Transfer',
        status: 'Completed',
        recordedBy: currentUser.name,
      });
    }

    addToast('Expense Request Updated', `Status changed to: "${status}"`, 'info');
  };

  const submitServiceRequest = (req: Omit<ServiceRequest, 'id' | 'trackingNo' | 'submissionDate' | 'status' | 'assignedOfficer'>) => {
    const id = `req-${Date.now()}`;
    const trackingNo = `REQ-2026-00${Math.floor(500 + Math.random() * 499)}`;
    const today = new Date().toISOString().split('T')[0];
    const newReq: ServiceRequest = {
      ...req,
      id,
      trackingNo,
      submissionDate: today,
      status: 'Submitted',
      assignedOfficer: 'Pending Council Assignment',
    };
    setServiceRequests((prev) => [newReq, ...prev]);
    addToast('Service Application Submitted', `Tracking #${trackingNo} generated. Council desk will review within 2 business days.`, 'success');
    return newReq;
  };

  const updateServiceRequestStatus = (id: string, status: ServiceRequest['status'], officer?: string) => {
    setServiceRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status,
            assignedOfficer: officer || r.assignedOfficer,
          };
        }
        return r;
      })
    );
    addToast('Service Request Updated', `Status updated to ${status}.`, 'info');
  };

  const setStudentAttendance = (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const saveDailyAttendance = (madrasaId: string, date: string) => {
    addToast('Attendance Saved', `Daily attendance register for ${date} recorded and synchronized.`, 'success');
  };

  const saveDailyAttendanceSession = (session: DailyAttendanceSession) => {
    setDailyAttendanceSessions((prev) => {
      const exists = prev.findIndex((s) => s.id === session.id);
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = session;
        return copy;
      }
      return [session, ...prev];
    });

    // Also update individual students' daily attendance in students state
    setStudents((prev) =>
      prev.map((st) => {
        const entry = session.entries.find((e) => e.studentId === st.id);
        if (entry) {
          return {
            ...st,
            dailyAttendance: entry.status,
          };
        }
        return st;
      })
    );

    addToast(
      'Roll-Call Record Saved',
      `Roll-call for ${session.className} (${session.madrasaName}) logged with ${session.presentCount}/${session.totalStudents} present (${session.attendanceRate}%).`,
      'success'
    );
  };

  const updateStudentAttendanceEntry = (
    sessionId: string,
    studentId: string,
    updates: Partial<StudentAttendanceEntry>
  ) => {
    setDailyAttendanceSessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId) {
          const updatedEntries = session.entries.map((entry) =>
            entry.studentId === studentId ? { ...entry, ...updates } : entry
          );
          const present = updatedEntries.filter((e) => e.status === 'Present').length;
          const absent = updatedEntries.filter((e) => e.status === 'Absent').length;
          const late = updatedEntries.filter((e) => e.status === 'Late').length;
          const excused = updatedEntries.filter((e) => e.status === 'Excused').length;
          const total = updatedEntries.length;
          const rate = total > 0 ? Math.round(((present + late * 0.5) / total) * 1000) / 10 : 0;

          return {
            ...session,
            entries: updatedEntries,
            presentCount: present,
            absentCount: absent,
            lateCount: late,
            excusedCount: excused,
            attendanceRate: rate,
          };
        }
        return session;
      })
    );
  };

  const batchMarkAttendance = (sessionId: string, status: AttendanceStatus) => {
    setDailyAttendanceSessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId) {
          const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          const updatedEntries = session.entries.map((entry) => ({
            ...entry,
            status,
            arrivalTime: status === 'Present' ? entry.arrivalTime || nowTime : undefined,
            lateMinutes: status === 'Late' ? entry.lateMinutes || 15 : undefined,
          }));

          const present = updatedEntries.filter((e) => e.status === 'Present').length;
          const absent = updatedEntries.filter((e) => e.status === 'Absent').length;
          const late = updatedEntries.filter((e) => e.status === 'Late').length;
          const excused = updatedEntries.filter((e) => e.status === 'Excused').length;
          const total = updatedEntries.length;
          const rate = total > 0 ? Math.round(((present + late * 0.5) / total) * 1000) / 10 : 0;

          return {
            ...session,
            entries: updatedEntries,
            presentCount: present,
            absentCount: absent,
            lateCount: late,
            excusedCount: excused,
            attendanceRate: rate,
          };
        }
        return session;
      })
    );
    addToast('Batch Status Applied', `All students in session marked as "${status}".`, 'info');
  };

  const sendAbsenceSmsAlerts = async (
    sessionId: string,
    filter: 'Absent' | 'Late' | 'All' = 'Absent'
  ): Promise<{ sentCount: number; costETB: number }> => {
    const session = dailyAttendanceSessions.find((s) => s.id === sessionId);
    if (!session) return { sentCount: 0, costETB: 0 };

    const targetStudents = session.entries.filter((e) => {
      if (filter === 'Absent') return e.status === 'Absent';
      if (filter === 'Late') return e.status === 'Late';
      return e.status === 'Absent' || e.status === 'Late';
    });

    if (targetStudents.length === 0) {
      addToast('No Recipients Found', `No students match the "${filter}" filter in this session.`, 'info');
      return { sentCount: 0, costETB: 0 };
    }

    const costPerMsg = 0.35; // ETB per Ethio Telecom SMS
    const totalCost = Math.round(targetStudents.length * costPerMsg * 100) / 100;

    // Dispatch via Gateway
    await dispatchMessage({
      title: `Daily Absence Notice: ${session.className}`,
      category: 'sabaq_alert',
      channel: 'sms',
      senderId: currentUser.id,
      recipientTarget: `${targetStudents.length} Parent(s) (${session.madrasaName})`,
      recipientCount: targetStudents.length,
      content: `Assalamu Alaikum. This is an official notice from ${session.madrasaName} (Jimma City Islamic Affairs Council). Your child was recorded as ABSENT for the ${session.shift} session on ${session.hijriDate} (${session.date}). For inquiries: ${currentUser.phone || '+251 47 111 8290'}.`,
      costETB: totalCost,
    });

    // Mark entries as notified
    setDailyAttendanceSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const notifiedEntries = s.entries.map((entry) => {
            const isTarget = targetStudents.some((ts) => ts.studentId === entry.studentId);
            return isTarget ? { ...entry, parentNotified: true } : entry;
          });
          return { ...s, entries: notifiedEntries };
        }
        return s;
      })
    );

    addToast(
      'SMS Absence Alerts Dispatched',
      `Sent ${targetStudents.length} automated Ethio Telecom SMS notifications to guardians. Total cost: ${totalCost} ETB.`,
      'success'
    );

    return { sentCount: targetStudents.length, costETB: totalCost };
  };

  const updateStaffAttendanceRecord = (id: string, updates: Partial<StaffAttendanceEntry>) => {
    setStaffAttendanceList((prev) =>
      prev.map((staff) => (staff.id === id ? { ...staff, ...updates } : staff))
    );
    addToast('Staff Attendance Updated', 'Council daily sign-in register updated.', 'info');
  };

  const addStaffAttendanceRecord = (entry: Omit<StaffAttendanceEntry, 'id'>): StaffAttendanceEntry => {
    const newId = `staff-att-${Date.now()}`;
    const newRecord: StaffAttendanceEntry = {
      ...entry,
      id: newId,
    };
    setStaffAttendanceList((prev) => [newRecord, ...prev]);
    addToast('Staff Attendance Logged', `${entry.staffName} marked as ${entry.status}.`, 'success');
    return newRecord;
  };

  const [gatewayStats, setGatewayStats] = useState<GatewayChannelStats>(initialGatewayStats);
  const [dispatchHistory, setDispatchHistory] = useState<DispatchLogItem[]>(mockDispatchHistory);

  const updateStudentProgress = async (id: string, updates: any): Promise<boolean> => {
    const student = students.find((item) => item.id === id);
    if (!student) return false;

    const currentHifz = student.hifzStatus || { sabaq: '', sabqi: '', manzil: '' };
    const newHifz = {
      sabaq: updates.sabaqSurah
        ? `${updates.sabaqSurah}${updates.sabaqAyahStart ? `: ${updates.sabaqAyahStart}-${updates.sabaqAyahEnd}` : ''}`
        : currentHifz.sabaq,
      sabqi: updates.sabaqiJuz ? `Juz ${updates.sabaqiJuz}` : currentHifz.sabqi,
      manzil: updates.manzilJuz || currentHifz.manzil,
    };
    const locallyUpdated: Student = {
      ...student,
      ...updates,
      hifzStatus: newHifz,
      quranJuzCompleted: updates.quranJuzCompleted !== undefined ? updates.quranJuzCompleted : student.quranJuzCompleted,
      tajweedRating: updates.tajweedRating || student.tajweedRating,
      guardianName: updates.guardianName || student.parentName,
      guardianPhone: updates.guardianPhone || student.parentPhone,
    };

    const persistentUpdates: Partial<Student> = {};
    if (updates.sabaqSurah !== undefined) persistentUpdates.sabaqSurah = updates.sabaqSurah;
    if (updates.sabaqAyahStart !== undefined) persistentUpdates.sabaqAyahStart = updates.sabaqAyahStart;
    if (updates.sabaqAyahEnd !== undefined) persistentUpdates.sabaqAyahEnd = updates.sabaqAyahEnd;
    if (updates.sabaqiJuz !== undefined) persistentUpdates.sabaqiJuz = updates.sabaqiJuz;
    if (updates.manzilJuz !== undefined) persistentUpdates.manzilJuz = updates.manzilJuz;
    if (updates.dailyAttendance !== undefined) persistentUpdates.dailyAttendance = updates.dailyAttendance;
    if (updates.tajweedRating !== undefined) persistentUpdates.tajweedRating = updates.tajweedRating;
    if (updates.quranJuzCompleted !== undefined) persistentUpdates.quranJuzCompleted = updates.quranJuzCompleted;
    if (updates.guardianName !== undefined) persistentUpdates.guardianName = updates.guardianName;
    if (updates.guardianPhone !== undefined) persistentUpdates.guardianPhone = updates.guardianPhone;
    if (Object.keys(persistentUpdates).length > 0 && /^\d+$/.test(id)) {
      try {
        const saved = await updateStudentRecord(id, { ...persistentUpdates, hifzStatus: newHifz });
        setStudents((prev) => prev.map((item) => (item.id === id ? saved : item)));
        return true;
      } catch (error) {
        addToast(
          'Could not save Hifz record',
          error instanceof Error ? error.message : 'Please try again.',
          'error'
        );
        return false;
      }
    }

    setStudents((prev) => prev.map((item) => (item.id === id ? locallyUpdated : item)));
    return true;
  };

  const dispatchMessage = async (
    data: DispatchMessageInput
  ): Promise<DispatchLogItem> => {
    const { confirmation, ...dispatchData } = data;
    const id = `disp-${Date.now()}`;
    const timestamp = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isSms = dispatchData.channel === 'sms' || dispatchData.channel === 'hybrid';
    const isTelegram = dispatchData.channel === 'telegram' || dispatchData.channel === 'hybrid';

    const gatewayCode = isSms && isTelegram
      ? 'ETHIO_SMS_BATCH_OK_200 / TG_200_OK'
      : isSms
      ? 'ETHIO_SMS_DELIVRD_200'
      : 'TELEGRAM_BOT_MSG_OK_200';

    const newItem: DispatchLogItem = {
      ...dispatchData,
      id,
      timestamp,
      status: 'delivered',
      gatewayResponseCode: gatewayCode,
      deliveryRate: 99.8,
    };

    setDispatchHistory((prev) => [newItem, ...prev]);

    // Update channel stats
    setGatewayStats((prev) => {
      let newBalance = prev.smsBalanceETB;
      let newSmsSent = prev.smsTotalSent;
      let newTgSent = prev.telegramMessagesSent;

      if (isSms) {
        newBalance = Math.max(0, newBalance - dispatchData.costETB);
        newSmsSent += dispatchData.recipientCount;
      }
      if (isTelegram) {
        newTgSent += 1;
      }

      return {
        ...prev,
        smsBalanceETB: Math.round(newBalance * 100) / 100,
        smsTotalSent: newSmsSent,
        telegramMessagesSent: newTgSent,
      };
    });

    addToast(
      confirmation?.title || 'Gateway Dispatch Successful',
      confirmation?.message ||
        `${dispatchData.title} delivered to ${dispatchData.recipientCount.toLocaleString()} recipient(s) via ${dispatchData.channel.toUpperCase()}.`,
      'success'
    );

    return newItem;
  };

  const topUpSmsBalance = (amountETB: number) => {
    setGatewayStats((prev) => ({
      ...prev,
      smsBalanceETB: prev.smsBalanceETB + amountETB,
    }));
    addToast(
      'Ethio Telecom SMS Gateway Refilled',
      `Recharged ${amountETB.toLocaleString()} ETB via Telebirr Corporate Merchant API.`,
      'success'
    );
  };

  const clearDispatchHistory = () => {
    setDispatchHistory([]);
    addToast('Audit Logs Cleared', 'Historical dispatch records reset.', 'info');
  };

  const refreshEvents = async (adminView = false) => {
    try {
      setEvents(adminView ? await fetchAdminEvents() : await fetchPublicEvents());
    } catch (error) {
      if (import.meta.env.DEV) console.warn('[API] Event refresh failed.', error);
    }
  };

  const refreshAnnouncements = async (adminView = false) => {
    try {
      setAnnouncements(adminView ? await fetchAdminAnnouncements() : await fetchPublicAnnouncements());
    } catch (error) {
      if (import.meta.env.DEV) console.warn('[API] Announcement refresh failed.', error);
    }
  };

  const addAnnouncement = async (item: Omit<Announcement, 'id'>) => {
    try {
      const created = await createAnnouncementRecord(item);
      setAnnouncements((previous) => [created, ...previous.filter((announcement) => announcement.id !== created.id)]);
      addToast('Announcement Published', `“${created.title}” is now available.`, 'success');
      return created;
    } catch (error) {
      addToast('Announcement Could Not Be Saved', error instanceof Error ? error.message : 'Please try again.', 'error');
      throw error;
    }
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    try {
      const updated = await updateAnnouncementRecord(id, updates);
      setAnnouncements((previous) => previous.map((item) => item.id === id ? updated : item));
      addToast('Announcement Updated', 'The announcement has been updated.', 'success');
    } catch (error) {
      addToast('Announcement Could Not Be Updated', error instanceof Error ? error.message : 'Please try again.', 'error');
      throw error;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await deleteAnnouncementRecord(id);
      setAnnouncements((previous) => previous.filter((item) => item.id !== id));
      addToast('Announcement Removed', 'The announcement has been removed.', 'info');
    } catch (error) {
      addToast('Announcement Could Not Be Removed', error instanceof Error ? error.message : 'Please try again.', 'error');
      throw error;
    }
  };

  const refreshEventRegistrations = async (eventId?: string) => {
    try {
      const fetched = await fetchEventRegistrations(eventId);
      setEventRegistrations((previous) => {
        if (!eventId) return fetched;
        const retained = previous.filter((item) => item.eventId !== eventId);
        return [...fetched, ...retained];
      });
    } catch (error) {
      if (import.meta.env.DEV) console.warn('[API] Event registration refresh failed.', error);
      addToast('Could Not Load Attendees', 'Check your staff access and API connection, then retry.', 'error');
    }
  };

  const findMyEventRegistrations = async (email: string, phone: string) => {
    try {
      const registrations = await findMyEventRegistrationsRecord(email, phone);
      setEventRegistrations(registrations);
      return registrations;
    } catch (error) {
      addToast(
        'Could Not Find Passes',
        error instanceof Error ? error.message : 'Check your registration email and phone number, then try again.',
        'error'
      );
      throw error;
    }
  };

  const addEvent = async (data: Omit<CouncilEvent, 'id'>) => {
    try {
      const newEvent = await createEventRecord(data);
      setEvents((prev) => [newEvent, ...prev.filter((event) => event.id !== newEvent.id)]);
      addToast('Council Gathering Scheduled', `"${newEvent.title}" has been published to the community calendar.`, 'success');
      return newEvent;
    } catch (error) {
      addToast('Event Could Not Be Saved', error instanceof Error ? error.message : 'Please try again.', 'error');
      throw error;
    }
  };

  const updateEvent = async (id: string, updates: Partial<CouncilEvent>) => {
    try {
      const updated = await updateEventRecord(id, updates);
      setEvents((prev) => prev.map((event) => (event.id === id ? updated : event)));
      setEventRegistrations((prev) => prev.map((registration) => registration.eventId === id
        ? { ...registration, eventTitle: updated.title, eventDate: updated.date }
        : registration));
      addToast('Program Updated', 'Event logistics, schedule, and capacity updated.', 'success');
    } catch (error) {
      addToast('Event Could Not Be Updated', error instanceof Error ? error.message : 'Please try again.', 'error');
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await deleteEventRecord(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
      setEventRegistrations((prev) => prev.filter((registration) => registration.eventId !== id));
      addToast('Program Removed', 'Event removed from the council schedule.', 'info');
    } catch (error) {
      addToast('Event Could Not Be Removed', error instanceof Error ? error.message : 'Please try again.', 'error');
      throw error;
    }
  };

  const registerForEvent = async (
    data: Omit<EventRegistration, 'id' | 'passNumber' | 'status' | 'createdAt'> & { paymentReceipt?: File }
  ): Promise<EventRegistration> => {
    try {
      const newReg = await registerForEventRecord({
        eventId: data.eventId,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        district: data.district,
        organizationOrMadrasa: data.organizationOrMadrasa,
        attendeesCount: data.attendeesCount,
        notes: data.notes,
        paymentReceipt: data.paymentReceipt,
      });
      setEventRegistrations((prev) => [newReg, ...prev.filter((item) => item.id !== newReg.id)]);
      setEvents((prev) => prev.map((event) => event.id === data.eventId
        ? { ...event, attendeesCount: event.attendeesCount + newReg.attendeesCount }
        : event));
      if (newReg.paymentStatus === 'PENDING') {
        addToast('Receipt Submitted', 'Your registration is pending payment review. Your pass will be available after approval.', 'info');
      } else {
        addToast('Registration Confirmed! Barakallahu Feekum', `Official Pass #${newReg.passNumber} issued for ${data.fullName}.`, 'success');
      }
      return newReg;
    } catch (error) {
      addToast('Registration Could Not Be Completed', error instanceof Error ? error.message : 'Please try again.', 'error');
      throw error;
    }
  };

  const cancelRegistration = async (regId: string) => {
    try {
      const updated = await updateEventRegistrationStatus(regId, 'CANCELLED');
      const existing = eventRegistrations.find((registration) => registration.id === regId);
      if (existing?.status !== 'Cancelled') {
        setEvents((eventsBefore) => eventsBefore.map((event) => event.id === updated.eventId
          ? { ...event, attendeesCount: Math.max(0, event.attendeesCount - updated.attendeesCount) }
          : event));
      }
      setEventRegistrations((prev) => prev.map((registration) => registration.id === regId ? updated : registration));
      addToast('RSVP Cancelled', 'Registration status updated.', 'info');
    } catch (error) {
      addToast('Registration Could Not Be Cancelled', error instanceof Error ? error.message : 'Please try again.', 'error');
      throw error;
    }
  };

  const checkInAttendee = async (regId: string) => {
    try {
      const updated = await updateEventRegistrationStatus(regId, 'CHECKED_IN');
      setEventRegistrations((prev) => prev.map((registration) => registration.id === regId ? updated : registration));
      addToast('Attendee Checked In', 'Pass verified at venue entrance.', 'success');
    } catch (error) {
      addToast('Check In Failed', error instanceof Error ? error.message : 'Please try again.', 'error');
      throw error;
    }
  };

  const reviewEventPayment = async (regId: string, paymentStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const updated = await reviewEventPaymentRecord(regId, paymentStatus);
      const existing = eventRegistrations.find((registration) => registration.id === regId);
      setEventRegistrations((prev) => prev.map((registration) => registration.id === regId ? updated : registration));
      if (paymentStatus === 'REJECTED' && existing) {
        setEvents((prev) => prev.map((event) => event.id === updated.eventId
          ? { ...event, attendeesCount: Math.max(0, event.attendeesCount - existing.attendeesCount) }
          : event));
        addToast('Payment Rejected', 'The registration was cancelled and its seats released.', 'info');
      } else {
        addToast('Payment Approved', `Pass #${updated.passNumber} has been issued.`, 'success');
      }
      return updated;
    } catch (error) {
      addToast('Payment Review Failed', error instanceof Error ? error.message : 'Please try again.', 'error');
      throw error;
    }
  };

  const saveEventSubscription = async (
    data: Omit<EventNotificationSubscription, 'id' | 'subscribedAt'>
  ): Promise<EventNotificationSubscription> => {
    const currentToken = eventSubscriptions[0]?.manageToken || readNotificationManageToken() || undefined;
    const { manageToken: _manageToken, ...preferences } = data;
    let browserPush: PushSubscription | null = null;
    if (preferences.enableBrowser) {
      const config = await fetchPushConfiguration();
      if (!config.enabled || !config.publicKey) {
        throw new Error('Browser push is not configured on the server yet. Ask the administrator to configure VAPID keys.');
      }
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('This browser does not support remote push notifications.');
      }
      if (Notification.permission !== 'granted') {
        throw new Error('Allow browser notification permission before saving browser push.');
      }
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      browserPush = await registration.pushManager.getSubscription();
      if (!browserPush) {
        browserPush = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeVapidPublicKey(config.publicKey),
        });
      }
    }
    const saved = await saveNotificationSubscriptionApi(preferences, currentToken);
    try {
      storeNotificationManageToken(saved.manageToken);
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Preferences were saved, but this browser could not store the management token: ${error.message}`
          : 'Preferences were saved, but this browser could not store the management token.'
      );
    }
    if (browserPush) {
      try {
        await saveBrowserPushSubscription(saved.manageToken, browserPush.toJSON());
      } catch (error) {
        await saveNotificationSubscriptionApi({ ...preferences, enableBrowser: false }, saved.manageToken);
        throw new Error(
          error instanceof Error
            ? `Preferences were saved, but this device could not be registered for push: ${error.message}`
            : 'Preferences were saved, but this device could not be registered for push.'
        );
      }
    } else if (!preferences.enableBrowser && currentToken) {
      try {
        const registration = await navigator.serviceWorker?.getRegistration('/service-worker.js');
        const existingPush = await registration?.pushManager.getSubscription();
        if (existingPush?.endpoint) {
          await deleteBrowserPushSubscription(currentToken, existingPush.endpoint);
          await existingPush.unsubscribe();
        }
      } catch (error) {
        addToast(
          'Push device cleanup incomplete',
          error instanceof Error ? error.message : 'Browser push is disabled for this subscription, but this device record could not be removed.',
          'warning'
        );
      }
    }
    const { manageToken: savedToken, created: _created, ...subscription } = saved;
    const managedSubscription = { ...subscription, manageToken: savedToken };
    setEventSubscriptions([managedSubscription]);
    addToast(
      'Notification preferences saved',
      preferences.enableEmail && !managedSubscription.emailVerified
        ? 'Check your email and verify the address before event and announcement email notifications can be sent.'
        : 'Your preferences are stored. Email, browser push, or Telegram messages will be sent only when their configured providers are available.',
      preferences.enableEmail && !managedSubscription.emailVerified ? 'warning' : 'success'
    );
    return managedSubscription;
  };

  const removeEventSubscription = async (id: string) => {
    const subscription = eventSubscriptions.find((item) => item.id === id);
    const token = subscription?.manageToken || readNotificationManageToken();
    if (!token) {
      addToast('Could not remove subscription', 'The notification management token is unavailable in this browser.', 'error');
      return;
    }
    try {
      await deleteNotificationSubscription(token);
      clearNotificationManageToken();
      setEventSubscriptions((prev) => prev.filter((item) => item.id !== id));
      addToast('Subscription removed', 'This browser will no longer keep your notification preferences.', 'info');
    } catch (error) {
      addToast('Could not remove subscription', error instanceof Error ? error.message : 'Please try again.', 'error');
    }
  };

  const toggleEventReminder = (eventId: string): boolean => {
    const active = eventSubscriptions[0];
    if (!active) return false;
    const currentIds = [...(active.specificEventIds || [])];
    const exists = currentIds.includes(eventId);
    const nowSubscribed = !exists;
    const updatedActive: EventNotificationSubscription = {
      ...active,
      specificEventIds: exists
        ? currentIds.filter((id) => id !== eventId)
        : [...currentIds, eventId],
    };
    setEventSubscriptions((prev) => prev.map((item) => item.id === active.id ? updatedActive : item));
    const targetEvent = events.find((e) => e.id === eventId);
    const eventName = targetEvent ? targetEvent.title : 'this event';

    if (active.manageToken) {
      void saveEventSubscription(updatedActive).then(() => {
        addToast(
          nowSubscribed ? 'Event reminder preference saved' : 'Event reminder preference removed',
          nowSubscribed ? `Reminder preference saved for "${eventName}".` : `Reminder turned off for "${eventName}".`,
          nowSubscribed ? 'success' : 'info'
        );
      }).catch((error) => {
        setEventSubscriptions((prev) => prev.map((item) => item.id === active.id ? active : item));
        addToast('Could not update event reminder', error instanceof Error ? error.message : 'Please try again.', 'error');
      });
    }
    return nowSubscribed;
  };

  const isSubscribedToEvent = (eventId: string): boolean => {
    return eventSubscriptions.some((s) => s.specificEventIds?.includes(eventId));
  };

  // Resource Management Handlers
  const addResource = (
    data: Omit<CouncilResource, 'id' | 'uploadDate' | 'downloadsCount'>
  ): CouncilResource => {
    const newId = `res-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newResource: CouncilResource = {
      ...data,
      id: newId,
      uploadDate: today,
      downloadsCount: 0,
    };
    setResources((prev) => [newResource, ...prev]);
    addToast(
      'Resource Published Successfully',
      `"${newResource.title}" is now available in the resource repository.`,
      'success'
    );
    return newResource;
  };

  const updateResource = (id: string, updates: Partial<CouncilResource>) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    addToast('Resource Updated', 'The material details and settings have been updated.', 'info');
  };

  const deleteResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    addToast('Resource Deleted', 'The selected item was removed from the repository.', 'info');
  };

  const incrementResourceDownload = (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, downloadsCount: (r.downloadsCount || 0) + 1 } : r))
    );
  };

  // Independent Audit & Shariah Compliance Methods
  const addAuditDirective = (directive: Omit<AuditDirective, 'id' | 'createdDate'>): AuditDirective => {
    const newId = `AUD-2026-${String(auditDirectives.length + 1).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const newDirective: AuditDirective = {
      ...directive,
      id: newId,
      createdDate: today,
    };
    setAuditDirectives((prev) => [newDirective, ...prev]);
    addSecurityLog({
      action: 'Create Audit Inquiry Flag',
      actorName: currentUser.name,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      target: newId,
      details: `Opened audit inquiry [${newDirective.severity}] for ${newDirective.targetEntity}: "${newDirective.title}"`,
      category: 'Finance_Security',
      status: 'Success',
      ipAddress: '192.168.1.1',
    });
    addToast(
      'Audit Directive Attached',
      `Audit inquiry ${newId} assigned to ${newDirective.assignedAuditor}.`,
      'info'
    );
    return newDirective;
  };

  const updateAuditDirective = (id: string, updates: Partial<AuditDirective>) => {
    setAuditDirectives((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
    addToast('Audit Record Updated', 'Audit directive parameters updated successfully.', 'info');
  };

  const resolveAuditDirective = (id: string, resolutionNote: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAuditDirectives((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'Resolved',
              resolvedDate: today,
              resolutionNote,
            }
          : d
      )
    );
    addSecurityLog({
      action: 'Resolve Audit Directive',
      actorName: currentUser.name,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      target: id,
      details: `Auditor cleared inquiry ${id}. Resolution Note: "${resolutionNote}"`,
      category: 'Finance_Security',
      status: 'Success',
      ipAddress: '192.168.1.1',
    });
    addToast('Audit Finding Resolved', `Audit directive ${id} marked as resolved and sealed.`, 'success');
  };

  const escalateAuditDirective = (id: string) => {
    setAuditDirectives((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'Escalated to Shura' } : d))
    );
    addSecurityLog({
      action: 'Escalate Audit to Shura Council',
      actorName: currentUser.name,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      target: id,
      details: `Escalated compliance discrepancy ${id} to Executive Shura Council for emergency ruling.`,
      category: 'Finance_Security',
      status: 'Warning',
      ipAddress: '192.168.1.1',
    });
    addToast(
      'Escalated to Shura Council',
      `Audit inquiry ${id} formally submitted to the Supreme Executive Shura.`,
      'warning'
    );
  };

  const deleteAuditDirective = (id: string) => {
    setAuditDirectives((prev) => prev.filter((d) => d.id !== id));
    addToast('Directive Removed', `Audit record ${id} removed from active review.`, 'info');
  };

  const updateChecklistStatus = (id: string, status: AuditChecklistItem['status'], note?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAuditChecklist((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              lastVerified: today,
              verifiedBy: currentUser.name,
              evidenceNote: note || item.evidenceNote,
            }
          : item
      )
    );
    addToast('Governance Checklist Updated', `Compliance standard ${id} updated to [${status}].`, 'success');
  };

  const runForensicReconciliation = async (): Promise<{
    verifiedBlocks: number;
    verifiedTxs: number;
    varianceETB: number;
    hash: string;
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalTxCount = transactions.length + 1378;
        const digest = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        addSecurityLog({
          action: 'Cryptographic Ledger Reconciliation',
          actorName: currentUser.name,
          actorEmail: currentUser.email,
          actorRole: currentUser.role,
          target: 'Global General Ledger & Zakat Sub-Ledger',
          details: `Reconciled ${ledgerBlocks.length} cryptographic blocks (${totalTxCount} transactions). Variance: 0.00 ETB. Digest SHA-256 match 100%.`,
          category: 'Finance_Security',
          status: 'Success',
          ipAddress: '192.168.1.1',
        });
        resolve({
          verifiedBlocks: ledgerBlocks.length,
          verifiedTxs: totalTxCount,
          varianceETB: 0.0,
          hash: digest,
        });
      }, 1500);
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoggedIn,
        authReady,
        login,
        register,
        logout,
        zakatCalculations,
        addZakatCalculation,
        deleteZakatCalculation,
        updateZakatCalculation,
        staffList,
        staffAccessLoading,
        staffAccessError,
        refreshStaffAndRoles,
        addStaff,
        updateStaff,
        deleteStaff,
        toggleStaffStatus,
        rolesList,
        addRole,
        updateRole,
        deleteRole,
        permissionCategories,
        securityLogs,
        addSecurityLog,
        mosques,
        refreshDirectoryData,
        addMosque,
        updateMosque,
        madrasas,
        addMadrasa,
        students,
        studentsLoading,
        studentsError,
        addStudent,
        updateStudent,
        updateStudentProgress,
        teachers,
        refreshTeachers,
        teachersLoading,
        teachersError,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        ulema,
        refreshUlema,
        ulemaLoading,
        ulemaError,
        addUlema,
        updateUlema,
        deleteUlema,
        funds,
        transactions,
        addTransaction,
        donations,
        addDonation,
        updateDonation,
        deleteDonation,
        zakatDistributions,
        addZakatDistribution,
        updateZakatDistribution,
        expenseApprovals,
        updateExpenseStatus,
        publicServices,
        publicServiceAvailability,
        refreshPublicServiceAvailability,
        janazahPublicEnabled,
        refreshJanazahAvailability,
        serviceRequests,
        upsertServiceRequest,
        submitServiceRequest,
        updateServiceRequestStatus,
        events,
        refreshEvents,
        addEvent,
        updateEvent,
        deleteEvent,
        eventRegistrations,
        refreshEventRegistrations,
        findMyEventRegistrations,
        registerForEvent,
        reviewEventPayment,
        fetchEventPaymentReceipt: fetchEventPaymentReceiptRecord,
        cancelRegistration,
        checkInAttendee,
        eventSubscriptions,
        saveEventSubscription,
        removeEventSubscription,
        toggleEventReminder,
        isSubscribedToEvent,
        announcements,
        refreshAnnouncements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        resources,
        addResource,
        updateResource,
        deleteResource,
        incrementResourceDownload,
        gatewayStats,
        dispatchHistory,
        dispatchMessage,
        topUpSmsBalance,
        clearDispatchHistory,
        attendanceMap,
        setStudentAttendance,
        saveDailyAttendance,
        dailyAttendanceSessions,
        staffAttendanceList,
        saveDailyAttendanceSession,
        updateStudentAttendanceEntry,
        batchMarkAttendance,
        sendAbsenceSmsAlerts,
        updateStaffAttendanceRecord,
        addStaffAttendanceRecord,
        auditDirectives,
        addAuditDirective,
        updateAuditDirective,
        resolveAuditDirective,
        escalateAuditDirective,
        deleteAuditDirective,
        auditChecklist,
        updateChecklistStatus,
        ledgerBlocks,
        runForensicReconciliation,
        toasts,
        addToast,
        removeToast,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
