import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useReports } from '../../contexts/ReportsContext';
import { BarChart3, TrendingUp, Shield } from 'lucide-react';

const AuthoritiesAnalytics = () => {
  const { allReports, socialPosts } = useReports();
  
  const verifiedSocial = socialPosts.filter(p => p.verified).length;
  const linkedPosts = socialPosts.filter(p => p.linked_report).length;

  return (
    <div className="container-mobile py-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-heading font-bold">Authorities Social Analytics</h1>
          <p className="text-sm text-muted-foreground">Monitor verified social signals and trends</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-blue-600">{verifiedSocial}</p>
            <p className="text-xs text-muted-foreground">Verified Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-green-600">{linkedPosts}</p>
            <p className="text-xs text-muted-foreground">Linked Reports</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthoritiesAnalytics;