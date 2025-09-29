import React, { useState } from 'react';
import { MapPin, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const ProcessedReport = ({ report }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrustIcon = (score) => {
    if (score >= 50) {
      return CheckCircle;
    }
    return AlertTriangle;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'error':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'processed':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      case 'error':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const actualTrustScore = report.status === 'rejected' || report.status === 'error' ? 0 : (report.trustScore || report.trust_score || 0);
  const TrustIcon = getTrustIcon(actualTrustScore);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      {/* Report header */}
      <div className="p-4 border-b border-orange-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-800 font-medium">U</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">User</p>
              <p className="text-xs text-gray-500">Community Reporter</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Pipeline Status Badge */}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              report.pipelineStatus === 'PROCESSED' ? 'bg-green-100 text-green-800' :
              report.pipelineStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
              report.pipelineStatus === 'ERROR' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {report.pipelineStatus || report.status?.toUpperCase()}
            </span>
            {/* Trust Score */}
            <div className="flex items-center">
              {(() => {
                const trustScore = report.status === 'rejected' || report.status === 'error' ? 0 : (report.trustScore || report.trust_score || 0);
                return (
                  <>
                    <TrustIcon className={`w-5 h-5 ${trustScore >= 50 ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`ml-1 text-sm font-medium ${trustScore >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                      {trustScore}%
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Image */}
      <div className="relative">
        <img
          src={report.image}
          alt="Hazard report"
          className="w-full h-64 object-cover"
        />
      </div>
      
      {/* Report details */}
      <div className="p-4">
        {/* Location and timestamp */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="truncate">{report.location || report.address}</span>
          <span className="mx-2">•</span>
          <Clock className="w-4 h-4 mr-1" />
          <span>{formatTimestamp(report.timestamp)}</span>
        </div>
        
        {/* Description */}
        {report.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-700">{report.description}</p>
          </div>
        )}
        
        {/* Pipeline Status and Analysis - Compact View */}
        <div className={`mb-4 p-3 rounded-lg border ${getStatusBg(report.status)}`}>
          {report.pipelineStatus === 'REJECTED' && (
            <div>
              <p className="text-sm text-red-800 font-medium">
                Report Rejected: {report.rejectionReason || 'Did not meet processing criteria'}
              </p>
              {!isExpanded && (
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="text-xs text-red-600 hover:text-red-800 mt-1 underline"
                >
                  Read more details
                </button>
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
                        {report.visualSummary}
                      </p>
                    </div>
                  )}
                  <button 
                    onClick={() => setIsExpanded(false)}
                    className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
                  >
                    Show less
                  </button>
                </div>
              )}
            </div>
          )}
          
          {report.pipelineStatus === 'ERROR' && (
            <div>
              <p className="text-sm text-orange-800 font-medium">
                Processing Error: {report.errorMessage || 'Failed to process report'}
              </p>
            </div>
          )}
          
          {report.pipelineStatus === 'PROCESSED' && (
            <div>
              <p className="text-sm text-green-800 font-medium">
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
              {isExpanded && (
                <div className="mt-2 space-y-2">
                  {report.visualSummary && (
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Visual Analysis:</span>
                        {' '}
                        {report.visualSummary}
                      </p>
                    </div>
                  )}
                  {report.weatherSummary && (
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Weather Data:</span>
                        {' '}
                        {report.weatherSummary}
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
            </div>
          )}
        </div>
        
        {/* Generated reports - Show all available details when expanded */}
        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            {report.visualSummary && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Visual Analysis</h4>
                <div className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded-lg">
                  {report.visualSummary}
                </div>
              </div>
            )}
            
            {report.weatherSummary && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Weather Analysis</h4>
                <div className="text-sm text-gray-600 whitespace-pre-line bg-blue-50 p-3 rounded-lg">
                  {report.weatherSummary}
                </div>
              </div>
            )}
            
            {report.trustReasoning && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Trust Evaluation</h4>
                <div className="text-sm text-gray-600 whitespace-pre-line bg-yellow-50 p-3 rounded-lg">
                  {report.trustReasoning}
                </div>
              </div>
            )}
            
            {report.authorityReport && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Authority Report</h4>
                <div className="text-sm text-gray-600 whitespace-pre-line bg-red-50 p-3 rounded-lg">
                  {report.authorityReport}
                </div>
              </div>
            )}
            
            {report.publicAlert && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Public Alert</h4>
                <div className="text-sm text-gray-600 whitespace-pre-line bg-orange-50 p-3 rounded-lg">
                  {report.publicAlert}
                </div>
              </div>
            )}
            
            {report.volunteerGuidance && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Volunteer Guidance</h4>
                <div className="text-sm text-gray-600 whitespace-pre-line bg-green-50 p-3 rounded-lg">
                  {report.volunteerGuidance}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
              <span className="text-sm">👍</span>
              <span className="text-xs">{report.likes || 0}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors">
              <span className="text-sm">💬</span>
              <span className="text-xs">{report.comments || 0}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 hover:text-purple-600 transition-colors">
              <span className="text-sm">📤</span>
              <span className="text-xs">Share</span>
            </button>
          </div>
          
          {!isExpanded && (report.authorityReport || report.publicAlert || report.volunteerGuidance) && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              View full report →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessedReport;