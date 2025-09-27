import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useReports } from '../../contexts/ReportsContext';
import { useAuth } from '../../contexts/AuthContext';
import { Camera, Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react';
import PostCard from '../../components/PostCard';

const UsersDashboard = () => {
  const { allReports } = useReports();
  const { user } = useAuth();
  
  const userReports = allReports.filter(r => r.userId === user?.id) || [];
  const totalLikes = userReports.reduce((sum, r) => sum + (r.likes || 0), 0);

  return (
    <div className="container-mobile py-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <Camera className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-heading font-bold">Your Reports Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track your contributions and impact</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-primary">{userReports.length}</p>
            <p className="text-xs text-muted-foreground">Reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-red-500">{totalLikes}</p>
            <p className="text-xs text-muted-foreground">Likes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-green-600">{user?.trust_rating || 0}%</p>
            <p className="text-xs text-muted-foreground">Trust</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {userReports.map(report => (
          <PostCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
};

export default UsersDashboard;