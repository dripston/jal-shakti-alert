import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Camera, MapPin, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useReports } from '../contexts/ReportsContext';
import { useToast } from '../hooks/use-toast';

const ReportFormModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Image, 2: Details, 3: Location, 4: Review
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    image: null,
    imagePreview: null,
    description: '',
    visual_tag: '',
    coords: null,
    address: ''
  });

  const { createReport } = useReports();
  const { toast } = useToast();
  const fileInputRef = useRef();

  const visualTags = [
    { value: 'oil_slick', label: 'Oil Slick' },
    { value: 'marine_debris', label: 'Marine Debris' },
    { value: 'algae_bloom', label: 'Algae Bloom' },
    { value: 'coastal_erosion', label: 'Coastal Erosion' },
    { value: 'chemical_spill', label: 'Chemical Spill' },
    { value: 'dead_fish', label: 'Dead Fish' },
    { value: 'plastic_pollution', label: 'Plastic Pollution' },
    { value: 'unusual_coloration', label: 'Unusual Water Color' },
    { value: 'storm_damage', label: 'Storm Damage' },
    { value: 'other', label: 'Other Hazard' }
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Please enter your location manually.",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Mock reverse geocoding
        const address = await mockReverseGeocode(coords);
        
        setFormData(prev => ({
          ...prev,
          coords,
          address
        }));
        
        toast({
          title: "Location detected",
          description: `Located at ${address}`,
        });
      },
      (error) => {
        toast({
          title: "Location error",
          description: "Could not get your location. Please enter manually.",
          variant: "destructive"
        });
      }
    );
  };

  const mockReverseGeocode = async (coords) => {
    // Mock reverse geocoding - in real app, use proper service
    const locations = [
      "Marina Beach, Chennai, Tamil Nadu",
      "RK Beach, Visakhapatnam, Andhra Pradesh", 
      "Fort Kochi Beach, Kerala",
      "Panambur Beach, Mangalore, Karnataka",
      "Juhu Beach, Mumbai, Maharashtra"
    ];
    
    return locations[Math.floor(Math.random() * locations.length)] + ", India";
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const reportData = {
        image: formData.imagePreview, // In real app, upload to server first
        description: formData.description,
        visual_tag: formData.visual_tag,
        coords: formData.coords || { lat: 13.0827, lng: 80.2707 }, // Default to Chennai
        address: formData.address || "Marina Beach, Chennai, India",
        alert_level: getAlertLevel(formData.visual_tag)
      };

      await createReport(reportData);
      
      toast({
        title: "Report submitted!",
        description: "Your ocean hazard report has been created successfully.",
      });
      
      onClose();
      resetForm();
      
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit report. It has been saved for later sync.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAlertLevel = (tag) => {
    const highAlert = ['chemical_spill', 'oil_slick', 'dead_fish'];
    const mediumAlert = ['algae_bloom', 'coastal_erosion', 'marine_debris'];
    
    if (highAlert.includes(tag)) return 'high';
    if (mediumAlert.includes(tag)) return 'medium';
    return 'low';
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      image: null,
      imagePreview: null,
      description: '',
      visual_tag: '',
      coords: null,
      address: ''
    });
  };

  const canProceedToStep = (stepNumber) => {
    switch (stepNumber) {
      case 2:
        return formData.imagePreview;
      case 3:
        return formData.description && formData.visual_tag;
      case 4:
        return formData.coords || formData.address;
      default:
        return true;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-primary" />
              <span>Report Ocean Hazard</span>
            </DialogTitle>
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-6 rounded-full ${
                    i <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Image Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium mb-2">Take or Upload Photo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Capture the ocean hazard you want to report
                </p>
              </div>

              {formData.imagePreview ? (
                <div className="relative">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: null }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Tap to select photo from gallery
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Photo
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.capture = 'environment';
                    input.onchange = handleImageSelect;
                    input.click();
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-medium mb-2">Describe the Hazard</h3>
                <p className="text-sm text-muted-foreground">
                  Provide details about what you observed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visual_tag">Hazard Type</Label>
                <Select 
                  value={formData.visual_tag} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, visual_tag: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hazard type" />
                  </SelectTrigger>
                  <SelectContent>
                    {visualTags.map((tag) => (
                      <SelectItem key={tag.value} value={tag.value}>
                        {tag.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you see... (e.g., size, severity, impact on marine life)"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-medium mb-2">Location Information</h3>
                <p className="text-sm text-muted-foreground">
                  Help us pinpoint the hazard location
                </p>
              </div>

              <Button
                variant="outline"
                onClick={getCurrentLocation}
                className="w-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>

              <div className="text-center text-sm text-muted-foreground">or</div>

              <div className="space-y-2">
                <Label htmlFor="address">Address / Description</Label>
                <Input
                  id="address"
                  placeholder="e.g., Marina Beach, Chennai"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              {formData.coords && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Location detected:</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {formData.coords.lat.toFixed(4)}, {formData.coords.lng.toFixed(4)}
                  </p>
                  <p className="text-xs text-muted-foreground">{formData.address}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-medium mb-2">Review & Submit</h3>
                <p className="text-sm text-muted-foreground">
                  Please review your report before submitting
                </p>
              </div>

              <div className="space-y-3">
                {formData.imagePreview && (
                  <img
                    src={formData.imagePreview}
                    alt="Report"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{formData.visual_tag?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="truncate ml-2">{formData.address}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Description:</span>
                    <p className="mt-1 text-xs">{formData.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <p className="text-xs text-blue-700">
                    Your report will be analyzed by AI agents and shared with the community.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>

            <Button
              onClick={() => {
                if (step < 4) {
                  setStep(step + 1);
                } else {
                  handleSubmit();
                }
              }}
              disabled={!canProceedToStep(step + 1) || (step === 4 && isSubmitting)}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </div>
              ) : step === 4 ? 'Submit Report' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportFormModal;