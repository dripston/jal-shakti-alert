import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

const SocialMediaAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Dummy social media posts related to ocean hazards
  const socialPosts = [
    {
      id: 's1',
      username: '@OceanGuardian',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
      content: '🚨 Major oil spill reported near Chennai coast. Satellite imagery shows extensive contamination. Authorities are responding. #OceanPollution #EnvironmentalEmergency',
      timestamp: '2 hours ago',
      likes: 1240,
      comments: 89,
      shares: 342,
      trustScore: 92,
      category: 'Oil Spill'
    },
    {
      id: 's2',
      username: '@MarineLifeMatters',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
      content: ' heartbreaking images of marine life affected by plastic pollution in the Arabian Sea. We need urgent action! #SaveOurOceans #PlasticPollution',
      timestamp: '5 hours ago',
      likes: 2100,
      comments: 156,
      shares: 521,
      trustScore: 88,
      category: 'Plastic Pollution'
    },
    {
      id: 's3',
      username: '@CoastalWatch',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=faces',
      content: '⚠️ Red tide algae bloom detected off Kerala coast. Fishermen advised to avoid affected areas. Health advisory issued. #RedTide #AlgaeBloom',
      timestamp: '1 day ago',
      likes: 890,
      comments: 67,
      shares: 234,
      trustScore: 95,
      category: 'Algae Bloom'
    },
    {
      id: 's4',
      username: '@SeaRescue',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces',
      content: '🌊 Severe coastal erosion threatening homes in Goa. Emergency response teams on site. #CoastalErosion #ClimateChange',
      timestamp: '1 day ago',
      likes: 1560,
      comments: 112,
      shares: 421,
      trustScore: 87,
      category: 'Coastal Erosion'
    },
    {
      id: 's5',
      username: '@AquaticAlliance',
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=faces',
      content: '🧪 Chemical discharge detected in Mumbai harbor. Water quality tests show concerning levels of heavy metals. #WaterQuality #ChemicalPollution',
      timestamp: '2 days ago',
      likes: 2340,
      comments: 189,
      shares: 678,
      trustScore: 91,
      category: 'Chemical Pollution'
    },
    {
      id: 's6',
      username: '@TideTracker',
      avatar: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&h=100&fit=crop&crop=faces',
      content: '🌡️ Rising sea temperatures recorded in Bay of Bengal. Coral bleaching event likely. Marine protected areas on high alert. #CoralBleaching #ClimateChange',
      timestamp: '3 days ago',
      likes: 1780,
      comments: 98,
      shares: 356,
      trustScore: 89,
      category: 'Temperature Rise'
    },
    {
      id: 's7',
      username: '@WavesAndWonders',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
      content: '🐋 Mass stranding of dolphins reported near Vishakhapatnam. Investigation underway to determine cause. #MarineLife #DolphinStranding',
      timestamp: '4 days ago',
      likes: 3120,
      comments: 234,
      shares: 789,
      trustScore: 93,
      category: 'Marine Life'
    },
    {
      id: 's8',
      username: '@BluePlanetNews',
      avatar: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=100&h=100&fit=crop&crop=faces',
      content: '🌀 Microplastics found in 90% of seawater samples from Indian Ocean. New study reveals alarming levels. #Microplastics #OceanHealth',
      timestamp: '5 days ago',
      likes: 4560,
      comments: 312,
      shares: 1234,
      trustScore: 96,
      category: 'Microplastics'
    }
  ];

  // Analytics data
  const analyticsData = {
    totalPosts: 1247,
    totalEngagement: 45678,
    avgTrustScore: 91,
    topCategories: [
      { name: 'Plastic Pollution', value: 32 },
      { name: 'Oil Spill', value: 18 },
      { name: 'Algae Bloom', value: 15 },
      { name: 'Chemical Pollution', value: 12 },
      { name: 'Coastal Erosion', value: 10 },
      { name: 'Other', value: 13 }
    ],
    engagementMetrics: {
      likes: 28456,
      comments: 8765,
      shares: 8457
    }
  };

  return (
    <div className="py-6 lg:py-0 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Media Analytics</h1>
          <p className="text-gray-600">Monitor ocean hazard discussions across social platforms</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analyticsData.totalPosts.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analyticsData.totalEngagement.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analyticsData.avgTrustScore}%</p>
                <p className="text-sm text-gray-500">Avg Trust Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">+12%</p>
                <p className="text-sm text-gray-500">Vs Last Period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Engagement Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{analyticsData.engagementMetrics.likes.toLocaleString()}</p>
                  <p className="text-sm text-red-500">Likes</p>
                </div>
                <Heart className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{analyticsData.engagementMetrics.comments.toLocaleString()}</p>
                  <p className="text-sm text-blue-500">Comments</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{analyticsData.engagementMetrics.shares.toLocaleString()}</p>
                  <p className="text-sm text-green-500">Shares</p>
                </div>
                <Share2 className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-purple-600" />
            Hazard Category Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {analyticsData.topCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ 
                        backgroundColor: [
                          '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'
                        ][index % 6] 
                      }}
                    ></div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm font-bold">{category.value}%</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {analyticsData.topCategories.map((category, index) => {
                    const startAngle = analyticsData.topCategories.slice(0, index).reduce((sum, cat) => sum + cat.value, 0) * 3.6;
                    const endAngle = startAngle + category.value * 3.6;
                    const start = polarToCartesian(50, 50, 40, endAngle);
                    const end = polarToCartesian(50, 50, 40, startAngle);
                    const largeArcFlag = category.value > 50 ? 1 : 0;

                    return (
                      <path
                        key={index}
                        d={`M 50 50 L ${start.x} ${start.y} A 40 40 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`}
                        fill={[
                          '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'
                        ][index % 6]}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Posts Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2 text-orange-600" />
            Recent Ocean Hazard Discussions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {socialPosts.map((post) => (
              <div key={post.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                <div className="flex space-x-3">
                  <img 
                    src={post.avatar} 
                    alt={post.username} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{post.username}</h3>
                        <p className="text-sm text-gray-500">{post.timestamp}</p>
                      </div>
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <span>Trust: {post.trustScore}%</span>
                      </Badge>
                    </div>
                    <p className="mt-2 text-gray-700">{post.content}</p>
                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 className="h-4 w-4" />
                        <span>{post.shares.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function for pie chart
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

export default SocialMediaAnalytics;