// API service for communicating with the backend

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Relative path for same-origin in production
  : 'http://localhost:3001/api';

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
    const response = await fetch(`${API_BASE_URL}/reports`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching reports:', error);
    return []; // Return empty array instead of mock data
  }
};

export default {
  uploadReport,
  getReports
};