import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ReportsProvider } from './contexts/ReportsContext';
import { NotificationProvider } from './contexts/NotificationContext';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import Index from './pages/Index';
import FeedPage from './pages/FeedPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import AuthoritiesDashboard from './pages/dashboards/AuthoritiesDashboard';
import UsersDashboard from './pages/dashboards/UsersDashboard';
import VolunteersDashboard from './pages/dashboards/VolunteersDashboard';

import SummaryDashboard from './pages/dashboards/SummaryDashboard';
import SocialMediaAnalytics from './pages/SocialMediaAnalytics';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';
import Notification from './components/Notification';

const queryClient = new QueryClient();

// Main App Layout
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  React.useEffect(() => {
    document.body.classList.toggle('overflow-hidden', sidebarOpen);
    return () => document.body.classList.remove('overflow-hidden');
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Responsive behavior */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden">
          <Header
            onMenuToggle={() => setSidebarOpen((prev) => !prev)}
            sidebarOpen={sidebarOpen}
          />
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Pragyan Chakra Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <span className="text-lg">🔔</span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <span className="text-lg">⚙️</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">U</span>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          <div className="lg:p-6">
            <Routes>
              <Route path="/" element={<FeedPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/dashboard/authorities" element={<AuthoritiesDashboard />} />
              <Route path="/dashboard/users" element={<UsersDashboard />} />
              <Route path="/dashboard/volunteers" element={<VolunteersDashboard />} />
              <Route path="/dashboard/summary" element={<SummaryDashboard />} />
              <Route path="/analytics/social" element={<SocialMediaAnalytics />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>

        <Notification />
      </div>
    </div>
  );
};

// Auth-aware App Component
const AuthenticatedApp = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Pragyan Chakra...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <NotificationProvider>
      <ReportsProvider>
        <Routes>
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </ReportsProvider>
    </NotificationProvider>
  );
};

// Main App Component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <AuthProvider>
            <AuthenticatedApp />
          </AuthProvider>
        </Router>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;