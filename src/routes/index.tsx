import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AreaRoute } from './AreaRoute';
import { PageSkeleton } from '../components/common/Skeleton';

// Public
const Home = lazy(() => import('../pages/public/Home'));
const EventPage = lazy(() => import('../pages/public/EventPage'));
const Programme = lazy(() => import('../pages/public/Programme'));
const Speakers = lazy(() => import('../pages/public/Speakers'));
const SpeakerDetail = lazy(() => import('../pages/public/SpeakerDetail'));
const RegistrationPage = lazy(() => import('../pages/public/RegistrationPage'));
const MyVachanShivir = lazy(() => import('../pages/public/MyVachanShivir'));
const Pricing = lazy(() => import('../pages/public/Pricing'));
const Sponsors = lazy(() => import('../pages/public/Sponsors'));
const Partners = lazy(() => import('../pages/public/Partners'));
const Exhibition = lazy(() => import('../pages/public/Exhibition'));
const Stalls = lazy(() => import('../pages/public/Stalls'));
const StallDetail = lazy(() => import('../pages/public/StallDetail'));
const Exhibitors = lazy(() => import('../pages/public/Exhibitors'));
const Gallery = lazy(() => import('../pages/public/Gallery'));
const Venue = lazy(() => import('../pages/public/Venue'));
const Travel = lazy(() => import('../pages/public/Travel'));
const Faq = lazy(() => import('../pages/public/Faq'));
const Contact = lazy(() => import('../pages/public/Contact'));
const Documents = lazy(() => import('../pages/public/Documents'));
const News = lazy(() => import('../pages/public/News'));
const Events = lazy(() => import('../pages/public/Events'));
const EventDetail = lazy(() => import('../pages/public/EventDetail'));
const HistoricalArchive = lazy(() => import('../pages/public/HistoricalArchive'));
const NotFound = lazy(() => import('../pages/public/NotFound'));
const Donate = lazy(() => import('../pages/public/Donate'));
const UnifiedPortal = lazy(() => import('../pages/public/UnifiedPortal'));
const PrivacyPolicy = lazy(() => import('../pages/public/Policies').then((m) => ({ default: m.PrivacyPolicy })));
const Terms = lazy(() => import('../pages/public/Policies').then((m) => ({ default: m.Terms })));
const RefundPolicy = lazy(() => import('../pages/public/Policies').then((m) => ({ default: m.RefundPolicy })));

// Admin

const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminEvents = lazy(() => import('../pages/admin/Events'));
const PreviousYears = lazy(() => import('../pages/admin/PreviousYears'));
const AdminProgramme = lazy(() => import('../pages/admin/Programme'));
const AdminSpeakers = lazy(() => import('../pages/admin/Speakers'));
const AdminAnnouncements = lazy(() => import('../pages/admin/Announcements'));
const AdminRegistrations = lazy(() => import('../pages/admin/Registrations'));
const MigrationImport = lazy(() => import('../pages/admin/MigrationImport'));
const CrmContacts = lazy(() => import('../pages/admin/CrmContacts'));
const CrmContactDetail = lazy(() => import('../pages/admin/CrmContactDetail'));
const AdminAttendees = lazy(() => import('../pages/admin/Attendees'));
const AdminCheckIn = lazy(() => import('../pages/admin/CheckIn'));
const AdminBadges = lazy(() => import('../pages/admin/Badges'));
const AdminRooming = lazy(() => import('../pages/admin/Rooming'));
const AdminPricing = lazy(() => import('../pages/admin/Pricing'));
const AdminSponsors = lazy(() => import('../pages/admin/Sponsors'));
const AdminDonations = lazy(() => import('../pages/admin/Donations'));
const TrafficLogs = lazy(() => import('../pages/admin/TrafficLogs'));
const AdminPartners = lazy(() => import('../pages/admin/Partners'));
const AdminExhibitors = lazy(() => import('../pages/admin/Exhibitors'));
const AdminStalls = lazy(() => import('../pages/admin/Stalls'));
const Resources = lazy(() => import('../pages/admin/Resources'));
const MediaLibrary = lazy(() => import('../pages/admin/MediaLibrary'));
const AdminGallery = lazy(() => import('../pages/admin/Gallery'));
const AdminDocuments = lazy(() => import('../pages/admin/Documents'));
const AdminFaqs = lazy(() => import('../pages/admin/Faqs'));
const AdminEnquiries = lazy(() => import('../pages/admin/Enquiries'));
const GoogleSheetsIntegration = lazy(() => import('../pages/admin/GoogleSheetsIntegration'));
const AuditLogs = lazy(() => import('../pages/admin/AuditLogs'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));
const UsersPage = lazy(() => import('../pages/admin/Users'));
const ProfilePage = lazy(() => import('../pages/admin/Profile'));
const IntegrationsPage = lazy(() => import('../pages/admin/Integrations'));

// Operations Module
const AttendeeOperations = lazy(() => import('../pages/admin/AttendeeOperations'));
const AttendanceVerification = lazy(() => import('../pages/admin/AttendanceVerification'));
const CheckinScanner = lazy(() => import('../pages/admin/CheckinScanner'));
const WhatsAppGroupManager = lazy(() => import('../pages/admin/WhatsAppGroupManager'));
const RoomingBoard = lazy(() => import('../pages/admin/RoomingBoard'));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<Navigate to="/event" replace />} />
          <Route path="event" element={<EventPage />} />
          <Route path="programme" element={<Programme />} />
          <Route path="agenda" element={<Navigate to="/programme" replace />} />
          <Route path="speakers" element={<Speakers />} />
          <Route path="speakers/:id" element={<SpeakerDetail />} />
          <Route path="registration" element={<RegistrationPage />} />
          <Route path="register" element={<Navigate to="/registration" replace />} />
          <Route path="donate" element={<Donate />} />
          <Route path="my-vachanshivir" element={<MyVachanShivir />} />
          <Route path="my-vachan-shivir" element={<MyVachanShivir />} />
          <Route path="my-aipc" element={<Navigate to="/my-vachanshivir" replace />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="sponsors" element={<Sponsors />} />
          <Route path="partners" element={<Partners />} />
          <Route path="exhibition" element={<Exhibition />} />
          <Route path="stalls" element={<Stalls />} />
          <Route path="stalls/:id" element={<StallDetail />} />
          <Route path="exhibitors" element={<Exhibitors />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="venue" element={<Venue />} />
          <Route path="accommodation" element={<Navigate to="/pricing" replace />} />
          <Route path="travel" element={<Travel />} />
          <Route path="faq" element={<Faq />} />
          <Route path="contact" element={<Contact />} />
          <Route path="documents" element={<Documents />} />
          <Route path="news" element={<News />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:slug" element={<EventDetail />} />
          <Route path="archive" element={<HistoricalArchive />} />
          <Route path="archive/:year" element={<HistoricalArchive />} />
          <Route path="policies" element={<PrivacyPolicy />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="refund-policy" element={<RefundPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Unified Portal & Categorized Forms Canvas (Standalone Canvas — No Header & No Footer) */}
        <Route path="/forms" element={<UnifiedPortal initialCategory="participant" />} />
        <Route path="/portal" element={<UnifiedPortal initialCategory="participant" />} />
        <Route path="/auth" element={<UnifiedPortal initialCategory="participant" />} />
        <Route path="/login" element={<UnifiedPortal initialCategory="participant" />} />
        <Route path="/forgot-password" element={<UnifiedPortal initialCategory="password" />} />
        <Route path="/reset-password" element={<UnifiedPortal initialCategory="password" />} />
        <Route path="/enquiry" element={<UnifiedPortal initialCategory="enquiry" />} />
        <Route path="/contact-form" element={<UnifiedPortal initialCategory="enquiry" />} />

        {/* Master Admin Portal Canvas (Standalone Canvas — No Header & No Footer) */}
        <Route path="/admin" element={<UnifiedPortal initialCategory="admin" />} />
        <Route path="/admin/login" element={<Navigate to="/admin" replace />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route element={<AreaRoute area="events" />}>
              <Route path="events" element={<AdminEvents />} />
              <Route path="events/previous-years" element={<PreviousYears />} />
            </Route>
            <Route element={<AreaRoute area="programme" />}><Route path="programme" element={<AdminProgramme />} /></Route>
            <Route element={<AreaRoute area="speakers" />}><Route path="speakers" element={<AdminSpeakers />} /></Route>
            <Route element={<AreaRoute area="announcements" />}><Route path="announcements" element={<AdminAnnouncements />} /></Route>
            <Route element={<AreaRoute area="registrations" />}>
              <Route path="registrations" element={<AdminRegistrations />} />
              <Route path="operations" element={<AttendeeOperations />} />
              <Route path="operations/verification" element={<AttendanceVerification />} />
              <Route path="operations/scanner" element={<CheckinScanner />} />
              <Route path="operations/whatsapp" element={<WhatsAppGroupManager />} />
              <Route path="operations/rooming-board" element={<RoomingBoard />} />
              <Route path="migration" element={<MigrationImport />} />
              <Route path="crm/contacts" element={<CrmContacts />} />
              <Route path="crm/contacts/:id" element={<CrmContactDetail />} />
            </Route>
            <Route element={<AreaRoute area="attendees" />}><Route path="attendees" element={<AdminAttendees />} /></Route>
            <Route element={<AreaRoute area="check-in" />}><Route path="check-in" element={<AdminCheckIn />} /></Route>
            <Route element={<AreaRoute area="badges" />}><Route path="badges" element={<AdminBadges />} /></Route>
            <Route element={<AreaRoute area="rooming" />}><Route path="rooming" element={<AdminRooming />} /></Route>
            <Route element={<AreaRoute area="pricing" />}><Route path="pricing" element={<AdminPricing />} /></Route>
            <Route element={<AreaRoute area="sponsors" />}>
              <Route path="sponsors" element={<AdminSponsors />} />
              <Route path="donations" element={<AdminDonations />} />
            </Route>
            <Route element={<AreaRoute area="partners" />}><Route path="partners" element={<AdminPartners />} /></Route>
            <Route element={<AreaRoute area="exhibitors" />}><Route path="exhibitors" element={<AdminExhibitors />} /></Route>
            <Route element={<AreaRoute area="stalls" />}><Route path="stalls" element={<AdminStalls />} /></Route>
            <Route element={<AreaRoute area="gallery" />}><Route path="gallery" element={<AdminGallery />} /></Route>
            <Route element={<AreaRoute area="documents" />}>
              <Route path="media-library" element={<MediaLibrary />} />
              <Route path="documents" element={<AdminDocuments />} />
              <Route path="resources" element={<Resources />} />
            </Route>
            <Route element={<AreaRoute area="faqs" />}><Route path="faqs" element={<AdminFaqs />} /></Route>
            <Route element={<AreaRoute area="enquiries" />}><Route path="enquiries" element={<AdminEnquiries />} /></Route>
            <Route element={<AreaRoute area="settings" />}>
              <Route path="integrations/google-sheets" element={<GoogleSheetsIntegration />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="traffic-logs" element={<TrafficLogs />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
