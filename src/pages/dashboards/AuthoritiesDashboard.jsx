import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

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

  Download,
  Eye
} from 'lucide-react';


const AuthoritiesDashboard = () => {
  const { allReports, exportReports } = useReports();
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedReports, setExpandedReports] = useState({});

  // Filter reports based on selections - exclude rejected reports
  const filteredReports = allReports.filter(report => {
    // Never show rejected reports in authorities dashboard
    if (report.status === 'rejected') return false;
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

  // Statistics (exclude rejected reports)
  const nonRejectedReports = allReports.filter(r => r.status !== 'rejected');
  const highPriorityReports = nonRejectedReports.filter(r => r.alert_level === 'high').length;
  const pendingVerification = nonRejectedReports.filter(r => r.status === 'pending' || r.status === 'processing').length;
  const approvedToday = nonRejectedReports.filter(r => {
    const today = new Date().toDateString();
    const reportDate = new Date(r.timestamp).toDateString();
    return reportDate === today && (r.status === 'processed' || r.status === 'approved');
  }).length;
  const totalApproved = nonRejectedReports.filter(r => r.status === 'processed' || r.status === 'approved').length;

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
    <div className="py-6 lg:py-0 space-y-6">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4">
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
      
      {/* Desktop Header */}
      <div className="hidden lg:block bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Authorities Dashboard</h1>
              <p className="text-gray-600">Verify reports and coordinate emergency response actions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => exportReports('json')}>
              <Download className="h-4 w-4 mr-2" />
              Export Reports
            </Button>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Assign Tasks
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-0">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 lg:pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" />
              <div>
                <p className="text-xl lg:text-2xl font-bold text-red-600">{highPriorityReports}</p>
                <p className="text-xs lg:text-sm text-red-600">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4 lg:pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-600" />
              <div>
                <p className="text-xl lg:text-2xl font-bold text-yellow-600">{pendingVerification}</p>
                <p className="text-xs lg:text-sm text-yellow-600">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4 lg:pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
              <div>
                <p className="text-xl lg:text-2xl font-bold text-green-600">{approvedToday}</p>
                <p className="text-xs lg:text-sm text-green-600">Approved Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4 lg:pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
              <div>
                <p className="text-xl lg:text-2xl font-bold text-blue-600">{totalApproved}</p>
                <p className="text-xs lg:text-sm text-blue-600">Total Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="px-4 lg:px-0">
        <Card>
          <CardContent className="pt-4 lg:pt-6">
            <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
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
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0 text-sm text-muted-foreground">
              <span>Showing {sortedReports.length} reports</span>
              <Badge variant="secondary">
                {highPriorityReports} require immediate attention
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div className="space-y-4 px-4 lg:px-0">
        <h2 className="text-lg lg:text-xl font-heading font-semibold">Reports for Review</h2>
        
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
                {/* Authority-specific report view */}
                <div className="space-y-3">
                  {/* Basic Report Info */}
                  <div className="flex items-start space-x-3">
                    {report.image && (
                      <img 
                        src={report.image} 
                        alt="Report" 
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant={
                          report.alert_level === 'high' ? 'destructive' : 
                          report.alert_level === 'medium' ? 'default' : 'secondary'
                        }>
                          {report.alert_level?.toUpperCase() || 'MEDIUM'}
                        </Badge>
                        <Badge variant={
                          report.status === 'processed' ? 'default' : 
                          report.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {report.pipelineStatus || report.status?.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{report.location || report.address}</span>
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{new Date(report.timestamp).toLocaleString()}</span>
                      </div>
                      {report.description && (
                        <p className="text-sm text-gray-700 mb-2">{report.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Authority Report Content */}
                  {report.authorityReport && (() => {
                    const getAuthorityName = (location) => {
                      const cityAuthorities = {
                        'Chennai': 'M.K. Stalin (Chief Minister)',
                        'Mumbai': 'Eknath Shinde (Chief Minister)', 
                        'Bangalore': 'Siddaramaiah (Chief Minister)',
                        'Delhi': 'Arvind Kejriwal (Chief Minister)',
                        'Kolkata': 'Mamata Banerjee (Chief Minister)',
                        'Hyderabad': 'A. Revanth Reddy (Chief Minister)',
                        'Pune': 'Eknath Shinde (Chief Minister)',
                        'Ahmedabad': 'Bhupendra Patel (Chief Minister)',
                        'Kochi': 'Pinarayi Vijayan (Chief Minister)',
                        'Visakhapatnam': 'Y.S. Jagan Mohan Reddy (Chief Minister)'
                      };
                      
                      const city = Object.keys(cityAuthorities).find(city => 
                        (location || '').toLowerCase().includes(city.toLowerCase())
                      );
                      return city ? cityAuthorities[city] : 'Regional Authority';
                    };

                    const showFullReport = expandedReports[report.id] || false;
                    const reportLines = report.authorityReport.split('\n').filter(line => line.trim());
                    const shortReport = reportLines.slice(0, 3).join('\n');
                    const isLongReport = reportLines.length > 3;

                    return (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-blue-900">Authority Assessment</h4>
                          <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                            {getAuthorityName(report.location || report.address)}
                          </span>
                        </div>
                        <div className="text-sm text-blue-800 space-y-1 whitespace-pre-line">
                          {showFullReport ? report.authorityReport : shortReport}
                          {isLongReport && (
                            <button 
                              onClick={() => setExpandedReports(prev => ({
                                ...prev,
                                [report.id]: !showFullReport
                              }))}
                              className="text-xs text-blue-600 hover:text-blue-800 underline mt-2"
                            >
                              {showFullReport ? 'Show less' : 'View full report'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Visual Analysis for Authorities */}
                  {report.visualSummary && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">🔍 Visual Analysis</h4>
                      <div className="text-sm text-gray-700 whitespace-pre-line">
                        {report.visualSummary}
                      </div>
                    </div>
                  )}

                  {/* Weather Context */}
                  {report.weatherSummary && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-green-900 mb-2">🌤️ Weather Context</h4>
                      <div className="text-sm text-green-800 whitespace-pre-line">
                        {report.weatherSummary}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Authority Actions */}
                <div className="mt-4 pt-4 border-t bg-muted/20 -mx-4 px-4 -mb-4 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {report.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleVerifyReport(report.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve Report
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
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => handleAssignTask(report.id)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Assign to Volunteers
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
                  
                  {/* Quick Summary */}
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-600 font-medium mb-1">Status Summary</div>
                    <div className="text-xs text-blue-700">
                      Risk Level: {(report.alert_level || 'medium').toUpperCase()}
                      {report.status === 'approved' && (
                        <span className="text-green-700 font-medium ml-2">• ✓ Approved</span>
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
