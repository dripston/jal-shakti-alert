import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useReports } from '../../contexts/ReportsContext';
import { Users, MapPin, Clock, CheckCircle } from 'lucide-react';

const VolunteersDashboard = () => {
  const { allReports } = useReports();
  
  const tasks = allReports.filter(r => r.alert_level === 'high').slice(0, 10);
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

      <Card>
        <CardHeader>
          <CardTitle>Available Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <p className="font-medium capitalize">{task.visual_tag.replace('_', ' ')}</p>
                <p className="text-sm text-muted-foreground">{task.address}</p>
              </div>
              <Button size="sm">Accept Task</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default VolunteersDashboard;