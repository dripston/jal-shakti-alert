import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { useReports } from '../contexts/ReportsContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { 
  Settings, 
  Wifi, 
  Bell, 
  MapPin, 
  Download, 
  Trash2,
  RefreshCw,
  Database,
  Shield,
  Smartphone
} from 'lucide-react';

const SettingsPage = () => {
  const { queuedReports, syncQueuedReports, isOnline } = useReports();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    offlineMode: true,
    autoSync: true,
    locationAccess: true,
    pushNotifications: true,
    highAlertNotifications: true,
    nearbyReportsNotifications: false,
    dataCompression: true,
    backgroundSync: true,
    lowPowerMode: false
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Setting updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} has been ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleClearCache = () => {
    if (window.confirm('This will clear all cached data. Continue?')) {
      localStorage.clear();
      toast({
        title: "Cache cleared",
        description: "All cached data has been removed.",
      });
    }
  };

  const handleExportData = () => {
    const userData = {
      user,
      settings,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(userData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oceanwatch_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data exported",
      description: "Your data has been exported successfully.",
    });
  };

  return (
    <div className="container-mobile py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-heading font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your app preferences and data</p>
        </div>
      </div>

      {/* Network Status */}
      <Card className={isOnline ? 'border-green-300 bg-green-50' : 'border-yellow-300 bg-yellow-50'}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wifi className={`h-5 w-5 ${isOnline ? 'text-green-600' : 'text-yellow-600'}`} />
              <div>
                <p className="font-medium">{isOnline ? 'Online' : 'Offline'}</p>
                <p className="text-sm text-muted-foreground">
                  {isOnline 
                    ? 'Connected to internet' 
                    : `${queuedReports.length} reports queued for sync`
                  }
                </p>
              </div>
            </div>
            
            {!isOnline && queuedReports.length > 0 && (
              <Button size="sm" onClick={syncQueuedReports}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Sync Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Offline Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Offline & Sync</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Offline Mode</Label>
              <p className="text-sm text-muted-foreground">
                Allow app to work without internet connection
              </p>
            </div>
            <Switch
              checked={settings.offlineMode}
              onCheckedChange={(checked) => handleSettingChange('offlineMode', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Auto Sync</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync when connection is restored
              </p>
            </div>
            <Switch
              checked={settings.autoSync}
              onCheckedChange={(checked) => handleSettingChange('autoSync', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Background Sync</Label>
              <p className="text-sm text-muted-foreground">
                Sync data in background when app is closed
              </p>
            </div>
            <Switch
              checked={settings.backgroundSync}
              onCheckedChange={(checked) => handleSettingChange('backgroundSync', checked)}
            />
          </div>

          <div className="pt-2">
            <div className="flex space-x-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>{queuedReports.length} reports in sync queue</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Privacy & Permissions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Location Access</Label>
              <p className="text-sm text-muted-foreground">
                Allow GPS location for report geo-tagging
              </p>
            </div>
            <Switch
              checked={settings.locationAccess}
              onCheckedChange={(checked) => handleSettingChange('locationAccess', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Data Compression</Label>
              <p className="text-sm text-muted-foreground">
                Compress images and data to save bandwidth
              </p>
            </div>
            <Switch
              checked={settings.dataCompression}
              onCheckedChange={(checked) => handleSettingChange('dataCompression', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive general app notifications
              </p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">High Alert Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about high-priority hazards
              </p>
            </div>
            <Switch
              checked={settings.highAlertNotifications}
              onCheckedChange={(checked) => handleSettingChange('highAlertNotifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Nearby Reports</Label>
              <p className="text-sm text-muted-foreground">
                Notifications for reports near your location
              </p>
            </div>
            <Switch
              checked={settings.nearbyReportsNotifications}
              onCheckedChange={(checked) => handleSettingChange('nearbyReportsNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Low Power Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce background activity to save battery
              </p>
            </div>
            <Switch
              checked={settings.lowPowerMode}
              onCheckedChange={(checked) => handleSettingChange('lowPowerMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4 mr-2" />
            Export My Data
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleClearCache}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
          
          <div className="pt-2 text-xs text-muted-foreground">
            <p>Cache: ~2.4 MB • Last sync: {isOnline ? 'Now' : 'Offline'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={logout}
            className="w-full"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
          <div className="space-y-1">
            <p>OceanWatch v1.0.0</p>
            <p>Crowd-sourced ocean hazard monitoring</p>
            <p className="text-xs">Built with ❤️ for ocean conservation</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;