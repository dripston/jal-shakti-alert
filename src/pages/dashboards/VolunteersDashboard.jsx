import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useReports } from '../../contexts/ReportsContext';
import { Users, MapPin, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const VolunteersDashboard = () => {
  const { allReports } = useReports();
  
  // Show pending and approved reports as potential tasks for volunteers (exclude rejected)
  const tasks = allReports.filter(r => 
    (r.status === 'pending' || r.status === 'approved' || r.status === 'processed') && 
    r.status !== 'rejected' && 
    (r.trustScore || r.trust_score || 0) >= 50
  ).slice(0, 10);
  const completedTasks = Math.floor(tasks.length * 0.6);

  return (
    <div className="container-mobile py-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-heading font-bold">Volunteers Dashboard</h1>
          <p className="text-sm text-muted-foreground">Coordinate response tasks and assignments</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-yellow-500">{tasks.length}</p>
            <p className="text-xs text-muted-foreground">Active Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-heading font-semibold">Available Tasks</h2>
        
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-medium mb-2">No active tasks!</h3>
              <p className="text-sm text-muted-foreground">
                All current reports have been handled.
              </p>
            </CardContent>
          </Card>
        ) : (
          tasks.map(task => (
            <Card key={task.id} className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-4">
                {/* Volunteer-specific report view */}
                <div className="space-y-3">
                  {/* Basic Task Info */}
                  <div className="flex items-start space-x-3">
                    {task.image && (
                      <img 
                        src={task.image} 
                        alt="Task" 
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="destructive">
                          URGENT - {task.alert_level?.toUpperCase() || 'HIGH'} PRIORITY
                        </Badge>
                        <Badge variant="outline">
                          Trust Score: {task.trustScore || task.trust_score || 0}%
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{task.location || task.address}</span>
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{new Date(task.timestamp).toLocaleString()}</span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-700 mb-2">{task.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Volunteer Guidance */}
                  {task.volunteerGuidance && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-orange-900 mb-2">🦺 Volunteer Instructions</h4>
                      <div className="text-sm text-orange-800 whitespace-pre-line">
                        {task.volunteerGuidance}
                      </div>
                    </div>
                  )}

                  {/* Public Alert Context */}
                  {task.publicAlert && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-red-900 mb-2">📢 Public Alert</h4>
                      <div className="text-sm text-red-800 whitespace-pre-line">
                        {task.publicAlert}
                      </div>
                    </div>
                  )}

                  {/* Safety Information */}
                  {task.weatherSummary && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">🌤️ Weather & Safety</h4>
                      <div className="text-sm text-blue-800 whitespace-pre-line">
                        {task.weatherSummary}
                      </div>
                    </div>
                  )}
                </div>

                {/* Volunteer Actions */}
                <div className="mt-4 pt-4 border-t bg-muted/20 -mx-4 px-4 -mb-4 pb-4">
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Accept Task
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Get Directions
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                    >
                      📞 Contact Team
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                    >
                      ℹ️ More Details
                    </Button>
                  </div>
                  
                  {/* Task Status */}
                  <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                    <div className="text-xs text-orange-600 font-medium">
                      Task Status: Available • Est. 2-4 hours
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default VolunteersDashboard;