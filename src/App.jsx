import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ReportsProvider } from './contexts/ReportsContext';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import FeedPage from './pages/FeedPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import AuthoritiesDashboard from './pages/dashboards/AuthoritiesDashboard';
import UsersDashboard from './pages/dashboards/UsersDashboard';
import VolunteersDashboard from './pages/dashboards/VolunteersDashboard';
import AuthoritiesAnalytics from './pages/analytics/AuthoritiesAnalytics';
import UsersAnalytics from './pages/analytics/UsersAnalytics';
import VolunteersAnalytics from './pages/analytics/VolunteersAnalytics';
import SummaryDashboard from './pages/dashboards/SummaryDashboard';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Main App Layout
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<FeedPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/dashboard/authorities" element={<AuthoritiesDashboard />} />
            <Route path="/dashboard/users" element={<UsersDashboard />} />
            <Route path="/dashboard/volunteers" element={<VolunteersDashboard />} />
            <Route path="/analytics/authorities" element={<AuthoritiesAnalytics />} />
            <Route path="/analytics/users" element={<UsersAnalytics />} />
            <Route path="/analytics/volunteers" element={<VolunteersAnalytics />} />
            <Route path="/dashboard/summary" element={<SummaryDashboard />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
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
          <p className="text-muted-foreground">Loading OceanWatch...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  return (
    <ReportsProvider>
      <AppLayout />
    </ReportsProvider>
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