import React from 'react';
import { Heart, MessageCircle, Share2, MapPin, Clock, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useReports } from '../contexts/ReportsContext';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ report, onViewOnMap, compact = false }) => {
  const { user } = useAuth();
  const { likeReport } = useReports();

  const getTrustScoreColor = (score) => {
    if (score >= 71) return 'trust-score-high';
    if (score >= 41) return 'trust-score-medium';
    return 'trust-score-low';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAlertLevelColor = (level) => {
    switch (level) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  const handleLike = () => {
    likeReport(report.id);
  };

  return (
    <Card className="card-hover animate-fade-in">
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={`https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=faces`}
              alt="User"
              className="h-8 w-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                User #{report.userId}
              </p>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(report.timestamp), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusIcon(report.status)}
            <div className={`h-3 w-3 rounded-full ${getAlertLevelColor(report.alert_level)}`} />
          </div>
        </div>

        {/* Image */}
        <div className="relative mb-3 overflow-hidden rounded-lg">
          <img
            src={report.image}
            alt={report.visual_tag}
            className="aspect-video w-full object-cover"
            loading="lazy"
          />
          
          {/* Visual Tag Badge */}
          <Badge 
            className="absolute left-2 top-2 bg-black/50 text-white capitalize"
            variant="secondary"
          >
            {report.visual_tag.replace('_', ' ')}
          </Badge>

          {/* Trust Score */}
          <div className="absolute right-2 top-2 flex items-center space-x-1">
            <div className={`rounded-full px-2 py-1 text-xs font-medium ${getTrustScoreColor(report.trust_score)}`}>
              {report.trust_score}%
            </div>
          </div>
        </div>

        {/* Trust Score Bar */}
        <div className="mb-3">
          <div className="trust-bar">
            <div 
              className={`trust-fill ${getTrustScoreColor(report.trust_score)}`}
              style={{ width: `${report.trust_score}%` }}
            />
          </div>
        </div>

        {/* Description */}
        {!compact && (
          <p className="mb-3 text-sm text-foreground line-clamp-3">
            {report.description}
          </p>
        )}

        {/* Location */}
        <div className="mb-3 flex items-center space-x-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="flex-1 truncate">{report.address}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewOnMap?.(report)}
            className="p-1 text-xs"
          >
            View on Map
          </Button>
        </div>

        {/* GPS Coordinates */}
        <div className="mb-3 text-xs text-muted-foreground font-mono">
          {report.coords?.lat?.toFixed(4) || 'N/A'}, {report.coords?.lng?.toFixed(4) || 'N/A'}
        </div>

        {/* Verification Badges */}
        {report.status === 'verified' && (
          <div className="mb-3">
            <Badge variant="default" className="mr-2">
              ✓ Authority Verified
            </Badge>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="flex items-center space-x-1 text-muted-foreground hover:text-red-500"
            >
              <Heart className="h-4 w-4" />
              <span className="text-xs">{report.likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 text-muted-foreground hover:text-blue-500"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{report.comments}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 text-muted-foreground hover:text-green-500"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-xs">{report.shares}</span>
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="text-xs">
              Report Issue
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Assign Task
            </Button>
          </div>
        </div>

        {/* Agent Analysis (collapsed by default) */}
        {report.agents && (
          <details className="mt-3 text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              AI Analysis
            </summary>
            <div className="mt-2 space-y-1 text-muted-foreground">
              <div>Visual: {report.agents.visual_summary}</div>
              <div>Weather: {report.agents.weather_check.status} ({report.agents.weather_check.source})</div>
              <div>Assessment: {report.agents.reasoning}</div>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;