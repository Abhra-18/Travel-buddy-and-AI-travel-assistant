import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';

// ── Skeleton fallback ──────────────────────────────────────────
const PageLoader = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '1rem',
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      border: '4px solid var(--color-border)',
      borderTopColor: '#6366f1',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading...</p>
  </div>
);

// ── Lazy-loaded pages ──────────────────────────────────────────
const Home            = lazy(() => import('../pages/Home/Home'));
const Login           = lazy(() => import('../pages/Login/Login'));
const Register        = lazy(() => import('../pages/Register/Register'));
const NotFound        = lazy(() => import('../pages/NotFound/NotFound'));
const Dashboard       = lazy(() => import('../pages/Dashboard/Dashboard'));
const Profile         = lazy(() => import('../pages/Profile/Profile'));
const EditProfile     = lazy(() => import('../pages/Profile/EditProfile'));
const Assessment      = lazy(() => import('../pages/Assessment/Assessment'));
const AssessmentResults = lazy(() => import('../pages/Assessment/AssessmentResults'));
const BuddyFinder     = lazy(() => import('../pages/BuddyFinder/BuddyFinder'));
const TripExplorer    = lazy(() => import('../pages/Trips/TripExplorer'));
const CreateTrip      = lazy(() => import('../pages/Trips/CreateTrip'));
const EditTrip        = lazy(() => import('../pages/Trips/EditTrip'));
const TripPlanner     = lazy(() => import('../pages/Planner/TripPlanner'));
const PlannerDashboard = lazy(() => import('../pages/Planner/PlannerDashboard'));
const PlannerView     = lazy(() => import('../pages/Planner/PlannerView'));
const Messages        = lazy(() => import('../pages/Messages/Messages'));
const Feed            = lazy(() => import('../pages/Feed/Feed'));
const AdminDashboard  = lazy(() => import('../pages/Admin/AdminDashboard'));

const wrap = (Component) => (
  <MainLayout>
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  </MainLayout>
);

const wrapProtected = (Component, requireAdmin = false) => (
  <ProtectedRoute requireAdmin={requireAdmin}>
    <MainLayout>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </MainLayout>
  </ProtectedRoute>
);

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/"          element={wrap(Home)} />
    <Route path="/login"     element={wrap(Login)} />
    <Route path="/register"  element={wrap(Register)} />

    {/* Protected */}
    <Route path="/dashboard"          element={wrapProtected(Dashboard)} />
    <Route path="/profile"            element={wrapProtected(Profile)} />
    <Route path="/profile/edit"       element={wrapProtected(EditProfile)} />
    <Route path="/assessment"         element={wrapProtected(Assessment)} />
    <Route path="/assessment/results" element={wrapProtected(AssessmentResults)} />
    <Route path="/buddy-finder"       element={wrapProtected(BuddyFinder)} />
    <Route path="/trips"              element={wrapProtected(TripExplorer)} />
    <Route path="/trips/new"          element={wrapProtected(CreateTrip)} />
    <Route path="/trips/:id/edit"     element={wrapProtected(EditTrip)} />
    <Route path="/planner"            element={wrapProtected(TripPlanner)} />
    <Route path="/planner/dashboard"  element={wrapProtected(PlannerDashboard)} />
    <Route path="/planner/view/:id"   element={wrapProtected(PlannerView)} />
    <Route path="/messages"           element={wrapProtected(Messages)} />
    <Route path="/feed"               element={wrapProtected(Feed)} />
    <Route path="/admin"              element={wrapProtected(AdminDashboard, true)} />

    {/* 404 */}
    <Route path="*" element={wrap(NotFound)} />
  </Routes>
);

export default AppRoutes;
