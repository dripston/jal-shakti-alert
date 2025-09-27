import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { useReports } from '../../contexts/ReportsContext';
import { TrendingUp } from 'lucide-react';

const UsersAnalytics = () => {
  const { socialPosts } = useReports();

  return (
    <div className="container-mobile py-6 space-y-6">
      <div className="flex items-center space-x-3">
        <TrendingUp className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-xl font-heading font-bold">Users Social Analytics</h1>
          <p className="text-sm text-muted-foreground">Social feed and engagement metrics</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {socialPosts.slice(0, 5).map(post => (
          <Card key={post.id}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <img src={post.avatar} alt="" className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <p className="font-medium">@{post.handle}</p>
                  <p className="text-sm mt-1">{post.text}</p>
                  <div className="flex space-x-4 mt-2 text-xs text-muted-foreground">
                    <span>{post.engagement?.likes || post.engagement?.upvotes || 0} likes</span>
                    <span>{post.engagement?.comments || post.engagement?.replies || 0} comments</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UsersAnalytics;