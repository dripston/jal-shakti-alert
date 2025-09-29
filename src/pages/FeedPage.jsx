import React, { useState } from 'react';
import { useReports } from '../contexts/ReportsContext';
import ReportFormModal from '../components/ReportFormModal';
import ReportProgress from '../components/ReportProgress';
import SocialPost from '../components/SocialPost';
import { Camera } from 'lucide-react';

const FeedPage = () => {
  const { reports, isLoading, queuedReports, isOnline, refreshFromDatabase } = useReports();
  const [showReportModal, setShowReportModal] = useState(false);
  


  const handleReportSubmit = () => {
    setShowReportModal(false);
  };

  // Separate pending and completed reports (processed, rejected, error)
  const pendingReports = reports.filter(report => report.status === 'pending');
  const completedReports = reports.filter(report => 
    report.status === 'processed' || report.status === 'rejected' || report.status === 'error'
  );

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Mobile Header */}
      <div className="lg:hidden bg-primary text-primary-foreground p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold ornate-header">Pragyan Chakra</h1>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-primary rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Camera className="h-4 w-4" />
            <span>Report</span>
          </button>
        </div>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Feed</h1>
            <p className="text-gray-600">Latest water safety reports from the community</p>
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Camera className="h-5 w-5" />
            <span>Create Report</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Water Status Header */}
      <div className="lg:hidden bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-card-foreground">Community Reports</h2>
            {/* Sync indicator */}
            {isLoading && (
              <div className="flex items-center space-x-2 text-xs text-blue-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                <span>Syncing...</span>
              </div>
            )}
            {!isOnline && queuedReports.length > 0 && (
              <div className="flex items-center space-x-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                <span>📡</span>
                <span>{queuedReports.length} queued</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={refreshFromDatabase}
              className="flex items-center space-x-1 text-muted-foreground hover:text-foreground text-sm"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
            <button className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
              <span className="text-sm">Filters</span>
            </button>
          </div>
        </div>
        
        {/* Social feed info */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <span>💧 Community updates and water safety reports</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            Live Feed
          </span>
        </div>
      </div>
      
      {/* Desktop Status Bar */}
      <div className="hidden lg:block bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌊</span>
              <div>
                <p className="font-medium text-gray-900">Water Status</p>
                <p className="text-sm text-gray-600">Live community updates</p>
              </div>
            </div>
            
            {/* Status indicators */}
            {isLoading && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b border-blue-600"></div>
                <span className="text-sm">Syncing reports...</span>
              </div>
            )}
            {!isOnline && queuedReports.length > 0 && (
              <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-full">
                <span>📡</span>
                <span className="text-sm font-medium">{queuedReports.length} reports queued</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={refreshFromDatabase}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>🔄</span>
              <span className="text-sm">Refresh</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <span>🔍</span>
              <span className="text-sm">Filters</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="p-4 lg:p-0">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Water Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Reports</span>
                  <span className="font-medium">{reports.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Processing</span>
                  <span className="font-medium text-orange-600">{pendingReports.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-medium text-green-600">{completedReports.length}</span>
                </div>
                {!isOnline && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Queued</span>
                    <span className="font-medium text-orange-600">{queuedReports.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Main Feed */}
          <div className="lg:col-span-6">
            {/* Pending reports */}
            {pendingReports.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Processing Reports</h3>
                <div className="space-y-4">
                  {pendingReports.map(report => 
                    <ReportProgress key={report.id} report={report} />
                  )}
                </div>
              </div>
            )}
            
            {/* Completed reports */}
            <div>
              {completedReports.length > 0 && (
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Reports</h3>
              )}
              {completedReports.length === 0 && pendingReports.length === 0 && (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
                  <p className="text-gray-600 mb-6">Be the first to report a water hazard in your area!</p>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Report
                  </button>
                </div>
              )}
              <div className="space-y-6">
                {completedReports.map(report => 
                  <SocialPost key={report.id} report={report} />
                )}
              </div>
            </div>
          </div>
          
          {/* Right Sidebar - Quick Actions */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="w-full flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <span className="text-sm font-medium">Report Hazard</span>
                </button>
                <button
                  onClick={refreshFromDatabase}
                  className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span>🔄</span>
                  <span className="text-sm font-medium">Refresh Feed</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <span>🗺️</span>
                  <span className="text-sm font-medium">View Map</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-4">
          {/* Pending reports (in progress) */}
          {pendingReports.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Processing Reports</h3>
              <div className="space-y-4">
                {pendingReports.map(report => 
                  <ReportProgress key={report.id} report={report} />
                )}
              </div>
            </div>
          )}
          
          {/* Processed reports */}
          <div>
            {completedReports.length > 0 && (
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Reports</h3>
            )}
            {completedReports.length === 0 && pendingReports.length === 0 && (
              <div className="text-center py-12 bg-card rounded-lg border">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No reports yet. Be the first to report a hazard!</p>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Report Water Hazard
                </button>
              </div>
            )}
            <div className="space-y-4">
              {completedReports.map(report => 
                <SocialPost key={report.id} report={report} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportFormModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
};

export default FeedPage;