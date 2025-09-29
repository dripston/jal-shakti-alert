import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import localforage from 'localforage';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { uploadReport, getReports, saveReport } from '../services/api';
// Mock data imports removed - using real SIH pipeline only

const ReportsContext = createContext();

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};

export const ReportsProvider = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [reports, setReports] = useState([]);
  const [socialPosts, setSocialPosts] = useState([]);
  const [queuedReports, setQueuedReports] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    radius: 'all',
    trustScore: 'all',
    alertLevel: 'all'
  });

  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Notify user they're back online if there are queued reports
      if (queuedReports.length > 0 && addNotification) {
        addNotification({
          title: 'Back Online!',
          message: `Automatically submitting ${queuedReports.length} queued report${queuedReports.length > 1 ? 's' : ''}...`,
          type: 'info'
        });
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      if (addNotification) {
        addNotification({
          title: 'You\'re Offline',
          message: 'New reports will be queued and submitted when you reconnect.',
          type: 'warning'
        });
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queuedReports.length, addNotification]);

  // Process queued reports when coming online
  useEffect(() => {
    if (isOnline && queuedReports.length > 0) {
      // Delay the sync to avoid setState during render
      const timer = setTimeout(() => {
        syncQueuedReports();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queuedReports]);

  // Initialize data
  useEffect(() => {
    initializeData();
  }, []);

  // Periodically refresh reports from database when online
  useEffect(() => {
    if (!isOnline) return;

    const refreshReports = async () => {
      try {
        console.log('Refreshing reports from database...');
        const databaseReports = await getReports();
        console.log(`Database returned ${databaseReports.length} reports`);
        
        setReports(prev => {
          // Always merge, even if database is empty (to show latest state)
          const merged = [...databaseReports];
          prev.forEach(existingReport => {
            if (!merged.find(dbReport => dbReport.id === existingReport.id)) {
              // Only add local reports that aren't in database
              merged.push(existingReport);
            }
          });
          
          // Sort by timestamp (newest first)
          merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          console.log(`Total reports after merge: ${merged.length}`);
          return merged;
        });
        
      } catch (error) {
        console.error('Failed to refresh reports:', error);
      }
    };

    // Refresh immediately when coming online
    refreshReports();

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(refreshReports, 30000);

    return () => clearInterval(interval);
  }, [isOnline]);

  const initializeData = async () => {
    try {
      setIsLoading(true);
      
      // First, try to fetch reports from the database
      let databaseReports = [];
      if (isOnline) {
        try {
          databaseReports = await getReports();
          console.log(`Loaded ${databaseReports.length} reports from database`);
        } catch (error) {
          console.error('Failed to fetch reports from database:', error);
        }
      }
      
      // Load cached data from previous sessions  
      const cachedReports = await localforage.getItem('oceanwatch_reports') || [];
      const cachedSocial = await localforage.getItem('oceanwatch_social') || [];
      const queued = await localforage.getItem('oceanwatch_queued_reports') || [];
      
      // Validate data structure before setting state
      const validCachedReports = Array.isArray(cachedReports) ? cachedReports : [];
      const validSocial = Array.isArray(cachedSocial) ? cachedSocial : [];
      const validQueued = Array.isArray(queued) ? queued : [];
      
      // Merge database reports with cached reports (database takes priority)
      const mergedReports = [...databaseReports];
      
      // Add any cached reports that aren't in the database
      validCachedReports.forEach(cachedReport => {
        if (!mergedReports.find(dbReport => dbReport.id === cachedReport.id)) {
          mergedReports.push(cachedReport);
        }
      });
      
      // Sort by timestamp (newest first)
      mergedReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Set state
      setReports(mergedReports);
      setSocialPosts(validSocial);
      setQueuedReports(validQueued);
      
      // Cache the merged reports
      try {
        await localforage.setItem('oceanwatch_reports', mergedReports);
      } catch (cacheError) {
        console.warn('Failed to cache merged reports:', cacheError);
      }
      
    } catch (error) {
      console.error('Failed to initialize data:', error);
      // Clear potentially corrupted storage and start fresh
      try {
        await localforage.clear();
      } catch (clearError) {
        console.error('Failed to clear corrupted storage:', clearError);
      }
      // Start with empty arrays on error
      setReports([]);
      setSocialPosts([]);
      setQueuedReports([]);
    } finally {
      setIsLoading(false);
    }
  };



  const syncQueuedReports = useCallback(async () => {
    if (queuedReports.length === 0) return;

    setIsLoading(true);
    
    // Notify user about sync starting
    if (addNotification && queuedReports.length > 0) {
      addNotification({
        title: 'Syncing Reports',
        message: `Submitting ${queuedReports.length} queued report${queuedReports.length > 1 ? 's' : ''}...`,
        type: 'info'
      });
    }
    
    try {
      for (const report of queuedReports) {
        try {
          
          // Send data to backend API
          const result = await uploadReport(report.image, {
            coords: report.coords,
            timestamp: report.timestamp ? new Date(report.timestamp).getTime() : Date.now()
          });
          
          // Update report with actual data from API
          const hasValidData = result.visual_summary || result.trust_evaluation || result.reports;
          const updatedReport = {
            ...report,
            status: hasValidData ? 'processed' : 'error',
            progress: 100,
            processingStep: 5,
            trustScore: result.trust_evaluation?.score || result.trustScore || 0,
            location: result.location || result.address || 'Unknown location',
            address: result.location || result.address || 'Unknown location',
            visualSummary: result.visual_summary || result.visualSummary || 'No visual summary available',
            weatherSummary: result.weather_summary || result.weatherSummary || 'No weather data available',
            authorityReport: result.reports?.authority_report || result.authorityReport || 'No authority report available',
            publicAlert: result.reports?.public_alert || result.publicAlert || 'No public alert available',
            volunteerGuidance: result.reports?.volunteer_guidance || result.volunteerGuidance || 'No volunteer guidance available',
            coords: result.coordinates || result.coords || report.coords,
            pipelineStatus: result.status || (hasValidData ? 'PROCESSED' : 'UNKNOWN')
          };
          
          // Update reports list
          setReports(prev => prev.map(r => 
            r.id === report.id ? updatedReport : r
          ));
          
          // Save to database for sharing across users
          try {
            await saveReport(updatedReport);
            console.log(`Synced report ${updatedReport.id} saved to database`);
          } catch (saveError) {
            console.error('Failed to save synced report to database:', saveError);
          }
          
          // Add notification
          if (addNotification) {
            const trustScore = result.trust_evaluation?.score || 0;
            addNotification({
              title: 'Trust Score Ready',
              message: `Report processed with trust score: ${trustScore}%`,
              type: trustScore >= 50 ? 'success' : 'error'
            });
          }
        } catch (error) {
          console.error(`Failed to sync report ${report.id}:`, error);
          // Keep in queue for next attempt
        }
      }

      // Clear successfully synced reports from queue
      const syncedCount = queuedReports.length;
      setQueuedReports([]);
      await localforage.setItem('oceanwatch_queued_reports', []);
      
      // Notify user about successful sync
      if (addNotification && syncedCount > 0) {
        addNotification({
          title: 'Reports Synced',
          message: `Successfully submitted ${syncedCount} report${syncedCount > 1 ? 's' : ''}!`,
          type: 'success'
        });
      }
      
      // Update cached reports with error handling
      try {
        await localforage.setItem('oceanwatch_reports', reports);
      } catch (storageError) {
        console.warn('Failed to cache reports:', storageError);
        // Try to store without images if blob storage fails
        const reportsWithoutImages = reports.map(r => ({
          ...r,
          image: r.image ? '[Image data removed for storage]' : r.image
        }));
        try {
          await localforage.setItem('oceanwatch_reports', reportsWithoutImages);
        } catch (fallbackError) {
          console.error('Failed to cache reports even without images:', fallbackError);
        }
      }
      
    } catch (error) {
      console.error('Sync failed:', error);
      if (addNotification) {
        addNotification({
          title: 'Sync Failed',
          message: 'Some reports could not be submitted. They will retry later.',
          type: 'error'
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [queuedReports, reports, addNotification]);

  // Real-time progress updates only for legitimate API processing
  // Progress simulation removed - only real API responses update status

  const createReport = useCallback(async (reportData) => {
    if (!user) throw new Error('User must be authenticated');

    const newReport = {
      id: `r_${Date.now()}`,
      userId: user.id,
      ...reportData, // This includes the image
      timestamp: new Date().toISOString(),
      status: isOnline ? 'pending' : 'queued',
      progress: 0,
      processingStep: 0, // 0: not started, 1: uploaded, 2: visual summary, 3: weather data, 4: trust evaluation, 5: reports generated
      trustScore: null,
      location: reportData.address || null, // Use address from reportData if available
      visualSummary: null,
      weatherSummary: null,
      authorityReport: null,
      publicAlert: null,
      volunteerGuidance: null,
      likes: 0,
      comments: 0,
      shares: 0
    };

    // Add to reports immediately for UI
    setReports(prev => [newReport, ...prev]);
    
    // If offline, queue the report
    if (!isOnline) {
      setQueuedReports(prev => [...prev, newReport]);
      // Add notification about queuing
      if (addNotification) {
        addNotification({
          title: 'Report Queued',
          message: 'Report will be submitted when you are back online',
          type: 'info'
        });
      }
      return newReport;
    }

    // Set to processing immediately
    setReports(prev => prev.map(report => 
      report.id === newReport.id 
        ? { ...report, status: 'processing', progress: 20 }
        : report
    ));
    
    try {
      console.log('Sending report to SIH pipeline...', {
        coords: reportData.coords,
        hasImage: !!reportData.image
      });
      
      // Send data to backend API
      const result = await uploadReport(reportData.image, {
        coords: reportData.coords || reportData.gps?.coords,
        timestamp: Date.now()
      });
      
      console.log('SIH Pipeline Response:', result);
      

      
      // Handle different response statuses from SIH pipeline
      let updatedReport;
      
      if (result.status === 'PROCESSED') {
        // Successful processing - use exact data from pipeline
        updatedReport = {
          ...newReport,
          status: 'processed',
          progress: 100,
          processingStep: 5,
          trustScore: result.trust_evaluation?.score || 0,
          trust_score: result.trust_evaluation?.score || 0,
          location: result.location,
          address: result.location,
          visualSummary: result.visual_summary,
          weatherSummary: result.weather_summary,
          authorityReport: result.reports?.authority_report,
          publicAlert: result.reports?.public_alert,
          volunteerGuidance: result.reports?.volunteer_guidance,
          coords: result.coordinates || reportData.coords || reportData.gps?.coords,
          pipelineStatus: 'PROCESSED',
          trustReasoning: result.trust_evaluation?.reasoning,
          image: reportData.image
        };
      } else if (result.status === 'REJECTED') {
        // Rejected by pipeline
        updatedReport = {
          ...newReport,
          status: 'rejected',
          progress: 100,
          processingStep: 5,
          trustScore: 0,
          trust_score: 0,
          location: reportData.address || 'Unknown location',
          address: reportData.address || 'Unknown location',
          visualSummary: result.visual_summary,
          weatherSummary: null,
          authorityReport: null,
          publicAlert: null,
          volunteerGuidance: null,
          coords: newReport.coords,
          pipelineStatus: 'REJECTED',
          rejectionReason: result.reason,
          weatherEmergencyRelated: result.weather_emergency_related,
          screenCaptureDetected: result.screen_capture_detected,
          // Keep the original image
          image: reportData.image
        };
      } else if (result.status === 'ERROR') {
        // Pipeline error
        updatedReport = {
          ...newReport,
          status: 'error',
          progress: 100,
          processingStep: 5,
          trustScore: 0,
          trust_score: 0,
          location: reportData.address || 'Unknown location',
          address: reportData.address || 'Unknown location',
          visualSummary: null,
          weatherSummary: null,
          authorityReport: null,
          publicAlert: null,
          volunteerGuidance: null,
          coords: newReport.coords,
          pipelineStatus: 'ERROR',
          errorMessage: result.message,
          // Keep the original image
          image: reportData.image
        };
      } else {
        // Fallback - assume it's processed if we have data
        const hasValidData = result.visual_summary || result.trust_evaluation || result.reports;
        
        updatedReport = {
          ...newReport,
          status: hasValidData ? 'processed' : 'error',
          progress: 100,
          processingStep: 5,
          trustScore: result.trust_evaluation?.score || 0,
          trust_score: result.trust_evaluation?.score || 0,
          location: result.location,
          address: result.location,
          visualSummary: result.visual_summary,
          weatherSummary: result.weather_summary,
          authorityReport: result.reports?.authority_report,
          publicAlert: result.reports?.public_alert,
          volunteerGuidance: result.reports?.volunteer_guidance,
          coords: result.coordinates || newReport.coords,
          pipelineStatus: hasValidData ? 'PROCESSED' : 'UNKNOWN',
          trustReasoning: result.trust_evaluation?.reasoning,
          image: reportData.image
        };
      }
      
      // Update report with final results (with a small delay to ensure it overrides progress simulation)
      setTimeout(() => {
        console.log('Updating report with final results:', updatedReport.id, updatedReport.status);
        setReports(prev => {
          const updated = prev.map(report => 
            report.id === newReport.id ? updatedReport : report
          );
          console.log('Reports after update:', updated.map(r => ({ id: r.id, status: r.status, progress: r.progress })));
          return updated;
        });
      }, 100);
      
      // Save to database for sharing across users
      try {
        await saveReport(updatedReport);
        console.log(`Report ${updatedReport.id} saved to database`);
      } catch (saveError) {
        console.error('Failed to save report to database:', saveError);
        // Continue anyway - report is still available locally
      }
      
      // Add notification based on pipeline status
      if (addNotification) {
        if (result.status === 'PROCESSED') {
          const trustScore = result.trust_evaluation?.score || 0;
          addNotification({
            title: 'Report Processed',
            message: `Report processed successfully with trust score: ${trustScore}%`,
            type: trustScore >= 50 ? 'success' : 'warning'
          });
        } else if (result.status === 'REJECTED') {
          addNotification({
            title: 'Report Rejected',
            message: result.reason || 'Report did not meet processing criteria',
            type: 'error'
          });
        } else if (result.status === 'ERROR') {
          addNotification({
            title: 'Processing Error',
            message: result.message || 'Failed to process report',
            type: 'error'
          });
        }
      }
      
      return updatedReport;
    } catch (error) {
      console.error('Error processing report:', error);
      

      
      // Update report to show error state
      const errorReport = {
        ...newReport,
        status: 'error',
        progress: 100,
        processingStep: 5,
        trustScore: 0,
        trust_score: 0,
        location: reportData.address || 'Unknown location',
        address: reportData.address || 'Unknown location',
        visualSummary: null,
        weatherSummary: null,
        authorityReport: null,
        publicAlert: null,
        volunteerGuidance: null,
        coords: newReport.coords,
        pipelineStatus: 'ERROR',
        errorMessage: error.message,
        // Keep the original image
        image: reportData.image
      };
      
      // Update report with error state (with a small delay to ensure it overrides progress simulation)
      setTimeout(() => {
        setReports(prev => prev.map(report => 
          report.id === newReport.id ? errorReport : report
        ));
      }, 100);
      
      // Save error report to database too
      try {
        await saveReport(errorReport);
        console.log(`Error report ${errorReport.id} saved to database`);
      } catch (saveError) {
        console.error('Failed to save error report to database:', saveError);
      }
      
      // Add notification about error
      if (addNotification) {
        addNotification({
          title: 'Connection Error',
          message: 'Failed to process report. Please check your connection.',
          type: 'error'
        });
      }
      return errorReport;
    }
  }, [user, isOnline, addNotification]);



  const likeReport = async (reportId) => {
    const updatedReports = reports.map(report => 
      report.id === reportId 
        ? { ...report, likes: (report.likes || 0) + 1 }
        : report
    );
    
    setReports(updatedReports);
    
    // Try to cache the updated reports
    try {
      await localforage.setItem('oceanwatch_reports', updatedReports);
    } catch (error) {
      console.warn('Failed to cache liked report:', error);
      // Continue without caching - the like is still applied in memory
    }
  };

  const getFilteredReports = () => {
    return reports.filter(report => {
      // Date filter
      if (filters.dateRange !== 'all') {
        const reportDate = new Date(report.timestamp);
        const now = new Date();
        const daysDiff = (now - reportDate) / (1000 * 60 * 60 * 24);
        
        switch (filters.dateRange) {
          case '1d':
            if (daysDiff > 1) return false;
            break;
          case '7d':
            if (daysDiff > 7) return false;
            break;
          case '30d':
            if (daysDiff > 30) return false;
            break;
        }
      }

      // Trust score filter
      if (filters.trustScore !== 'all') {
        switch (filters.trustScore) {
          case 'high':
            if (report.trust_score < 71) return false;
            break;
          case 'medium':
            if (report.trust_score < 41 || report.trust_score > 70) return false;
            break;
          case 'low':
            if (report.trust_score > 40) return false;
            break;
        }
      }

      // Alert level filter
      if (filters.alertLevel !== 'all' && report.alert_level !== filters.alertLevel) {
        return false;
      }

      return true;
    });
  };

  const exportReports = (format = 'json') => {
    const dataToExport = {
      reports: getFilteredReports(),
      exported_at: new Date().toISOString(),
      filters: filters
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oceanwatch_reports_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const refreshFromDatabase = useCallback(async () => {
    try {
      console.log('Manual refresh triggered...');
      const databaseReports = await getReports();
      console.log(`Manual refresh: Database returned ${databaseReports.length} reports`);
      
      setReports(databaseReports);
      
      if (addNotification) {
        addNotification({
          title: 'Reports Refreshed',
          message: `Loaded ${databaseReports.length} reports from database`,
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Manual refresh failed:', error);
      if (addNotification) {
        addNotification({
          title: 'Refresh Failed',
          message: 'Could not refresh reports from database',
          type: 'error'
        });
      }
    }
  }, [addNotification]);

  const value = {
    reports: getFilteredReports(),
    socialPosts,
    queuedReports,
    isOnline,
    isLoading,
    filters,
    setFilters,
    createReport,
    syncQueuedReports,
    likeReport,
    exportReports,
    refreshFromDatabase,
    allReports: reports // Unfiltered reports
  };

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
};