import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Camera, MapPin, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useReports } from '../contexts/ReportsContext';
import { useToast } from '../hooks/use-toast';

const ReportFormModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Image, 2: Description, 3: Location (if needed), 4: Review
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    image: null,
    imagePreview: null,
    description: '',
    coords: null,
    address: '',
    timestamp: null
  });

  const { createReport } = useReports();
  const { toast } = useToast();
  const fileInputRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef();

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
          imagePreview: e.target.result,
          timestamp: new Date().toISOString()
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      setIsGettingLocation(true);

      // Get GPS coordinates first
      await getCurrentLocationForCamera();

      // Start camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please use photo upload instead.",
        variant: "destructive"
      });
      setIsCameraOpen(false);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      // Add GPS overlay to the image
      if (formData.coords && formData.coords.lat && formData.coords.lng) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, canvas.height - 80, canvas.width - 20, 70);

        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`📍 GPS: ${formData.coords.lat?.toFixed(6) || 'N/A'}, ${formData.coords.lng?.toFixed(6) || 'N/A'}`, 20, canvas.height - 50);
        ctx.fillText(`🕒 ${new Date().toLocaleString()}`, 20, canvas.height - 25);
      }

      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      setFormData(prev => ({
        ...prev,
        imagePreview: imageData,
        timestamp: new Date().toISOString()
      }));

      stopCamera();
    }
  };

  const getCurrentLocationForCamera = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        toast({
          title: "GPS not available",
          description: "Geolocation not supported on this device.",
          variant: "destructive"
        });
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };

          const address = await mockReverseGeocode(coords);

          setFormData(prev => ({
            ...prev,
            coords,
            address
          }));

          resolve(coords);
        },
        () => {
          toast({
            title: "GPS Error",
            description: "Could not get precise location. Using approximate location.",
            variant: "destructive"
          });
          // Use approximate location as fallback
          const fallbackCoords = { lat: 13.0827, lng: 80.2707, accuracy: 10000 };
          setFormData(prev => ({
            ...prev,
            coords: fallbackCoords,
            address: "Chennai, Tamil Nadu"
          }));
          resolve(fallbackCoords);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
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
      () => {
        toast({
          title: "Location error",
          description: "Could not get your location. Please enter manually.",
          variant: "destructive"
        });
      }
    );
  };

  const mockReverseGeocode = async (coords) => {
    // Enhanced mock reverse geocoding based on actual coordinates
    const { lat, lng } = coords;

    // Define city boundaries with realistic locations within 100m radius
    const cityLocations = {
      // Bangalore (12.9-13.1 lat, 77.4-77.7 lng)
      bangalore: {
        bounds: { latMin: 12.9, latMax: 13.1, lngMin: 77.4, lngMax: 77.7 },
        locations: ["Bangalore, Karnataka"]
      },
      // Mumbai (19.0-19.3 lat, 72.7-73.0 lng)
      mumbai: {
        bounds: { latMin: 19.0, latMax: 19.3, lngMin: 72.7, lngMax: 73.0 },
        locations: ["Mumbai, Maharashtra"]
      },
      // Delhi (28.4-28.8 lat, 76.8-77.3 lng)
      delhi: {
        bounds: { latMin: 28.4, latMax: 28.8, lngMin: 76.8, lngMax: 77.3 },
        locations: ["New Delhi, Delhi"]
      },
      // Chennai (12.8-13.2 lat, 80.1-80.3 lng)
      chennai: {
        bounds: { latMin: 12.8, latMax: 13.2, lngMin: 80.1, lngMax: 80.3 },
        locations: ["Chennai, Tamil Nadu"]
      },
      // Kolkata (22.4-22.7 lat, 88.2-88.5 lng)
      kolkata: {
        bounds: { latMin: 22.4, latMax: 22.7, lngMin: 88.2, lngMax: 88.5 },
        locations: ["Kolkata, West Bengal"]
      },
      // Hyderabad (17.3-17.5 lat, 78.3-78.6 lng)
      hyderabad: {
        bounds: { latMin: 17.3, latMax: 17.5, lngMin: 78.3, lngMax: 78.6 },
        locations: ["Hyderabad, Telangana"]
      },
      // Pune (18.4-18.7 lat, 73.7-74.0 lng)
      pune: {
        bounds: { latMin: 18.4, latMax: 18.7, lngMin: 73.7, lngMax: 74.0 },
        locations: ["Pune, Maharashtra"]
      },
      // Ahmedabad (22.9-23.2 lat, 72.4-72.7 lng)
      ahmedabad: {
        bounds: { latMin: 22.9, latMax: 23.2, lngMin: 72.4, lngMax: 72.7 },
        locations: ["Ahmedabad, Gujarat"]
      },
      // Kochi (9.8-10.1 lat, 76.2-76.4 lng)
      kochi: {
        bounds: { latMin: 9.8, latMax: 10.1, lngMin: 76.2, lngMax: 76.4 },
        locations: ["Kochi, Kerala"]
      },
      // Visakhapatnam (17.6-17.8 lat, 83.2-83.4 lng)
      visakhapatnam: {
        bounds: { latMin: 17.6, latMax: 17.8, lngMin: 83.2, lngMax: 83.4 },
        locations: ["Visakhapatnam, Andhra Pradesh"]
      }
    };

    // Find which city the coordinates belong to
    for (const [cityName, cityData] of Object.entries(cityLocations)) {
      const { bounds, locations } = cityData;
      if (lat >= bounds.latMin && lat <= bounds.latMax &&
        lng >= bounds.lngMin && lng <= bounds.lngMax) {
        // Return a random location from this city
        return locations[Math.floor(Math.random() * locations.length)];
      }
    }

    // Fallback for coordinates not in defined cities
    // Try to determine if it's coastal or inland based on coordinates
    const isCoastal = (
      (lng >= 68 && lng <= 70) || // West coast Gujarat/Maharashtra
      (lng >= 72.5 && lng <= 73.5 && lat >= 18 && lat <= 20) || // Mumbai coast
      (lng >= 79.5 && lng <= 81 && lat >= 12 && lat <= 14) || // Tamil Nadu coast
      (lng >= 82.5 && lng <= 85 && lat >= 17 && lat <= 18.5) || // Andhra coast
      (lng >= 75 && lng <= 76.5 && lat >= 9 && lat <= 12) // Kerala coast
    );

    if (isCoastal) {
      return "Coastal Area, India";
    } else {
      return "Unknown City, India";
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const reportData = {
        image: formData.imagePreview,
        description: formData.description || "Water hazard reported",
        visual_tag: "general_hazard",
        coords: formData.coords ? {
          latitude: formData.coords.lat,
          longitude: formData.coords.lng
        } : { latitude: 13.0827, longitude: 80.2707 }, // Default to Chennai
        address: formData.address || "Chennai, Tamil Nadu",
        alert_level: "medium"
      };

      // Close modal immediately for better UX
      resetForm();
      onClose();

      // Submit report (this will handle online/offline scenarios)
      await createReport(reportData);

      // Show success message
      toast({
        title: "Report submitted!",
        description: "Your report is being processed. Check the feed for progress updates.",
      });

    } catch (error) {
      console.error('Report submission error:', error);
      toast({
        title: "Report queued",
        description: "Your report has been saved and will be submitted when you're back online.",
        variant: "default"
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
    stopCamera();
    setFormData({
      image: null,
      imagePreview: null,
      description: '',
      coords: null,
      address: '',
      timestamp: null
    });
  };

  // Cleanup camera when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const canProceedToStep = (stepNumber) => {
    switch (stepNumber) {
      case 2:
        return formData.imagePreview;
      case 3:
        return true; // Description is optional
      case 4:
        return formData.coords || formData.address;
      default:
        return true;
    }
  };

  const getNextStep = (currentStep) => {
    if (currentStep === 2 && formData.coords) {
      // Skip location step if GPS already captured
      return 4; // Go directly to review
    }
    return currentStep + 1;
  };

  const getTotalSteps = () => {
    return formData.coords ? 3 : 4; // 3 steps if GPS captured, 4 if not
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-primary" />
              <span>Report Water Hazard</span>
            </DialogTitle>
            <div className="flex space-x-1">
              {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map((i) => (
                <div
                  key={i}
                  className={`h-2 w-6 rounded-full ${i <= (formData.coords && step >= 3 ? step - 1 : step) ? 'bg-primary' : 'bg-muted'
                    }`}
                />
              ))}
            </div>
          </div>
          <DialogDescription>
            Submit a report about water hazards or environmental concerns. Follow the steps to capture an image, add details, and submit your report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Image Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium mb-2">Take or Upload Photo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Capture the water hazard you want to report
                </p>
              </div>

              {isCameraOpen ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-80 object-cover rounded-lg bg-black"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* GPS Overlay */}
                  <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white p-2 rounded text-xs">
                    {isGettingLocation ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                        <span>Getting GPS location...</span>
                      </div>
                    ) : formData.coords ? (
                      <div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-red-400" />
                          <span>{formData.coords.lat?.toFixed(6) || 'N/A'}, {formData.coords.lng?.toFixed(6) || 'N/A'}</span>
                        </div>
                        <div className="text-xs opacity-90">
                          {formData.address}
                        </div>
                      </div>
                    ) : (
                      <span className="text-yellow-300">⚠️ GPS not available</span>
                    )}
                  </div>

                  {/* Camera Controls */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stopCamera}
                      className="bg-white/90 hover:bg-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="lg"
                      onClick={capturePhoto}
                      className="rounded-full w-16 h-16 bg-white hover:bg-gray-100 text-black"
                    >
                      <Camera className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              ) : formData.imagePreview ? (
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

                  {/* GPS Info on captured image */}
                  {formData.coords && (
                    <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white p-2 rounded text-xs">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-red-400" />
                        <span>{formData.coords.lat?.toFixed(6) || 'N/A'}, {formData.coords.lng?.toFixed(6) || 'N/A'}</span>
                      </div>
                      <div className="text-xs opacity-90">
                        {formData.address}
                      </div>
                    </div>
                  )}
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
                onChange={handleImageSelect}
                className="hidden"
              />

              {!isCameraOpen && !formData.imagePreview && (
                <div className="space-y-3">
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
                      className="flex-1"
                      onClick={startCamera}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                  
                  {/* Warning note */}
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500 text-sm">⚠️</span>
                      <div>
                        <p className="text-xs text-red-700 font-medium">Production Note:</p>
                        <p className="text-xs text-red-600 mt-1">
                          In the real-time application, users will only be able to capture photos using the app's camera to ensure authenticity and prevent fake reports from screenshots or downloaded images.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-medium mb-2">Add Description</h3>
                <p className="text-sm text-muted-foreground">
                  Optional: Describe what you observed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
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

          {/* Step 3: Location (only if GPS not captured) */}
          {step === 3 && !formData.coords && (
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
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">GPS Location Captured</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-mono text-green-700">
                      📍 {formData.coords.lat?.toFixed(6) || 'N/A'}, {formData.coords.lng?.toFixed(6) || 'N/A'}
                    </p>
                    <p className="text-xs text-green-600">
                      🎯 Accuracy: ±{formData.coords.accuracy?.toFixed(0) || 'N/A'}m
                    </p>
                    <p className="text-xs text-green-600">{formData.address}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3/4: Review */}
          {((step === 3 && formData.coords) || step === 4) && (
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
                    <span className="text-muted-foreground">Location:</span>
                    <span className="truncate ml-2">{formData.address}</span>
                  </div>
                  {formData.coords && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GPS:</span>
                      <span className="font-mono text-xs">
                        {formData.coords.lat?.toFixed(6) || 'N/A'}, {formData.coords.lng?.toFixed(6) || 'N/A'}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Description:</span>
                    <p className="mt-1 text-xs">{formData.description}</p>
                  </div>
                  {formData.timestamp && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Captured:</span>
                      <span className="text-xs">{new Date(formData.timestamp).toLocaleString()}</span>
                    </div>
                  )}
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
                const totalSteps = getTotalSteps();
                const currentStepForComparison = formData.coords && step >= 3 ? step - 1 : step;

                if (currentStepForComparison < totalSteps) {
                  const nextStep = getNextStep(step);
                  setStep(nextStep);
                } else {
                  handleSubmit();
                }
              }}
              disabled={!canProceedToStep(getNextStep(step)) || ((formData.coords && step >= 3) || step === 4) && isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </div>
              ) : ((formData.coords && step >= 3) || step === 4) ? 'Submit Report' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportFormModal;
