import React, { useState } from 'react';
import { useReports } from '../contexts/ReportsContext';
import ReportFormModal from '../components/ReportFormModal';
import ReportProgress from '../components/ReportProgress';
import ProcessedReport from '../components/ProcessedReport';
import { Camera } from 'lucide-react';

const FeedPage = () => {
  const { reports } = useReports();
  const [showReportModal, setShowReportModal] = useState(false);

  const handleReportSubmit = () => {
    setShowReportModal(false);
  };

  // Separate pending and processed reports
  const pendingReports = reports.filter(report => report.status === 'pending');
  const processedReports = reports.filter(report => report.status === 'processed');

  return (
    <div className="container-mobile min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold ornate-header">OceanWatch</h1>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-primary rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Camera className="h-4 w-4" />
            <span>Report</span>
          </button>
        </div>
      </div>
      
      {/* Ocean Status Header */}
      <div className="bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">Ocean Status Today</h2>
          <button className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
            <span className="text-sm">Filters</span>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="p-4 space-y-4">
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
          {processedReports.length > 0 && (
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Reports</h3>
          )}
          {processedReports.length === 0 && (
            <div className="text-center py-12 bg-card rounded-lg border">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No reports yet. Be the first to report a hazard!</p>
              <button
                onClick={() => setShowReportModal(true)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Report Ocean Hazard
              </button>
            </div>
          )}
          <div className="space-y-4">
            {processedReports.map(report => 
              <ProcessedReport key={report.id} report={report} />
            )}
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