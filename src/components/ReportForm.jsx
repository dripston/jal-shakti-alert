import React, { useState, useRef } from 'react';
import { Camera, MapPin, Upload, WifiOff } from 'lucide-react';
import { useReports } from '../contexts/ReportsContext';

const ReportForm = ({ onReportSubmit }) => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [coords, setCoords] = useState(null);
  const fileInputRef = useRef(null);
  const { createReport, isOnline } = useReports();

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image || !coords) {
      alert('Please provide an image and location');
      return;
    }

    const reportData = {
      image: imagePreview,
      gps: {
        coords,
        timestamp: Date.now()
      }
    };

    try {
      const newReport = await createReport(reportData);
      onReportSubmit(newReport);
      // Reset form
      setImage(null);
      setImagePreview(null);
      setCoords(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      // Error handling is now done in the ReportsContext
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-orange-800 mb-4">Report Ocean Hazard</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer bg-orange-50 hover:bg-orange-100">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-10 h-10 text-orange-500 mb-2" />
                  <p className="text-sm text-orange-600">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageCapture}
              />
            </label>
          </div>
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="w-full flex items-center justify-center px-4 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <MapPin className="h-5 w-5 mr-2" />
            {isGettingLocation ? 'Getting Location...' : coords ? 'Location Captured' : 'Get Current Location'}
          </button>
          {coords && (
            <p className="mt-2 text-sm text-green-600">
              Location: {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
            </p>
          )}
        </div>

        {/* Offline indicator */}
        {!isOnline && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-center">
            <WifiOff className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm text-red-700">You are offline. Report will be queued and sent when online.</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!image || !coords}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="h-5 w-5 mr-2" />
          {isOnline ? 'Submit Report' : 'Queue Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;