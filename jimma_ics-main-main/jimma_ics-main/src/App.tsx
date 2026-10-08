import { lazy, Suspense, type ComponentType } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { ToastContainer } from './components/ui/ToastContainer';
import { PublicTranslationLayer } from './components/layout/PublicTranslationLayer';

function lazyPage<K extends string, T extends Record<K, ComponentType>>(
  load: () => Promise<T>,
  componentName: K,
) {
  return lazy(() => load().then((module) => ({ default: module[componentName] })));
}

const PublicLayout = lazyPage(() => import('./components/layout/PublicLayout'), 'PublicLayout');
const AdminLayout = lazyPage(() => import('./components/layout/AdminLayout'), 'AdminLayout');

const CommunityHomePage = lazyPage(() => import('./pages/public/CommunityHomePage'), 'CommunityHomePage');
const AboutPage = lazyPage(() => import('./pages/public/AboutPage'), 'AboutPage');
const MosquesPage = lazyPage(() => import('./pages/public/MosquesPage'), 'MosquesPage');
const MosqueDetailPage = lazyPage(() => import('./pages/public/MosqueDetailPage'), 'MosqueDetailPage');
const MadrasasPage = lazyPage(() => import('./pages/public/MadrasasPage'), 'MadrasasPage');
const MadrasaDetailPage = lazyPage(() => import('./pages/public/MadrasaDetailPage'), 'MadrasaDetailPage');
const UlemaPage = lazyPage(() => import('./pages/public/UlemaPage'), 'UlemaPage');
const UlemaDetailPage = lazyPage(() => import('./pages/public/UlemaDetailPage'), 'UlemaDetailPage');
const ServicesPage = lazyPage(() => import('./pages/public/ServicesPage'), 'ServicesPage');
const DonatePage = lazyPage(() => import('./pages/public/DonatePage'), 'DonatePage');
const EventsPage = lazyPage(() => import('./pages/public/EventsPage'), 'EventsPage');
const AnnouncementsPage = lazyPage(() => import('./pages/public/AnnouncementsPage'), 'AnnouncementsPage');
const ContactPage = lazyPage(() => import('./pages/public/ContactPage'), 'ContactPage');
const GisMapPage = lazyPage(() => import('./pages/public/GisMapPage'), 'GisMapPage');
const StaffLoginPage = lazyPage(() => import('./pages/public/StaffLoginPage'), 'StaffLoginPage');
const TeachersPage = lazyPage(() => import('./pages/public/TeachersPage'), 'TeachersPage');
const TeacherProfilePage = lazyPage(() => import('./pages/public/TeacherProfilePage'), 'TeacherProfilePage');

