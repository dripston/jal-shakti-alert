import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useReports } from '../contexts/ReportsContext';
import { Bell, Menu, Wifi, WifiOff, User, X } from 'lucide-react';
import { Button } from './ui/button';

const Header = ({ onMenuToggle, sidebarOpen = false, title = "OceanWatch" }) => {
  const { user, logout } = useAuth();
  const { isOnline, queuedReports } = useReports();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container-mobile flex h-14 items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="mr-2 p-2 transition-transform duration-200 hover:scale-105"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        <div className="flex-1">
          <h1 className="ornate-header text-lg font-heading font-bold text-primary">
            {title}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* Network Status Indicator */}
          <div className="flex items-center space-x-1">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <div className="flex items-center space-x-1">
                <WifiOff className="h-4 w-4 text-red-500" />
                {queuedReports.length > 0 && (
                  <span className="rounded-full bg-yellow-500 px-1.5 py-0.5 text-xs text-white">
                    {queuedReports.length}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative p-2">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>

          {/* User Profile */}
          {user && (
            <div className="flex items-center space-x-2">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full border-2 border-primary/20"
              />
            </div>
          )}
        </div>
      </div>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="offline-banner">
          Offline Mode - {queuedReports.length} reports pending sync
        </div>
      )}
    </header>
  );
};

export default Header;