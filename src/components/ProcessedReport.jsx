import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Eye, Cloud, Bot, BarChart2, FileText, MapPin, Clock } from 'lucide-react';

const ProcessedReport = ({ report, onLike, onShare }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Safety check - return null if report is undefined
  if (!report) {
    return null;
  }

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) onLike(report.id);
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

  const actualTrustScore = report.trustScore || report.trust_score || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-medium text-gray-900">
              {report.visual_tag?.replace(/_/g, ' ') || 'Water Hazard Report'}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              report.alert_level === 'high' ? 'bg-red-100 text-red-800' :
              report.alert_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {report.alert_level || 'medium'}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{report.address || 'Location not specified'}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            actualTrustScore >= 71 ? 'trust-score-high' :
            actualTrustScore >= 41 ? 'trust-score-medium' : 'trust-score-low'
          }`}>
            {actualTrustScore}%
          </span>
        </div>
      </div>

      {/* Image */}
      {report.image && (
        <div className="relative mb-3">
          <img 
            src={report.image} 
            alt="Report" 
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Status and Trust Info */}
      <div className="mb-3">
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          report.status === 'processed' ? 'bg-green-100 text-green-800' :
          report.status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {report.status === 'processed' ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </>
          ) : report.status === 'rejected' ? (
            <>
              <AlertTriangle className="h-3 w-3 mr-1" />
              Rejected
            </>
          ) : (
            <>
              <Clock className="h-3 w-3 mr-1" />
              Processing
            </>
          )}
        </div>
        
        {report.status === 'rejected' && (
          <p className="text-xs text-red-600 mt-1">
            {report.rejectionReason || 'Report did not meet verification criteria'}
          </p>
        )}
        
        {report.status === 'error' && (
          <p className="text-xs text-red-600 mt-1">
            {report.errorMessage || 'Processing error occurred'}
          </p>
        )}
      </div>

      {/* Quick Summary */}
      {!isExpanded && (
        <div className="mb-3">
          <p className="text-sm text-gray-600">
            {report.description || 'No description provided'}
          </p>
          
          {/* Trust indicator */}
          <p className={`text-xs mt-2 ${
            actualTrustScore >= 50 ? 'text-green-600' : 'text-red-600'
          }`}>
            Trust Analysis: {actualTrustScore >= 50 ? 
              'Verified and consistent' : 
              'Needs verification'
            }
          </p>
          
          {!isExpanded && report.visualSummary && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="text-xs text-green-600 hover:text-green-800 mt-1 underline"
            >
              View analysis details
            </button>
          )}
        </div>
      )}
      
      {isExpanded && (
        <div className="mt-2 space-y-1">
          {report.weatherEmergencyRelated !== undefined && (
            <p className="text-xs text-red-600">
              Weather Emergency Related: {report.weatherEmergencyRelated ? 'Yes' : 'No'}
            </p>
          )}
          {report.screenCaptureDetected !== undefined && (
            <p className="text-xs text-red-600">
              Screen Capture Detected: {report.screenCaptureDetected ? 'Yes' : 'No'}
            </p>
          )}
          {report.visualSummary && (
            <div className="mt-2">
              <p className="text-sm">
                <span className="font-medium">Visual Analysis:</span>
                {' '}
                {cleanVisualSummary(report.visualSummary)}
              </p>
            </div>
          )}
          <button 
            onClick={() => setIsExpanded(false)}
            className="text-xs text-green-600 hover:text-green-800 mt-2 underline"
          >
            Show less
          </button>
        </div>
      )}

      {/* Generated reports - Show all available details when expanded */}
      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          {report.visualSummary && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Visual Analysis</h4>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {cleanVisualSummary(report.visualSummary)}
              </div>
            </div>
          )}
          
          {report.weatherSummary && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Weather Analysis</h4>
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                {cleanVisualSummary(report.weatherSummary)}
              </div>
            </div>
          )}
          
          {report.trustReasoning && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Trust Evaluation</h4>
              <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                {cleanVisualSummary(report.trustReasoning)}
              </div>
            </div>
          )}
          
          {report.authorityReport && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Authority Report</h4>
              <div className="text-sm text-gray-600 bg-red-50 p-3 rounded-lg">
                {cleanVisualSummary(report.authorityReport)}
              </div>
            </div>
          )}
          
          {report.publicAlert && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Public Alert</h4>
              <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                {cleanVisualSummary(report.publicAlert)}
              </div>
            </div>
          )}
          
          {report.volunteerGuidance && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Volunteer Guidance</h4>
              <div className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                {cleanVisualSummary(report.volunteerGuidance)}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-1 text-sm ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <div className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}>
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <span>{(report.likes || 0) + (isLiked ? 1 : 0)}</span>
          </button>
          
          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500">
            <div className="w-5 h-5">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
            </div>
            <span>{report.comments || 0}</span>
          </button>
        </div>
        
        <button 
          onClick={onShare}
          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-500"
        >
          <div className="w-5 h-5">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
          </div>
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default ProcessedReport;