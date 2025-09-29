import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useReports } from '../../contexts/ReportsContext';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  MapPin, 
  Users, 
  Clock,
  Download,
  RefreshCw
} from 'lucide-react';

const SummaryDashboard = () => {
  const { allReports, socialPosts, exportReports, syncQueuedReports, queuedReports, isOnline } = useReports();
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate statistics
  const totalReports = allReports.length;
  const highAlerts = allReports.filter(r => r.alert_level === 'high').length;
  const verifiedReports = allReports.filter(r => r.status === 'verified').length;
  const pendingReports = allReports.filter(r => r.status === 'queued').length;
  
  const trustScoreAvg = allReports.length > 0 
    ? Math.round(allReports.reduce((sum, r) => sum + r.trust_score, 0) / allReports.length)
    : 0;

  const todayReports = allReports.filter(r => {
    const reportDate = new Date(r.timestamp);
    const today = new Date();
    return reportDate.toDateString() === today.toDateString();
  }).length;

  const weeklyTrend = calculateWeeklyTrend();
  
  function calculateWeeklyTrend() {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const thisWeek = allReports.filter(r => new Date(r.timestamp) >= weekAgo).length;
    const lastWeek = allReports.filter(r => {
      const date = new Date(r.timestamp);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length;
    
    if (lastWeek === 0) return { change: 0, direction: 'neutral' };
    
    const change = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek * 100).toFixed(1) : 0;
    return {
      change: Math.abs(change),
      direction: thisWeek > lastWeek ? 'up' : thisWeek < lastWeek ? 'down' : 'neutral'
    };
  }

  const topHotspots = getTopHotspots();
  
  function getTopHotspots() {
    const locationCounts = {};
    allReports.forEach(report => {
      const city = report.address.split(',')[1]?.trim() || report.address;
      locationCounts[city] = (locationCounts[city] || 0) + 1;
    });
    
    return Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));
  }

  const recentHighAlerts = allReports
    .filter(r => r.alert_level === 'high')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <div className="container-mobile py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Summary Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive overview of ocean monitoring platform</p>
        </div>
        
        <div className="flex space-x-2">
          {!isOnline && queuedReports.length > 0 && (
            <Button variant="outline" size="sm" onClick={syncQueuedReports}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Sync ({queuedReports.length})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => exportReports('json')}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalReports}</p>
                <p className="text-xs text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-500">{highAlerts}</p>
                <p className="text-xs text-muted-foreground">High Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{verifiedReports}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-500">{pendingReports}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Today's Reports</p>
                <Badge variant="secondary">{todayReports}</Badge>
              </div>
              <p className="text-2xl font-bold">{todayReports}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Average Trust Score</p>
                <div className={`rounded-full px-2 py-1 text-xs font-medium ${
                  trustScoreAvg >= 71 ? 'trust-score-high' :
                  trustScoreAvg >= 41 ? 'trust-score-medium' : 'trust-score-low'
                }`}>
                  {trustScoreAvg}%
                </div>
              </div>
              <p className="text-2xl font-bold">{trustScoreAvg}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Weekly Trend</p>
                <div className={`flex items-center space-x-1 text-xs ${
                  weeklyTrend.direction === 'up' ? 'text-green-600' : 
                  weeklyTrend.direction === 'down' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  <TrendingUp className={`h-3 w-3 ${weeklyTrend.direction === 'down' ? 'rotate-180' : ''}`} />
                  <span>{weeklyTrend.change}%</span>
                </div>
              </div>
              <p className="text-2xl font-bold">{weeklyTrend.change}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Platform Integration Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Authorities Dashboard</span>
                  <Badge variant="secondary">{verifiedReports} verified</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Users Dashboard</span>
                  <Badge variant="secondary">{totalReports} total</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Volunteers Dashboard</span>
                  <Badge variant="secondary">{pendingReports} tasks</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Social Analytics Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Social Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Social Posts Tracked</span>
                  <Badge variant="secondary">{socialPosts.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Verified Posts</span>
                  <Badge variant="secondary">{socialPosts.filter(p => p.verified).length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Linked to Reports</span>
                  <Badge variant="secondary">{socialPosts.filter(p => p.linked_report).length}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hotspots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Top 5 Reporting Locations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topHotspots.length > 0 ? (
                <div className="space-y-3">
                  {topHotspots.map((hotspot, index) => (
                    <div key={hotspot.location} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{hotspot.location}</span>
                      </div>
                      <Badge variant="secondary">{hotspot.count} reports</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No location data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Recent High Priority Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentHighAlerts.length > 0 ? (
                <div className="space-y-3">
                  {recentHighAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 border border-red-200 bg-red-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-red-800 capitalize">
                            {alert.visual_tag.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-red-600">{alert.address}</p>
                          <p className="text-xs text-red-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className={`rounded-full px-2 py-1 text-xs font-medium ${
                          alert.trust_score >= 71 ? 'trust-score-high' :
                          alert.trust_score >= 41 ? 'trust-score-medium' : 'trust-score-low'
                        }`}>
                          {alert.trust_score}%
                        </div>
                      </div>
                      <p className="text-sm text-red-700 mt-2 line-clamp-2">
                        {alert.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No high priority alerts at this time
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SummaryDashboard;
