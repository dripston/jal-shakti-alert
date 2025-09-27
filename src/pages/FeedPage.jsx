import React, { useState } from 'react';
import React, { useState } from 'react';
import { Plus, Filter, RefreshCw, Camera } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useReports } from '../contexts/ReportsContext';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import ReportFormModal from '../components/ReportFormModal';
import FiltersPanel from '../components/FiltersPanel';

const FeedPage = () => {
  const { reports, isLoading, syncQueuedReports, queuedReports, isOnline } = useReports();
  const { user } = useAuth();
  const [showReportForm, setShowReportForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleSync = async () => {
    await syncQueuedReports();
  };

  return (
    <div className="container-mobile py-6 space-y-6">
      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-heading">Ocean Status Today</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </Button>
              {!isOnline && queuedReports.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Sync ({queuedReports.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{reports.length}</p>
              <p className="text-xs text-muted-foreground">Total Reports</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">
                {reports.filter(r => r.alert_level === 'high').length}
              </p>
              <p className="text-xs text-muted-foreground">High Alerts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'verified').length}
              </p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex space-x-3">
        <Button 
          onClick={() => setShowReportForm(true)}
          className="flex-1"
          size="lg"
        >
          <Camera className="h-4 w-4 mr-2" />
          Report Hazard
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/map'}
          size="lg"
        >
          View Map
        </Button>
      </div>

      {/* Welcome Message for New Users */}
      {user && user.reports_count === 0 && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h3 className="font-heading font-semibold text-primary">
                Welcome to OceanWatch, {user.name.split(' ')[0]}!
              </h3>
              <p className="text-sm text-muted-foreground">
                Help protect our oceans by reporting hazards you see. Your first report helps build trust in the community.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowReportForm(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Your First Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-semibold">Recent Reports</h2>
          <span className="text-sm text-muted-foreground">
            {reports.length} reports
          </span>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">Loading reports...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {reports.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-8">
              <div className="space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">No reports yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Be the first to report an ocean hazard in your area
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowReportForm(true)}
                >
                  Create First Report
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {reports.map((report) => (
          <PostCard 
            key={report.id} 
            report={report}
            onViewOnMap={(report) => {
              // Store selected report and navigate to map
              localStorage.setItem('selectedReport', JSON.stringify(report));
              window.location.href = '/map';
            }}
          />
        ))}
      </div>

      {/* Load More */}
      {reports.length > 0 && (
        <div className="text-center pt-4">
          <Button variant="outline" disabled>
            Load More Reports
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Showing {reports.length} of {reports.length} reports
          </p>
        </div>
      )}

      {/* Modals */}
      {showReportForm && (
        <ReportFormModal 
          isOpen={showReportForm}
          onClose={() => setShowReportForm(false)}
        />
      )}

      {showFilters && (
        <FiltersPanel 
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default FeedPage;
