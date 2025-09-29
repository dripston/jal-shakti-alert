import React, { useState } from 'react';
import { MapPin, Clock, Heart, MessageCircle, Share2, MoreHorizontal, Eye, CloudRain, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SocialPost = ({ report }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const { user } = useAuth();
  
  // Safety check - return null if report is undefined
  if (!report) {
    return null;
  }
  
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const reportTime = new Date(timestamp);
    const diffInHours = Math.floor((now - reportTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return reportTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Clean up text by removing markdown and converting to clean paragraphs
  const formatText = (text) => {
    if (!text) return '';
    
    // Remove markdown asterisks and formatting
    let cleaned = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
      .replace(/^\s*\*\s+/gm, '• ')    // Convert * bullets to •
      .replace(/^\s*-\s+/gm, '• ')     // Convert - bullets to •
      .replace(/\*/g, '')              // Remove any remaining asterisks
      .trim();
    
    return cleaned;
  };

  // Create a professional news-style summary
  const getNewsSummary = () => {
    if (report.status === 'rejected') {
      return "Report verification unsuccessful. Authorities continue monitoring the area.";
    }
    
    if (report.status === 'error') {
      return "Technical analysis pending. Local authorities have been notified for manual review.";
    }

    // For processed reports, use actual trust score from pipeline
    const trustScore = report.trustScore || report.trust_score || 0;
    
    if (trustScore >= 70) {
      return "High-confidence environmental incident confirmed. Emergency response teams have been dispatched to the location.";
    } else if (trustScore >= 50) {
      return "Moderate-confidence environmental concern reported. Local authorities are conducting further investigation.";
    } else if (trustScore > 0) {
      return "Environmental report under verification. Authorities are cross-referencing with additional data sources.";
    } else {
      return "Initial report assessment complete. Monitoring systems remain active in the area.";
    }
  };

  const getStatusEmoji = () => {
    const trustScore = report.trustScore || report.trust_score || 0;
    
    if (report.status === 'rejected') return '❌';
    if (report.status === 'error') return '⚠️';
    if (trustScore >= 80) return '✅';
    if (trustScore >= 50) return '🔍';
    return '⏳';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto mb-4 overflow-hidden">
      {/* Twitter-like Header */}
      <div className="flex items-start space-x-3 p-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-medium text-lg">
            {user?.name?.charAt(0)?.toUpperCase() || '👤'}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {user?.name || 'Community Reporter'}
            </h3>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500 text-sm">
              {formatTimestamp(report.timestamp)}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{report.location || report.address || 'Unknown location'}</span>
          </div>
        </div>
        
        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Text */}
      {report.description && (
        <div className="px-4 pb-3">
          <p className="text-gray-900 leading-relaxed">
            {report.description}
          </p>
        </div>
      )}

      {/* Image */}
      {report.image && (
        <div className="relative">
          <img
            src={report.image}
            alt="Water quality report"
            className="w-full h-80 object-cover"
          />
          
          {/* Trust Score Overlay */}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              (report.trustScore || report.trust_score || 0) >= 50 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {report.trustScore || report.trust_score || 0}% Trust
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={() => setActiveTab(activeTab === 'visual' ? null : 'visual')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border transition-colors ${
              activeTab === 'visual' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Visual Summary</span>
          </button>
          
          <button 
            onClick={() => setActiveTab(activeTab === 'weather' ? null : 'weather')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border transition-colors ${
              activeTab === 'weather' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CloudRain className="w-4 h-4" />
            <span className="text-sm font-medium">Weather Report</span>
          </button>
          
          <button 
            onClick={() => setActiveTab(activeTab === 'user' ? null : 'user')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border transition-colors ${
              activeTab === 'user' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">User Report</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'visual' && report.visualSummary && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Visual Analysis</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {formatText(report.visualSummary)}
            </p>
          </div>
        )}

        {activeTab === 'weather' && report.weatherSummary && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Weather Analysis</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {formatText(report.weatherSummary)}
            </p>
          </div>
        )}

        {activeTab === 'user' && (
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Report Summary</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <p><span className="font-medium">Status:</span> {report.status || 'Processing'}</p>
              <p><span className="font-medium">Trust Score:</span> {report.trustScore || report.trust_score || 0}%</p>
              <p><span className="font-medium">Location:</span> {report.location || report.address}</p>
              <p><span className="font-medium">Submitted:</span> {formatTimestamp(report.timestamp)}</p>
              {report.description && (
                <p><span className="font-medium">Description:</span> {report.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Social Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{(report.likes || 0) + (isLiked ? 1 : 0)}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{report.comments || 0}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPost;