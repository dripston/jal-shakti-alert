import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useReports } from '../../contexts/ReportsContext';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Users,
  FileText,
  TrendingUp,
  Download,
  Eye
} from 'lucide-react';
import PostCard from '../../components/PostCard';

const AuthoritiesDashboard = () => {
  const { allReports, exportReports } = useReports();
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filter reports based on selections
  const filteredReports = allReports.filter(report => {
    if (selectedPriority !== 'all' && report.alert_level !== selectedPriority) return false;
    if (selectedStatus !== 'all' && report.status !== selectedStatus) return false;
    return true;
  });

  // Sort by priority and timestamp
  const sortedReports = [...filteredReports].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.alert_level] || 0;
    const bPriority = priorityOrder[b.alert_level] || 0;
    
    if (aPriority !== bPriority) return bPriority - aPriority;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  // Statistics
  const highPriorityReports = allReports.filter(r => r.alert_level === 'high').length;
  const pendingVerification = allReports.filter(r => r.status === 'queued').length;
  const verifiedToday = allReports.filter(r => {
    const today = new Date().toDateString();
    return r.status === 'verified' && new Date(r.timestamp).toDateString() === today;
  }).length;
  const totalVerified = allReports.filter(r => r.status === 'verified').length;

  const handleVerifyReport = (reportId) => {
    // In real app, this would make API call to verify report
    console.log('Verifying report:', reportId);
  };

  const handleRejectReport = (reportId) => {
    // In real app, this would make API call to reject report
    console.log('Rejecting report:', reportId);
  };

  const handleAssignTask = (reportId) => {
    // In real app, this would assign task to volunteers
    console.log('Assigning task for report:', reportId);
  };

  return (
    <div className="container-mobile py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold">Authorities Dashboard</h1>
            <p className="text-sm text-muted-foreground">Verify reports and coordinate response actions</p>
          </div>
        </div>
        
        <Button variant="outline" size="sm" onClick={() => exportReports('json')}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{highPriorityReports}</p>
                <p className="text-xs text-red-600">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{pendingVerification}</p>
                <p className="text-xs text-yellow-600">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{verifiedToday}</p>
                <p className="text-xs text-green-600">Verified Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalVerified}</p>
                <p className="text-xs text-blue-600">Total Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="queued">Pending Review</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {sortedReports.length} reports</span>
            <Badge variant="secondary">
              {highPriorityReports} require immediate attention
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        <h2 className="text-lg font-heading font-semibold">Reports for Review</h2>
        
        {sortedReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-medium mb-2">All caught up!</h3>
              <p className="text-sm text-muted-foreground">
                No reports match your current filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedReports.map((report) => (
            <Card key={report.id} className={`${
              report.alert_level === 'high' ? 'border-red-300 bg-red-50/50' : 
              report.status === 'queued' ? 'border-yellow-300 bg-yellow-50/50' : ''
            }`}>
              <CardContent className="p-4">
                <PostCard 
                  report={report}
                  onViewOnMap={(report) => {
                    localStorage.setItem('selectedReport', JSON.stringify(report));
                    window.location.href = '/map';
                  }}
                />
                
                {/* Authority Actions */}
                <div className="mt-4 pt-4 border-t bg-muted/20 -mx-4 px-4 -mb-4 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {report.status === 'queued' && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleVerifyReport(report.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify Report
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleRejectReport(report.id)}
                        >
                          Reject Report
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAssignTask(report.id)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Assign Task
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Dispatch Team
                    </Button>
                  </div>
                  
                  {/* Authority Notes */}
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-600 font-medium mb-1">
                      Authority Assessment
                    </div>
                    <div className="space-y-1 text-xs text-blue-700">
                      <div>AI Analysis: {report.agents?.visual_summary}</div>
                      <div>Weather Context: {report.agents?.weather_check?.status}</div>
                      <div>Risk Level: {report.alert_level.toUpperCase()}</div>
                      {report.status === 'verified' && (
                        <div className="text-green-700 font-medium">✓ Verified by authorities</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Load More */}
      {sortedReports.length > 0 && sortedReports.length >= 10 && (
        <div className="text-center">
          <Button variant="outline">Load More Reports</Button>
        </div>
      )}
    </div>
  );
};

export default AuthoritiesDashboard;
