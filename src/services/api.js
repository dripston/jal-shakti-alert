// API service for communicating with the backend

const API_BASE_URL = import.meta.env.PROD 
  ? '/api'  // Relative path for same-origin in production
  : import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const uploadReport = async (imageData, gps) => {
  try {
    const formData = new FormData();
    
    // Convert base64 image to blob if needed
    let imageFile;
    if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      imageFile = new File([blob], 'report-image.jpg', { type: 'image/jpeg' });
    } else if (imageData instanceof File) {
      imageFile = imageData;
    } else {
      throw new Error('Invalid image format');
    }
    
    formData.append('image', imageFile);
    formData.append('gps', JSON.stringify(gps));
    
    // Add additional fields that backend expects
    if (gps.coords) {
      formData.append('latitude', gps.coords.latitude);
      formData.append('longitude', gps.coords.longitude);
      if (gps.coords.accuracy) {
        formData.append('accuracy', gps.coords.accuracy);
      }
    }

    const response = await fetch(`${API_BASE_URL}/reports/process`, {
      method: 'POST',
      body: formData,
      // Add headers to handle CORS
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading report:', error);
    // Check if it's a CORS error or network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error - please check your connection and try again');
    }
    throw error;
  }
};

export const getReports = async () => {
  // Fetch reports from backend API
  try {
    console.log('Fetching reports from:', `${API_BASE_URL}/reports`);
    
    const response = await fetch(`${API_BASE_URL}/reports`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get reports failed:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const reports = await response.json();
    console.log(`Fetched ${reports.length} reports from database`);
    return reports;
  } catch (error) {
    console.error('Error fetching reports:', error);
    return []; // Return empty array instead of mock data
  }
};

export const saveReport = async (report) => {
  try {
    console.log('Saving report to database:', report.id);
    console.log('API URL:', `${API_BASE_URL}/reports/save`);
    
    const response = await fetch(`${API_BASE_URL}/reports/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(report)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Save report failed:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Report saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
};

export default {
  uploadReport,
  getReports,
  saveReport
};