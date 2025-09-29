import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useReports } from '../../contexts/ReportsContext';
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  FileText,
  Eye
} from 'lucide-react';

const VolunteersDashboard = () => {
  const { allReports } = useReports();
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedTasks, setExpandedTasks] = useState({});

  // Filter reports for volunteers - show processed reports with volunteer guidance
  const volunteerTasks = allReports.filter(report => {
    // Safety check
    if (!report) return false;
    
    // Only show processed reports with volunteer guidance
    if (report.status !== 'processed' || !report.volunteerGuidance) return false;
    
    // Apply priority filter
    if (selectedPriority !== 'all' && report.alert_level !== selectedPriority) {
      return false;
    }
    
    return true;
  });

  // Calculate statistics
  const stats = {
    totalTasks: volunteerTasks.length,
    highPriority: volunteerTasks.filter(t => t.alert_level === 'high').length,
    completed: volunteerTasks.filter(t => t.volunteerStatus === 'completed').length,
    inProgress: volunteerTasks.filter(t => t.volunteerStatus === 'in-progress').length
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

  const handleTaskAction = (taskId, action) => {
    // In real app, this would make API call to update task status
    console.log(`Task ${taskId}: ${action}`);
  };

  return (
    <div className="py-6 lg:py-0 space-y-6">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold">Volunteers Dashboard</h1>
            <p className="text-xs text-muted-foreground">Community action tasks</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalTasks}</p>
                <p className="text-xs text-muted-foreground">Active Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-red-500">{stats.highPriority}</p>
                <p className="text-xs text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 px-4">
        <div className="flex-1">
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New Tasks</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4 px-4 pb-20 lg:pb-6">
        {volunteerTasks.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No tasks available</h3>
            <p className="text-muted-foreground">Check back later for new volunteer opportunities</p>
          </div>
        ) : (
          volunteerTasks.map((task) => {
            // Safety check
            if (!task) return null;
            
            const isExpanded = expandedTasks[task.id];
            
            return (
              <div key={task.id} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {task.visual_tag?.replace(/_/g, ' ') || 'Community Task'}
                        </h3>
                        <Badge 
                          variant={
                            task.alert_level === 'high' ? 'destructive' : 
                            task.alert_level === 'medium' ? 'secondary' : 'default'
                          }
                        >
                          {task.alert_level || 'medium'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{task.address || 'Location not specified'}</span>
                      </div>
                      
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>Trust: {task.trustScore || task.trust_score || 0}%</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(task.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setExpandedTasks(prev => ({
                        ...prev,
                        [task.id]: !isExpanded
                      }))}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Public Alert Summary */}
                  {task.publicAlert && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">📢 Community Alert</h4>
                      <div className="text-sm text-blue-800">
                        {cleanVisualSummary(task.publicAlert)}
                      </div>
                    </div>
                  )}

                  {/* Safety Information */}
                  {task.weatherSummary && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">🌤️ Weather & Safety</h4>
                      <div className="text-sm text-blue-800">
                        {cleanVisualSummary(task.weatherSummary)}
                      </div>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expandedTasks[task.id] && (
                    <div className="space-y-3 border-t pt-3">
                      {task.visualSummary && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">🔍 Visual Analysis</h4>
                          <div className="text-sm text-gray-700">
                            {cleanVisualSummary(task.visualSummary)}
                          </div>
                        </div>
                      )}
                      
                      {task.authorityReport && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">🏛️ Authority Assessment</h4>
                          <div className="text-sm text-blue-800">
                            {cleanVisualSummary(task.authorityReport)}
                          </div>
                        </div>
                      )}
                      
                      {task.volunteerGuidance && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-purple-900 mb-2">📋 Volunteer Instructions</h4>
                          <div className="text-sm text-purple-800 whitespace-pre-line">
                            {cleanVisualSummary(task.volunteerGuidance)}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                          <Clock className="h-4 w-4 mr-1" />
                          Mark In Progress
                        </Button>
                        <Button size="sm" variant="outline" className="text-green-700 border-green-300">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                      </div>
                      
                      <button 
                        onClick={() => setExpandedTasks(prev => ({
                          ...prev,
                          [task.id]: false
                        }))}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        View Less
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VolunteersDashboard;