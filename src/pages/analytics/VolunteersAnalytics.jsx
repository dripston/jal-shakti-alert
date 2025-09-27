import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Users } from 'lucide-react';

const VolunteersAnalytics = () => {
  return (
    <div className="container-mobile py-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Users className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-xl font-heading font-bold">Volunteers Analytics</h1>
          <p className="text-sm text-muted-foreground">Task performance and social coordination</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-lg">Task analytics and social coordination metrics will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VolunteersAnalytics;