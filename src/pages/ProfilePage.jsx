import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { useReports } from '../contexts/ReportsContext';
import { useToast } from '../hooks/use-toast';
import { 
  User, 
  MapPin, 
  Calendar, 
  Award, 
  Edit3, 
  Save, 
  X,
  Camera,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import PostCard from '../components/PostCard';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { allReports } = useReports();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Asha R.',
    bio: user?.bio || 'Fisherfolk·Citizen Scientist·Coastal Watch',
    location: user?.location || 'Chennai, India'
  });

  // Add dummy data if no user reports exist
  const userReports = allReports && allReports.length > 0 
    ? allReports.filter(report => 
        report.userId === user?.id || report.user_id === user?.id
      ) 
    : [
        {
          id: 'r1',
          userId: 'u1',
          image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600&h=400&fit=crop',
          coords: { lat: 13.0827, lng: 80.2707 },
          address: 'Marina Beach, Chennai, Tamil Nadu, India',
          timestamp: '2025-09-26T14:15:00+05:30',
          visual_tag: 'oil_slick',
          description: 'Large oil slick spotted near the fishing area. Affecting local marine life.',
          trust_score: 62,
          status: 'queued',
          likes: 8,
          comments: 3,
          shares: 2,
          alert_level: 'medium'
        },
        {
          id: 'r2',
          userId: 'u1',
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
          coords: { lat: 17.6868, lng: 83.2185 },
          address: 'RK Beach, Visakhapatnam, Andhra Pradesh, India',
          timestamp: '2025-09-27T09:20:00+05:30',
          visual_tag: 'marine_debris',
          description: 'Massive plastic debris accumulation after yesterday\'s storm. Immediate cleanup needed.',
          trust_score: 84,
          status: 'synced',
          likes: 15,
          comments: 7,
          shares: 5,
          alert_level: 'high'
        }
      ];
  
  console.log('User ID:', user?.id);
  console.log('All reports:', allReports?.length);
  console.log('User reports:', userReports?.length);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || 'Asha R.',
      bio: user?.bio || 'Fisherfolk·Citizen Scientist·Coastal Watch',
      location: user?.location || 'Chennai, India'
    });
    setIsEditing(false);
  };

  // Use dummy user data if no user is found
  const displayUser = user || {
    id: 'u1',
    name: 'Asha R.',
    handle: 'asha_coast',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces',
    bio: 'Fisherfolk·Citizen Scientist·Coastal Watch',
    trust_rating: 78,
    location: 'Chennai, India',
    reports_count: 23,
    verified: true,
    joined: '2024-01-15T00:00:00+05:30'
  };

  return (
    <div className="py-6 lg:py-0 space-y-6 px-4 lg:px-0">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <img
                src={displayUser.avatar}
                alt={displayUser.name}
                className="w-20 h-20 rounded-full border-4 border-primary/20"
              />
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 p-2 rounded-full"
              >
                <Camera className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex-1 space-y-3">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-sm">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio" className="text-sm">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location" className="text-sm">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-heading font-bold">{displayUser.name}</h1>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">@{displayUser.handle}</p>
                  <p className="text-sm">{displayUser.bio}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{displayUser.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(displayUser.joined).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <div className={`rounded-full px-3 py-1 text-sm font-medium ${
                      displayUser.trust_rating >= 71 ? 'trust-score-high' :
                      displayUser.trust_rating >= 41 ? 'trust-score-medium' : 'trust-score-low'
                    }`}>
                      Trust: {displayUser.trust_rating}%
                    </div>
                    
                    {displayUser.verified && (
                      <Badge variant="secondary" className="text-blue-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">{userReports.length}</div>
              <p className="text-sm text-muted-foreground">Total Reports</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {userReports.filter(r => r.status === 'verified').length}
              </div>
              <p className="text-sm text-muted-foreground">Verified Reports</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-primary" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Award className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium">First Reporter</p>
              <p className="text-sm text-muted-foreground">Submitted your first ocean hazard report</p>
            </div>
          </div>
          
          {displayUser.trust_rating >= 80 && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Trusted Reporter</p>
                <p className="text-sm text-muted-foreground">Achieved high trust rating (80%+)</p>
              </div>
            </div>
          )}

          {userReports.length >= 10 && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Active Contributor</p>
                <p className="text-sm text-muted-foreground">Submitted 10+ reports</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Your Recent Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {userReports.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">No reports yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start contributing to ocean conservation by reporting hazards
              </p>
              <Button size="sm">
                Create First Report
              </Button>
            </div>
          ) : (
            userReports.slice(0, 3).map(report => (
              <PostCard 
                key={report.id} 
                report={report}
                compact={true}
                onViewOnMap={(report) => {
                  localStorage.setItem('selectedReport', JSON.stringify(report));
                  window.location.href = '/map';
                }}
              />
            ))
          )}
          
          {userReports.length > 3 && (
            <div className="text-center pt-4">
              <Button variant="outline" size="sm">
                View All Reports ({userReports.length})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impact Summary */}
      {userReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {userReports.reduce((sum, report) => sum + (report.likes || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total Likes</p>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {userReports.reduce((sum, report) => sum + (report.shares || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">Times Shared</p>
              </div>
            </div>

            <div className="pt-3 border-t">
              <p className="text-sm text-center text-muted-foreground">
                Thank you for helping protect our oceans! 🌊
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;