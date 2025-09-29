import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw,
  Link
} from 'lucide-react';

const SummaryDashboard = () => {
  const { allReports, socialPosts, exportReports, syncQueuedReports, queuedReports, isOnline, refreshFromDatabase } = useReports();
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshFromDatabase();
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize calculated statistics to prevent unnecessary recalculations
  const statistics = useMemo(() => {
    const totalReports = allReports?.length || 0;
    const highAlerts = allReports?.filter(r => r.alert_level === 'high').length || 0;
    const verifiedReports = allReports?.filter(r => r.status === 'verified').length || 0;
    const pendingReports = allReports?.filter(r => r.status === 'queued').length || 0;
    
    const trustScoreAvg = allReports && allReports.length > 0 
      ? Math.round(allReports.reduce((sum, r) => sum + (r.trust_score || 0), 0) / allReports.length)
      : 0;

    const todayReports = allReports?.filter(r => {
      if (!r.timestamp) return false;
      const reportDate = new Date(r.timestamp);
      const today = new Date();
      return reportDate.toDateString() === today.toDateString();
    }).length || 0;

    return {
      totalReports,
      highAlerts,
      verifiedReports,
      pendingReports,
      trustScoreAvg,
      todayReports
    };
  }, [allReports]);

  const weeklyTrend = useMemo(() => {
    if (!allReports || allReports.length === 0) {
      return { change: 0, direction: 'neutral' };
    }
    
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
  }, [allReports]);

  const topHotspots = useMemo(() => {
    if (!allReports || allReports.length === 0) {
      return [];
    }
    
    const locationCounts = {};
    allReports.forEach(report => {
      if (!report.address) return;
      const city = report.address.split(',')[1]?.trim() || report.address;
      locationCounts[city] = (locationCounts[city] || 0) + 1;
    });
    
    return Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));
  }, [allReports]);

  const recentHighAlerts = useMemo(() => {
    return allReports
      ?.filter(r => r.alert_level === 'high')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5) || [];
  }, [allReports]);

  // Format last updated time
  const formatLastUpdated = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Summary Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive overview of ocean monitoring platform</p>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {formatLastUpdated(lastUpdated)}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          {!isOnline && queuedReports && queuedReports.length > 0 && (
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="transition-all hover:shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.totalReports}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{statistics.highAlerts}</p>
                <p className="text-sm text-muted-foreground">High Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{statistics.verifiedReports}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">{statistics.pendingReports}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="transition-all hover:shadow-md">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Today's Reports</p>
                <Badge variant="secondary">{statistics.todayReports}</Badge>
              </div>
              <p className="text-2xl font-bold">{statistics.todayReports}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Average Trust Score</p>
                <div className={`rounded-full px-2 py-1 text-xs font-medium ${
                  statistics.trustScoreAvg >= 71 ? 'trust-score-high' :
                  statistics.trustScoreAvg >= 41 ? 'trust-score-medium' : 'trust-score-low'
                }`}>
                  {statistics.trustScoreAvg}%
                </div>
              </div>
              <p className="text-2xl font-bold">{statistics.trustScoreAvg}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Weekly Trend</p>
                <div className={`flex items-center space-x-1 text-xs ${
                  weeklyTrend.direction === 'up' ? 'text-green-600' : 
                  weeklyTrend.direction === 'down' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  <TrendingUp className={`h-4 w-4 ${weeklyTrend.direction === 'down' ? 'rotate-180' : ''}`} />
                  <span>{weeklyTrend.change}%</span>
                </div>
              </div>
              <p className="text-2xl font-bold">
                {weeklyTrend.direction === 'up' ? '+' : ''}{weeklyTrend.change}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Platform Integration Summary */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Platform Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">Authorities Dashboard</span>
                  </div>
                  <Badge variant="secondary">{statistics.verifiedReports} verified</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium">Users Dashboard</span>
                  </div>
                  <Badge variant="secondary">{statistics.totalReports} total</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="font-medium">Volunteers Dashboard</span>
                  </div>
                  <Badge variant="secondary">{statistics.pendingReports} tasks</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Social Analytics Summary */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Social Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="font-medium">Social Posts Tracked</span>
                  </div>
                  <Badge variant="secondary">{socialPosts?.length || 0}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium">Verified Posts</span>
                  </div>
                  <Badge variant="secondary">{socialPosts?.filter(p => p.verified).length || 0}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Link className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">Linked to Reports</span>
                  </div>
                  <Badge variant="secondary">{socialPosts?.filter(p => p.linked_report).length || 0}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hotspots" className="space-y-4">
          <Card className="transition-all hover:shadow-md">
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
                    <div key={hotspot.location} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{hotspot.location}</p>
                          <p className="text-sm text-muted-foreground">{hotspot.count} reports</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(hotspot.count / Math.max(...topHotspots.map(h => h.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{hotspot.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No location data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Recent High Priority Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentHighAlerts.length > 0 ? (
                <div className="space-y-4">
                  {recentHighAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100/50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="space-y-2">
                          <p className="font-medium text-red-800 capitalize text-base">
                            {alert.visual_tag?.replace('_', ' ') || 'Unknown hazard'}
                          </p>
                          <p className="text-sm text-red-600">{alert.address || 'Location not specified'}</p>
                          <p className="text-xs text-red-500">
                            {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'Date not available'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className={`rounded-full px-3 py-1 text-sm font-medium ${
                            (alert.trust_score || 0) >= 71 ? 'trust-score-high' :
                            (alert.trust_score || 0) >= 41 ? 'trust-score-medium' : 'trust-score-low'
                          }`}>
                            {(alert.trust_score || 0)}%
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            HIGH PRIORITY
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-red-700 mt-3">
                        {alert.description || 'No description available'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No high priority alerts at this time</p>
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