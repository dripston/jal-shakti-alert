import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Map, 
  BarChart3, 
  Users, 
  Shield, 
  User, 
  Settings,
  FileText,
  TrendingUp,
  Activity,
  LogOut,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigationItems = [
    {
      title: 'Main',
      items: [
        { icon: Home, label: 'Feed', path: '/' },
        { icon: Map, label: 'Map View', path: '/map' },
        { icon: User, label: 'Profile', path: '/profile' }
      ]
    },
    {
      title: 'Integrated Platform',
      items: [
        { icon: Shield, label: 'Authorities Dashboard', path: '/dashboard/authorities' },
        { icon: Users, label: 'Users Dashboard', path: '/dashboard/users' },
        { icon: Activity, label: 'Volunteers Dashboard', path: '/dashboard/volunteers' }
      ]
    },
    {
      title: 'Social Analytics',
      items: [
        { icon: BarChart3, label: 'Authorities Analytics', path: '/analytics/authorities' },
        { icon: TrendingUp, label: 'Users Analytics', path: '/analytics/users' },
        { icon: FileText, label: 'Volunteers Analytics', path: '/analytics/volunteers' }
      ]
    },
    {
      title: 'Summary',
      items: [
        { icon: BarChart3, label: 'Summary Dashboard', path: '/dashboard/summary' }
      ]
    }
  ];

  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Backdrop - only visible when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar - slides in from left as overlay */}
      <div className={`
        fixed left-0 top-0 h-full w-80 bg-card border-r z-50 
        transform transition-transform duration-300 ease-in-out shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">OW</span>
              </div>
              <div>
                <h2 className="font-heading font-bold text-primary">OceanWatch</h2>
                <p className="text-xs text-muted-foreground">Crowd-sourced ocean monitoring</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-muted transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 rounded-full border-2 border-primary/20"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground">@{user.handle}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.trust_rating >= 71 ? 'trust-score-high' :
                      user.trust_rating >= 41 ? 'trust-score-medium' : 'trust-score-low'
                    }`}>
                      Trust: {user.trust_rating}%
                    </div>
                    {user.verified && (
                      <div className="text-xs text-blue-600 font-medium">✓ Verified</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {navigationItems.map((section) => (
              <div key={section.title}>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveRoute(item.path);
                    
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`
                          flex items-center space-x-3 rounded-lg px-3 py-2 text-sm 
                          transition-all duration-200 hover:scale-[1.02]
                          ${active 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }
                        `}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="space-y-2">
              <NavLink
                to="/settings"
                onClick={onClose}
                className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </NavLink>
              
              <Button
                variant="ghost"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full justify-start px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-3" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;