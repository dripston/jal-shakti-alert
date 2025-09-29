import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useReports } from '../../contexts/ReportsContext';
import { useAuth } from '../../contexts/AuthContext';
import { Camera, Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react';
import SocialPost from '../../components/SocialPost';

const UsersDashboard = () => {
  const { allReports } = useReports();
  const { user } = useAuth();
  
  const userReports = allReports.filter(r => r.userId === user?.id) || [];
  const totalLikes = userReports.reduce((sum, r) => sum + (r.likes || 0), 0);

  return (
    <div className="py-6 lg:py-0 space-y-6">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold">Your Reports Dashboard</h1>
            <p className="text-sm text-muted-foreground">Track your contributions and impact</p>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">Your Reports Dashboard</h1>
              <p className="text-muted-foreground">Track your contributions and impact</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 px-4 lg:px-0">
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

      <div className="space-y-4 px-4 lg:px-0">
        <h2 className="text-lg lg:text-xl font-heading font-semibold">Your Reports</h2>
        {userReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium mb-2">No reports yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start contributing to ocean safety by reporting hazards you observe.
              </p>
              <Button>
                <Camera className="h-4 w-4 mr-2" />
                Create Your First Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          userReports.map(report => (
            <SocialPost key={report.id} report={report} />
          ))
        )}
      </div>
    </div>
  );
};

export default UsersDashboard;