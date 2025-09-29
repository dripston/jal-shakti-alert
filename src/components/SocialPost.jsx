import React, { useState } from 'react';
import { MapPin, Clock, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

const SocialPost = ({ report }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
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

  // Clean up text by removing markdown and converting to bullet points
  const formatText = (text) => {
    if (!text) return '';
    
    // Remove markdown asterisks and formatting
    let cleaned = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
      .replace(/^\s*\*\s+/gm, '• ')    // Convert * bullets to •
      .replace(/^\s*-\s+/gm, '• ')     // Convert - bullets to •
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 lg:mb-0 overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 pb-3 lg:p-6 lg:pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-medium text-sm lg:text-base">👤</span>
          </div>
          <div>
            <p className="font-medium text-gray-900 lg:text-lg">Community Reporter</p>
            <div className="flex items-center text-xs lg:text-sm text-gray-500">
              <MapPin className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
              <span className="truncate max-w-32 lg:max-w-48">{report.location || report.address}</span>
              <span className="mx-2">•</span>
              <span>{formatTimestamp(report.timestamp)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-lg lg:text-xl">{getStatusEmoji()}</span>
          <button className="text-gray-400 hover:text-gray-600 p-1 lg:p-2 rounded-lg hover:bg-gray-100">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3 lg:px-6 lg:pb-4">
        {report.description && (
          <p className="text-gray-800 text-sm lg:text-base mb-3 leading-relaxed">
            {report.description}
          </p>
        )}
        
        {/* News Summary */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-3 lg:p-4 mb-3">
          <div className="flex items-start space-x-2">
            <div className="text-blue-600 font-semibold text-xs lg:text-sm">BREAKING</div>
          </div>
          <p className="text-sm lg:text-base text-gray-800 font-medium mt-1 leading-relaxed">
            {getNewsSummary()}
          </p>
        </div>
      </div>

      {/* Image */}
      {report.image && (
        <div className="relative">
          <img
            src={report.image}
            alt="Water hazard report"
            className="w-full h-80 lg:h-96 object-cover"
          />
          
          {/* Image overlay with location */}
          <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 lg:px-3 lg:py-2 rounded-md text-xs lg:text-sm">
            📍 {report.location || report.address}
          </div>
        </div>
      )}

      {/* Engagement Actions */}
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-6 lg:space-x-8">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center space-x-2 transition-colors p-1 lg:p-2 rounded-lg hover:bg-gray-50 ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 lg:w-6 lg:h-6 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm lg:text-base font-medium">{(report.likes || 0) + (isLiked ? 1 : 0)}</span>
            </button>
            
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors p-1 lg:p-2 rounded-lg hover:bg-gray-50"
            >
              <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />
              <span className="text-sm lg:text-base font-medium">{report.comments || 0}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors p-1 lg:p-2 rounded-lg hover:bg-gray-50">
              <Share2 className="w-5 h-5 lg:w-6 lg:h-6" />
              <span className="text-sm lg:text-base font-medium">Share</span>
            </button>
          </div>
          
          {/* Trust Score Badge */}
          <div className="flex items-center space-x-1">
            <span className="text-xs lg:text-sm text-gray-500">Trust:</span>
            <span className={`text-xs lg:text-sm font-medium px-2 py-1 lg:px-3 lg:py-2 rounded-full ${
              (report.trustScore || report.trust_score || 0) >= 50 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {report.trustScore || report.trust_score || 0}%
            </span>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t pt-3 mt-3">
            <div className="space-y-3">
              {/* Sample comments */}
              <div className="flex space-x-2">
                <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
                <div>
                  <p className="text-sm"><span className="font-medium">Local Resident</span> Thanks for reporting this! Stay safe everyone 🙏</p>
                  <p className="text-xs text-gray-500 mt-1">2h ago</p>
                </div>
              </div>
              
              {/* Add comment */}
              <div className="flex space-x-2 mt-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex-shrink-0"></div>
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  className="flex-1 text-sm bg-gray-100 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialPost;