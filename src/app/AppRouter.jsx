import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import ErrorBoundary from '../shared/ui/ErrorBoundary.jsx';
import ProtectedRoute from '../shared/ui/ProtectedRoute.jsx';
import SplashScreen from '../shared/ui/SplashScreen.jsx';
import MaintenanceOverlay from '../shared/ui/MaintenanceOverlay.jsx';
import PlanLock from '../shared/ui/PlanLock.jsx';
import { AuthProvider, useAuth } from '../features/auth/context/AuthContext.jsx';
import { ThemeProvider } from '../shared/ui/ThemeToggle.jsx';
import { ConfirmProvider } from '../shared/ui/ConfirmModal.jsx';
import { getRoleHome } from '../shared/config/roleHome.js';

import LoginPage from '../features/auth/pages/LoginPage.jsx';
import UserLayout from '../features/user/layout/UserLayout.jsx';
import OverviewPage from '../features/user/pages/OverviewPage.jsx';
import WorkoutPage from '../features/user/pages/WorkoutPage.jsx';
import NutritionPage from '../features/user/pages/NutritionPage.jsx';
import SleepPage from '../features/user/pages/SleepPage.jsx';
import TeamsPage from '../features/user/pages/TeamsPage.jsx';
import FeedPage from '../features/user/pages/FeedPage.jsx';
import ChallengePage from '../features/user/pages/ChallengePage.jsx';
import ChatPage from '../features/user/pages/ChatPage.jsx';
import ProfilePage from '../features/user/pages/ProfilePage.jsx';
import AchievementsPage from '../features/user/pages/AchievementsPage.jsx';
import MyPlansPage from '../features/user/pages/MyPlansPage.jsx';
import CoachLayout from '../features/coach/layout/CoachLayout.jsx';
import CoachOverviewPage from '../features/coach/pages/CoachOverviewPage.jsx';
import CoachAthletesPage from '../features/coach/pages/CoachAthletesPage.jsx';
import CoachWorkoutsPage from '../features/coach/pages/CoachWorkoutsPage.jsx';
import CoachMessagesPage from '../features/coach/pages/CoachMessagesPage.jsx';
import NutLayout from '../features/nutritionist/layout/NutLayout.jsx';
import NutOverviewPage from '../features/nutritionist/pages/NutOverviewPage.jsx';
import NutClientsPage from '../features/nutritionist/pages/NutClientsPage.jsx';
import NutTemplatesPage from '../features/nutritionist/pages/NutTemplatesPage.jsx';
import AdminLayout from '../features/admin/layout/AdminLayout.jsx';
import AdminOverviewPage from '../features/admin/pages/AdminOverviewPage.jsx';
import AdminUsersPage from '../features/admin/pages/AdminUsersPage.jsx';
import AdminInboxPage from '../features/admin/pages/AdminInboxPage.jsx';
import AdminSettingsPage from '../features/admin/pages/AdminSettingsPage.jsx';
import AdminSecurityPage from '../features/admin/pages/AdminSecurityPage.jsx';
import AdminManagePage from '../features/admin/pages/AdminManagePage.jsx';
import DirectMessagesPage from '../features/shared/pages/DirectMessagesPage.jsx';
import DiscoverPage from '../features/shared/pages/DiscoverPage.jsx';
import ContactPage from '../features/shared/pages/ContactPage.jsx';
import ProProfilePage from '../features/shared/pages/ProProfilePage.jsx';

function RootRedirect() {
  const { user } = useAuth();

  if (!user) {
    window.location.replace('/landing.html');
    return null;
  }

  return <Navigate to={getRoleHome(user.role)} replace />;
}

export default function AppRouter() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <ThemeProvider>
    <ConfirmProvider>
      <ErrorBoundary>
        {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
        <MaintenanceOverlay />
        <AuthProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/contact" element={<ContactPage />} />

            <Route
              path="/app"
              element={(
                <ProtectedRoute roles={['USER', 'ADMIN']}>
                  <UserLayout />
                </ProtectedRoute>
              )}
            >
              <Route index element={<OverviewPage />} />
              <Route path="workout" element={<WorkoutPage />} />
              <Route path="nutrition" element={<NutritionPage />} />
              <Route path="sleep" element={<SleepPage />} />
              <Route path="feed" element={<FeedPage />} />
              <Route path="teams" element={<PlanLock requiredPlan="TEAM"><TeamsPage /></PlanLock>} />
              <Route path="challenges" element={<ChallengePage />} />
              <Route path="chat" element={<PlanLock requiredPlan="TEAM"><ChatPage /></PlanLock>} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="public-profile" element={<ProProfilePage />} />
              <Route path="achievements" element={<PlanLock requiredPlan="PRO"><AchievementsPage /></PlanLock>} />
              <Route path="my-plans" element={<PlanLock requiredPlan="PRO"><MyPlansPage /></PlanLock>} />
              <Route path="dm" element={<PlanLock requiredPlan="PRO"><DirectMessagesPage /></PlanLock>} />
              <Route path="discover" element={<PlanLock requiredPlan="PRO"><DiscoverPage /></PlanLock>} />
            </Route>

            <Route
              path="/coach"
              element={(
                <ProtectedRoute roles={['COACH', 'ADMIN']}>
                  <CoachLayout />
                </ProtectedRoute>
              )}
            >
              <Route index element={<CoachOverviewPage />} />
              <Route path="athletes" element={<CoachAthletesPage />} />
              <Route path="workouts" element={<CoachWorkoutsPage />} />
              <Route path="messages" element={<CoachMessagesPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="dm" element={<DirectMessagesPage />} />
              <Route path="teams" element={<TeamsPage />} />
              <Route path="discover" element={<DiscoverPage />} />
              <Route path="profile" element={<ProProfilePage />} />
            </Route>

            <Route
              path="/nutritionist"
              element={(
                <ProtectedRoute roles={['NUTRITIONIST', 'ADMIN']}>
                  <NutLayout />
                </ProtectedRoute>
              )}
            >
              <Route index element={<NutOverviewPage />} />
              <Route path="clients" element={<NutClientsPage />} />
              <Route path="templates" element={<NutTemplatesPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="dm" element={<DirectMessagesPage />} />
              <Route path="teams" element={<TeamsPage />} />
              <Route path="discover" element={<DiscoverPage />} />
              <Route path="profile" element={<ProProfilePage />} />
            </Route>

            <Route
              path="/admin"
              element={(
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              )}
            >
              <Route index element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="inbox" element={<AdminInboxPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="security" element={<AdminSecurityPage />} />
              <Route path="manage" element={<AdminManagePage />} />
            </Route>

            <Route
              path="/unauthorized"
              element={(
                <div
                  style={{
                    padding: 60,
                    textAlign: 'center',
                    fontFamily: 'Barlow Condensed',
                    fontSize: 32,
                    fontWeight: 900,
                  }}
                >
                  🚫 Acces interzis
                </div>
              )}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
    </ConfirmProvider>
    </ThemeProvider>
  );
}
