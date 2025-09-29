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

  // Filter reports for authorities - show processed reports that need review/action
  const filteredReports = allReports.filter(report => {
    // Safety check - skip if report is undefined
    if (!report) return false;
    // Only show processed reports with sufficient trust score for authorities
    if (report.status !== 'processed') return false;
    
    // Apply priority filter
    if (selectedPriority !== 'all' && report.alert_level !== selectedPriority) {
      return false;
    }
    
    // Apply status filter
    if (selectedStatus !== 'all' && report.status !== selectedStatus) {
      return false;
    }
    
    return true;
  });

  // Separate reports by verification status
  const nonRejectedReports = filteredReports.filter(r => r && r.status !== 'rejected');
  const verifiedReports = nonRejectedReports.filter(r => r && r.status === 'processed');
  
  // Calculate statistics
  const stats = {
    totalReports: nonRejectedReports.length,
    verified: verifiedReports.length,
    pending: nonRejectedReports.filter(r => r && r.status === 'pending').length,
    highPriority: nonRejectedReports.filter(r => r && r.alert_level === 'high').length
  };

  // Calculate today's reports
  const todayReports = nonRejectedReports.filter(r => {
    if (!r || !r.timestamp) return false;
    const reportDate = new Date(r.timestamp).toDateString();
    const today = new Date().toDateString();
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

  // Function to clean visual summary (remove asterisks and format properly)
  const cleanVisualSummary = (summary) => {
    if (!summary) return '';
    
    // Remove markdown asterisks and formatting
    return summary
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
      .replace(/\*/g, '')              // Remove any remaining asterisks
      .trim();
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
            <p className="text-xs text-muted-foreground">Monitor and respond to reports</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalReports}</p>
                <p className="text-xs text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">{stats.verified}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-red-500">{stats.highPriority}</p>
                <p className="text-xs text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-yellow-500">{todayReports}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 px-4">
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
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="processed">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" onClick={() => exportReports('json')} className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Reports List */}
      <div className="space-y-4 px-4 pb-20 lg:pb-6">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No reports found</h3>
            <p className="text-muted-foreground">Adjust your filters or check back later</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            // Safety check
            if (!report) return null;
            
            const isExpanded = expandedReports[report.id];
            const actualTrustScore = report.trustScore || report.trust_score || 0;
            
            // Truncate report for preview
            const shortReport = report.authorityReport 
              ? report.authorityReport.substring(0, 150) + (report.authorityReport.length > 150 ? '...' : '')
              : 'No authority report available';
            const isLongReport = report.authorityReport && report.authorityReport.length > 150;
            
            return (
              <div key={report.id} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {report.visual_tag?.replace(/_/g, ' ') || 'Water Hazard Report'}
                        </h3>
                        <Badge 
                          variant={
                            report.alert_level === 'high' ? 'destructive' : 
                            report.alert_level === 'medium' ? 'secondary' : 'default'
                          }
                        >
                          {report.alert_level || 'medium'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{report.address || 'Location not specified'}</span>
                      </div>
                      
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>Trust: {actualTrustScore}%</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(report.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setExpandedReports(prev => ({
                        ...prev,
                        [report.id]: !isExpanded
                      }))}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Preview of Authority Report */}
                  {(() => {
                    if (!isExpanded) {
                      return (
                        <div className="mt-3 text-sm text-gray-600">
                          {shortReport}
                          {isLongReport && (
                            <button 
                              onClick={() => setExpandedReports(prev => ({
                                ...prev,
                                [report.id]: true
                              }))}
                              className="text-blue-600 hover:text-blue-800 underline ml-1"
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Visual Analysis for Authorities */}
                  {report.visualSummary && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                      <h4 className="text-base font-medium text-gray-900 mb-2">Visual Analysis</h4>
                      <div className="text-base text-gray-700">
                        {cleanVisualSummary(report.visualSummary)}
                      </div>
                    </div>
                  )}

                  {/* Weather Context */}
                  {report.weatherSummary && !expandedReports[report.id] && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                      <h4 className="text-base font-medium text-green-900 mb-2">Weather Context</h4>
                      <div className="text-base text-green-800">
                        {cleanVisualSummary(report.weatherSummary)}
                      </div>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expandedReports[report.id] && (
                    <div className="space-y-3 border-t pt-3 mt-3">
                      {report.trustReasoning && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-yellow-900 mb-2">Trust Evaluation</h4>
                          <div className="text-sm text-yellow-800">
                            {cleanVisualSummary(report.trustReasoning)}
                          </div>
                        </div>
                      )}
                      
                      {report.authorityReport && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-red-900 mb-2">Authority Assessment</h4>
                          <div className="text-sm text-red-800 whitespace-pre-line">
                            {cleanVisualSummary(report.authorityReport)}
                          </div>
                        </div>
                      )}
                      
                      {report.publicAlert && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">Public Communication</h4>
                          <div className="text-sm text-blue-800">
                            {cleanVisualSummary(report.publicAlert)}
                          </div>
                        </div>
                      )}
                      
                      {report.volunteerGuidance && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-purple-900 mb-2">Volunteer Guidance</h4>
                          <div className="text-sm text-purple-800">
                            {cleanVisualSummary(report.volunteerGuidance)}
                          </div>
                        </div>
                      )}
                      
                      {report.weatherSummary && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-green-900 mb-2">Weather Analysis</h4>
                          <div className="text-sm text-green-800">
                            {cleanVisualSummary(report.weatherSummary)}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button size="sm" variant="outline" className="text-green-700 border-green-300">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-700 border-red-300">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" variant="outline">
                          <Users className="h-4 w-4 mr-1" />
                          Assign Task
                        </Button>
                      </div>
                      
                      <button 
                        onClick={() => setExpandedReports(prev => ({
                          ...prev,
                          [report.id]: false
                        }))}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        View Less
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AuthoritiesDashboard;