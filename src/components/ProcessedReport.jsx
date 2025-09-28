import React from 'react';
import { MapPin, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const ProcessedReport = ({ report }) => {
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

  const TrustIcon = getTrustIcon(report.trustScore);

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
          <div className="flex items-center">
            <TrustIcon className={`w-5 h-5 ${(report.trustScore || report.trust_score) >= 50 ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`ml-1 text-sm font-medium ${(report.trustScore || report.trust_score) >= 50 ? 'text-green-600' : 'text-red-600'}`}>
              {report.trustScore || report.trust_score}%
            </span>
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
        
        {/* Trust score reasoning */}
        <div className="mb-4 p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-800">
            <span className="font-medium">Trust Analysis:</span>
            {' '}
            {(report.trustScore || report.trust_score) >= 50 ? 
              'Consistent data across all sources' : 
              'Inconsistencies found between visual and weather data'
            }
          </p>
        </div>
        
        {/* Generated reports */}
        <div className="space-y-3">
          {report.authorityReport && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Authority Report</h4>
              <p className="text-sm text-gray-600">{report.authorityReport}</p>
            </div>
          )}
          
          {report.publicAlert && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Public Alert</h4>
              <p className="text-sm text-gray-600">{report.publicAlert}</p>
            </div>
          )}
          
          {report.volunteerGuidance && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Volunteer Guidance</h4>
              <p className="text-sm text-gray-600">{report.volunteerGuidance}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessedReport;