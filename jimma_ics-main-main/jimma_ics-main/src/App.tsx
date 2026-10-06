import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { ToastContainer } from './components/ui/ToastContainer';
import { DemoPresentationBar } from './components/common/DemoPresentationBar';
import { PublicTranslationLayer } from './components/layout/PublicTranslationLayer';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { CommunityHomePage } from './pages/public/CommunityHomePage';
import { AboutPage } from './pages/public/AboutPage';
import { MosquesPage } from './pages/public/MosquesPage';
import { MosqueDetailPage } from './pages/public/MosqueDetailPage';
import { MadrasasPage } from './pages/public/MadrasasPage';
import { MadrasaDetailPage } from './pages/public/MadrasaDetailPage';
import { UlemaPage } from './pages/public/UlemaPage';
import { UlemaDetailPage } from './pages/public/UlemaDetailPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { DonatePage } from './pages/public/DonatePage';
import { EventsPage } from './pages/public/EventsPage';
import { AnnouncementsPage } from './pages/public/AnnouncementsPage';
import { ContactPage } from './pages/public/ContactPage';
import { GisMapPage } from './pages/public/GisMapPage';
import { StaffLoginPage } from './pages/public/StaffLoginPage';
import { TeachersPage } from './pages/public/TeachersPage';
import { TeacherProfilePage } from './pages/public/TeacherProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMosquesPage } from './pages/admin/AdminMosquesPage';
import { AdminMadrasasPage } from './pages/admin/AdminMadrasasPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { StudentProgressPage } from './pages/admin/StudentProgressPage';
import { AdminTeachersPage } from './pages/admin/AdminTeachersPage';
import { AdminUlemaPage } from './pages/admin/AdminUlemaPage';
import { AdminFinancePage } from './pages/admin/AdminFinancePage';
import { AdminExpenseApprovalsPage } from './pages/admin/AdminExpenseApprovalsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminDocumentsPage } from './pages/admin/AdminDocumentsPage';
import { AdminGatewayPage } from './pages/admin/AdminGatewayPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage';
import { AdminWaqfPage } from './pages/admin/AdminWaqfPage';
import { AdminStaffAndRolesPage } from './pages/admin/AdminStaffAndRolesPage';
import { AdminResourcesPage } from './pages/admin/AdminResourcesPage';
import { AdminDonationsAndZakatPage } from './pages/admin/AdminDonationsAndZakatPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';
import { TeacherWorkbenchPage } from './pages/admin/TeacherWorkbenchPage';
import { AdminZakatApplicationsPage } from './pages/admin/AdminZakatApplicationsPage';
import { AdminSystemSettingsPage } from './pages/admin/AdminSystemSettingsPage';

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppProvider>
          <BrowserRouter>
            <DemoPresentationBar />
            <ToastContainer />
            <PublicTranslationLayer />
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
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
