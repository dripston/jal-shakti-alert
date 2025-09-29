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
  const pendingReports = reports.filter(report => report && report.status === 'pending');
  const completedReports = reports.filter(report => 
    report && (report.status === 'processed' || report.status === 'rejected' || report.status === 'error')
  );

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Mobile Header */}
      <div className="lg:hidden bg-primary text-primary-foreground p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold ornate-header">Pragyan Chakra</h1>
          <button
            onClick={() => setShowReportModal(true)}
            className="p-2 rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors"
          >
            <Camera className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Community Feed</h1>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Camera className="h-4 w-4" />
            <span>Report Hazard</span>
          </button>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        {/* Offline Banner */}
        {!isOnline && (
          <div className="offline-banner mb-4 rounded-lg">
            You are currently offline. Reports will be queued and submitted when you reconnect.
          </div>
        )}

        {/* Pending Reports with Progress */}
        {pendingReports.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Processing Reports</h2>
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <ReportProgress key={report.id} report={report} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Reports */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Reports</h2>
          {completedReports.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No reports yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to report a water hazard in your area</p>
              <button
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-4 w-4 mr-2" />
                Report Hazard
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {completedReports.map((report) => (
                <SocialPost key={report.id} report={report} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Form Modal */}
      <ReportFormModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
      />
    </div>
  );
};

export default FeedPage;