const AdminDashboardPage = lazyPage(() => import('./pages/admin/AdminDashboardPage'), 'AdminDashboardPage');
const AdminMosquesPage = lazyPage(() => import('./pages/admin/AdminMosquesPage'), 'AdminMosquesPage');
const AdminMadrasasPage = lazyPage(() => import('./pages/admin/AdminMadrasasPage'), 'AdminMadrasasPage');
const AdminStudentsPage = lazyPage(() => import('./pages/admin/AdminStudentsPage'), 'AdminStudentsPage');
const StudentProgressPage = lazyPage(() => import('./pages/admin/StudentProgressPage'), 'StudentProgressPage');
const AdminTeachersPage = lazyPage(() => import('./pages/admin/AdminTeachersPage'), 'AdminTeachersPage');
const AdminUlemaPage = lazyPage(() => import('./pages/admin/AdminUlemaPage'), 'AdminUlemaPage');
const AdminFinancePage = lazyPage(() => import('./pages/admin/AdminFinancePage'), 'AdminFinancePage');
const AdminExpenseApprovalsPage = lazyPage(() => import('./pages/admin/AdminExpenseApprovalsPage'), 'AdminExpenseApprovalsPage');
const AdminServicesPage = lazyPage(() => import('./pages/admin/AdminServicesPage'), 'AdminServicesPage');
const AdminDocumentsPage = lazyPage(() => import('./pages/admin/AdminDocumentsPage'), 'AdminDocumentsPage');
const AdminGatewayPage = lazyPage(() => import('./pages/admin/AdminGatewayPage'), 'AdminGatewayPage');
const AdminEventsPage = lazyPage(() => import('./pages/admin/AdminEventsPage'), 'AdminEventsPage');
const AdminAnnouncementsPage = lazyPage(() => import('./pages/admin/AdminAnnouncementsPage'), 'AdminAnnouncementsPage');
const AdminWaqfPage = lazyPage(() => import('./pages/admin/AdminWaqfPage'), 'AdminWaqfPage');
const AdminStaffAndRolesPage = lazyPage(() => import('./pages/admin/AdminStaffAndRolesPage'), 'AdminStaffAndRolesPage');
const AdminResourcesPage = lazyPage(() => import('./pages/admin/AdminResourcesPage'), 'AdminResourcesPage');
const AdminDonationsAndZakatPage = lazyPage(() => import('./pages/admin/AdminDonationsAndZakatPage'), 'AdminDonationsAndZakatPage');
const AdminAuditPage = lazyPage(() => import('./pages/admin/AdminAuditPage'), 'AdminAuditPage');
const TeacherWorkbenchPage = lazyPage(() => import('./pages/admin/TeacherWorkbenchPage'), 'TeacherWorkbenchPage');
const AdminZakatApplicationsPage = lazyPage(() => import('./pages/admin/AdminZakatApplicationsPage'), 'AdminZakatApplicationsPage');
const AdminSystemSettingsPage = lazyPage(() => import('./pages/admin/AdminSystemSettingsPage'), 'AdminSystemSettingsPage');
const AdminWoredasPage = lazyPage(() => import('./pages/admin/AdminWoredasPage'), 'AdminWoredasPage');

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppProvider>
          <BrowserRouter>
            <ToastContainer />
            <PublicTranslationLayer />
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center" role="status">
                  Loading...
                </div>
              }
            >
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<CommunityHomePage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="mosques" element={<MosquesPage />} />
                  <Route path="mosques/:id" element={<MosqueDetailPage />} />
                  <Route path="madrasas" element={<MadrasasPage />} />
                  <Route path="madrasas/:id" element={<MadrasaDetailPage />} />
                  <Route path="ulema" element={<UlemaPage />} />
                  <Route path="ulema/:id" element={<UlemaDetailPage />} />
                  <Route path="teachers" element={<TeachersPage />} />
                  <Route path="teachers/:id" element={<TeacherProfilePage />} />
                  <Route path="services" element={<ServicesPage />} />
                  <Route path="donate" element={<DonatePage />} />
                  <Route path="map" element={<GisMapPage />} />
                  <Route path="gis-map" element={<GisMapPage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="waqf" element={<Navigate to="/services?tab=waqf" replace />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="login" element={<StaffLoginPage />} />
                </Route>

                {/* Staff Login Route Alias */}
                <Route path="/admin/login" element={<StaffLoginPage />} />

                {/* Admin Management Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="teacher" element={<TeacherWorkbenchPage />} />
                  <Route path="teacher-workbench" element={<TeacherWorkbenchPage />} />
                  <Route path="mosques" element={<AdminMosquesPage />} />
                  <Route path="madrasas" element={<AdminMadrasasPage />} />
                  <Route path="students" element={<AdminStudentsPage />} />
                  <Route path="students/:id" element={<StudentProgressPage />} />
                  <Route path="teachers" element={<AdminTeachersPage />} />
                  <Route path="ulema" element={<AdminUlemaPage />} />
                  <Route path="finance" element={<AdminFinancePage />} />
                  <Route path="finance/donations" element={<AdminDonationsAndZakatPage />} />
                  <Route path="finance/approvals" element={<AdminExpenseApprovalsPage />} />
                  <Route path="audit" element={<AdminAuditPage />} />
                  <Route path="compliance" element={<AdminAuditPage />} />
                  <Route path="donations" element={<AdminDonationsAndZakatPage />} />
                  <Route path="zakat" element={<AdminDonationsAndZakatPage />} />
                  <Route path="zakat/applications" element={<AdminZakatApplicationsPage />} />
                  <Route path="services" element={<AdminServicesPage />} />
                  <Route path="gateway" element={<AdminGatewayPage />} />
                  <Route path="events" element={<AdminEventsPage />} />
                  <Route path="announcements" element={<AdminAnnouncementsPage />} />
                  <Route path="waqf" element={<AdminWaqfPage />} />
                  <Route path="documents" element={<AdminDocumentsPage />} />
                  <Route path="resources" element={<AdminResourcesPage />} />
                  <Route path="users" element={<AdminStaffAndRolesPage />} />
                  <Route path="staff" element={<AdminStaffAndRolesPage />} />
                  <Route path="settings" element={<AdminSystemSettingsPage />} />
                  <Route path="woredas" element={<AdminWoredasPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AppProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
