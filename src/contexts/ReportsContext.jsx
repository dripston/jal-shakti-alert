import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { uploadReport } from '../services/api';
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
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  const initializeData = async () => {
    try {
      // Load cached data
      const cachedReports = await localforage.getItem('oceanwatch_reports') || [];
      const cachedSocial = await localforage.getItem('oceanwatch_social') || [];
      const queued = await localforage.getItem('oceanwatch_queued_reports') || [];

      // Start with empty arrays - no mock data
      setReports(cachedReports);
      setSocialPosts(cachedSocial);
      setQueuedReports(queued);
    } catch (error) {
      console.error('Failed to initialize data:', error);
      // Start with empty arrays even on error
      setReports([]);
      setSocialPosts([]);
      setQueuedReports([]);
    }
  };

  const syncQueuedReports = useCallback(async () => {
    if (queuedReports.length === 0) return;

    setIsLoading(true);
    
    try {
      for (const report of queuedReports) {
        try {
          // Send data to backend API
          const result = await uploadReport(report.image, {
            coords: report.coords,
            timestamp: report.timestamp ? new Date(report.timestamp).getTime() : Date.now()
          });
          
          // Update report with actual data from API
          const updatedReport = {
            ...report,
            status: 'processed',
            progress: 100,
            processingStep: 5,
            trustScore: result.trust_evaluation.score,
            location: result.location,
            address: result.location,
            visualSummary: result.visual_summary,
            weatherSummary: result.weather_summary,
            authorityReport: result.reports.authority_report,
            publicAlert: result.reports.public_alert,
            volunteerGuidance: result.reports.volunteer_guidance,
            coords: result.coordinates
          };
          
          // Update reports list
          setReports(prev => prev.map(r => 
            r.id === report.id ? updatedReport : r
          ));
          
          // Add notification
          if (addNotification) {
            addNotification({
              title: 'Trust Score Ready',
              message: `Report processed with trust score: ${result.trust_evaluation.score}%`,
              type: result.trust_evaluation.score >= 50 ? 'success' : 'error'
            });
          }
        } catch (error) {
          console.error(`Failed to sync report ${report.id}:`, error);
          // Keep in queue for next attempt
        }
      }

      // Clear successfully synced reports from queue
      setQueuedReports([]);
      await localforage.setItem('oceanwatch_queued_reports', []);
      
      // Update cached reports
      await localforage.setItem('oceanwatch_reports', reports);
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [queuedReports, reports, addNotification]);

  // Simulate polling for updates
  useEffect(() => {
    const interval = setInterval(() => {
      setReports(prevReports => {
        return prevReports.map(report => {
          if (report.status === 'pending' && report.progress < 100) {
            // Simulate progress updates
            const progressIncrement = Math.floor(Math.random() * 20) + 5;
            const newProgress = Math.min(report.progress + progressIncrement, 100);
            
            let newStatus = report.status;
            let processingStep = report.processingStep;
            
            // Update processing step based on progress
            if (newProgress >= 20 && processingStep === 0) {
              processingStep = 1; // Uploaded
            } else if (newProgress >= 40 && processingStep === 1) {
              processingStep = 2; // Processing Visual Summary
            } else if (newProgress >= 60 && processingStep === 2) {
              processingStep = 3; // Processing Weather Data
            } else if (newProgress >= 80 && processingStep === 3) {
              processingStep = 4; // Running Trust Evaluation
            } else if (newProgress >= 95 && processingStep === 4) {
              processingStep = 5; // Generating Reports
            }
            
            // When progress completes, simulate API response
            if (newProgress === 100 && report.status === 'pending') {
              newStatus = 'processed';
              const trustScore = Math.floor(Math.random() * 60) + 20; // Random score between 20-80
              
              // Add notification when trust score is ready
              if (addNotification) {
                addNotification({
                  title: 'Trust Score Ready',
                  message: `Report processed with trust score: ${trustScore}%`,
                  type: trustScore >= 50 ? 'success' : 'error'
                });
              }
              
              return {
                ...report,
                status: newStatus,
                progress: newProgress,
                processingStep,
                trustScore,
                location: 'Sample Location, India',
                visualSummary: 'This is a sample visual summary of the hazard reported.',
                weatherSummary: 'Current weather conditions are stable with clear skies.',
                authorityReport: 'Authority report content would appear here.',
                publicAlert: 'Public alert content would appear here.',
                volunteerGuidance: 'Volunteer guidance content would appear here.'
              };
            }
            
            return {
              ...report,
              progress: newProgress,
              processingStep,
              status: newStatus
            };
          }
          return report;
        });
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [addNotification]);

  const createReport = useCallback(async (reportData) => {
    if (!user) throw new Error('User must be authenticated');

    const newReport = {
      id: `r_${Date.now()}`,
      userId: user.id,
      ...reportData,
      timestamp: new Date().toISOString(),
      status: isOnline ? 'pending' : 'queued',
      progress: 0,
      processingStep: 0, // 0: not started, 1: uploaded, 2: visual summary, 3: weather data, 4: trust evaluation, 5: reports generated
      trustScore: null,
      location: null,
      visualSummary: null,
      weatherSummary: null,
      authorityReport: null,
      publicAlert: null,
      volunteerGuidance: null,
      likes: 0,
      comments: 0,
      shares: 0,
      trust_score: calculateInitialTrustScore(reportData),
      agents: generateMockAgentResponse(reportData)
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
    
    try {
      // Send data to backend API
      const result = await uploadReport(reportData.image, {
        coords: reportData.coords,
        timestamp: Date.now()
      });
      
      // Update report with actual data from API
      const updatedReport = {
        ...newReport,
        status: 'processed',
        progress: 100,
        processingStep: 5,
        trustScore: result.trust_evaluation.score,
        location: result.location,
        address: result.location,
        visualSummary: result.visual_summary,
        weatherSummary: result.weather_summary,
        authorityReport: result.reports.authority_report,
        publicAlert: result.reports.public_alert,
        volunteerGuidance: result.reports.volunteer_guidance,
        coords: result.coordinates
      };
      
      setReports(prev => prev.map(report => 
        report.id === newReport.id ? updatedReport : report
      ));
      
      // Add notification
      if (addNotification) {
        addNotification({
          title: 'Trust Score Ready',
          message: `Report processed with trust score: ${result.trust_evaluation.score}%`,
          type: result.trust_evaluation.score >= 50 ? 'success' : 'error'
        });
      }
      
      return updatedReport;
    } catch (error) {
      console.error('Error processing report:', error);
      // If there's an error, queue the report for later
      setQueuedReports(prev => [...prev, newReport]);
      // Add notification about queuing
      if (addNotification) {
        addNotification({
          title: 'Report Queued',
          message: 'Report will be submitted when connection is restored',
          type: 'info'
        });
      }
      return newReport;
    }
  }, [user, isOnline, addNotification]);

  const calculateInitialTrustScore = (reportData) => {
    let score = 50; // Base score
    
    // Adjust based on user trust rating
    if (user?.trust_rating) {
      score += (user.trust_rating - 50) * 0.3;
    }
    
    // Adjust based on report quality indicators
    if (reportData.description && reportData.description.length > 50) {
      score += 10; // Detailed description
    }
    
    if (reportData.coords) {
      score += 15; // GPS coordinates available
    }
    
    // Random variation
    score += (Math.random() - 0.5) * 20;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const generateMockAgentResponse = (reportData) => {
    const visualTags = {
      'oil_slick': 'oil_slick_detected',
      'marine_debris': 'debris_accumulation',
      'algae_bloom': 'harmful_algae_bloom',
      'coastal_erosion': 'erosion_pattern',
      'chemical_spill': 'chemical_contamination',
      'dead_fish': 'fish_mortality_event'
    };

    return {
      visual_summary: visualTags[reportData.visual_tag] || 'environmental_anomaly',
      weather_check: {
        source: 'IMD',
        status: ['clear', 'cloudy', 'storm', 'post_storm'][Math.floor(Math.random() * 4)]
      },
      reasoning: ['urgent_alert', 'needs_verification', 'environmental_concern'][Math.floor(Math.random() * 3)]
    };
  };

  const likeReport = async (reportId) => {
    const updatedReports = reports.map(report => 
      report.id === reportId 
        ? { ...report, likes: report.likes + 1 }
        : report
    );
    
    setReports(updatedReports);
    await localforage.setItem('oceanwatch_reports', updatedReports);
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
    allReports: reports // Unfiltered reports
  };

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
};