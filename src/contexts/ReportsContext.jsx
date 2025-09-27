import React, { createContext, useContext, useState, useEffect } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';
import { useAuth } from './AuthContext';
import reportsData from '../mock/reports.json';
import socialData from '../mock/social_posts.json';

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

  useEffect(() => {
    initializeData();
    setupNetworkListeners();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      syncQueuedReports();
    }
  }, [isOnline]);

  const initializeData = async () => {
    try {
      // Load cached data
      const cachedReports = await localforage.getItem('oceanwatch_reports') || [];
      const cachedSocial = await localforage.getItem('oceanwatch_social') || [];
      const queued = await localforage.getItem('oceanwatch_queued_reports') || [];

      // If no cached data, use mock data
      if (cachedReports.length === 0) {
        setReports(reportsData);
        await localforage.setItem('oceanwatch_reports', reportsData);
      } else {
        setReports(cachedReports);
      }

      if (cachedSocial.length === 0) {
        setSocialPosts(socialData);
        await localforage.setItem('oceanwatch_social', socialData);
      } else {
        setSocialPosts(cachedSocial);
      }

      setQueuedReports(queued);
    } catch (error) {
      console.error('Failed to initialize data:', error);
      // Fallback to mock data
      setReports(reportsData);
      setSocialPosts(socialData);
    }
  };

  const setupNetworkListeners = () => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  };

  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  const createReport = async (reportData) => {
    if (!user) throw new Error('User must be authenticated');

    const newReport = {
      id: `r_${Date.now()}`,
      userId: user.id,
      ...reportData,
      timestamp: new Date().toISOString(),
      status: isOnline ? 'synced' : 'queued',
      likes: 0,
      comments: 0,
      shares: 0,
      trust_score: calculateInitialTrustScore(reportData),
      agents: generateMockAgentResponse(reportData)
    };

    if (isOnline) {
      // Simulate API call
      try {
        setIsLoading(true);
        await simulateApiCall('/api/reports', 'POST', newReport);
        
        const updatedReports = [newReport, ...reports];
        setReports(updatedReports);
        await localforage.setItem('oceanwatch_reports', updatedReports);
        
        return newReport;
      } catch (error) {
        // If online but API fails, queue the report
        await queueReport(newReport);
        throw error;
      } finally {
        setIsLoading(false);
      }
    } else {
      // Queue for later sync
      await queueReport(newReport);
      return newReport;
    }
  };

  const queueReport = async (report) => {
    const updatedQueue = [...queuedReports, report];
    setQueuedReports(updatedQueue);
    await localforage.setItem('oceanwatch_queued_reports', updatedQueue);
    
    // Add to local reports for immediate UI update
    const updatedReports = [report, ...reports];
    setReports(updatedReports);
  };

  const syncQueuedReports = async () => {
    if (queuedReports.length === 0) return;

    setIsLoading(true);
    
    try {
      for (const report of queuedReports) {
        try {
          await simulateApiCall('/api/reports', 'POST', report);
          
          // Update report status to synced
          const syncedReport = { ...report, status: 'synced' };
          
          // Update reports list
          setReports(prev => prev.map(r => 
            r.id === report.id ? syncedReport : r
          ));
        } catch (error) {
          console.error(`Failed to sync report ${report.id}:`, error);
          // Keep in queue for next attempt
        }
      }

      // Clear successfully synced reports from queue
      setQueuedReports([]);
      await localforage.setItem('oceanwatch_queued_reports', []);
      
      // Update cached reports
      const allReports = await localforage.getItem('oceanwatch_reports') || [];
      await localforage.setItem('oceanwatch_reports', allReports);
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateApiCall = (endpoint, method, data) => {
    return new Promise((resolve, reject) => {
      const delay = Math.random() * 2000 + 500; // 500-2500ms delay
      
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve(data);
        } else {
          reject(new Error('Network error'));
        }
      }, delay);
    });
  };

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
