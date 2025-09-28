// API service for communicating with the backend

const API_BASE_URL = 'https://pipeline-1-sih.onrender.com';

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

    const response = await fetch(`${API_BASE_URL}/process`, {
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
  // In a real implementation, this would fetch reports from the backend
  // For now, we'll return mock data
  return [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600&h=400&fit=crop',
      location: 'Marina Beach, Chennai, Tamil Nadu, India',
      timestamp: '2025-09-26T14:15:00+05:30',
      trustScore: 62,
      status: 'processed',
      authorityReport: 'Authority report content would appear here.',
      publicAlert: 'Public alert content would appear here.',
      volunteerGuidance: 'Volunteer guidance content would appear here.'
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
      location: 'RK Beach, Visakhapatnam, Andhra Pradesh, India',
      timestamp: '2025-09-27T09:20:00+05:30',
      trustScore: 84,
      status: 'processed',
      authorityReport: 'Authority report content would appear here.',
      publicAlert: 'Public alert content would appear here.',
      volunteerGuidance: 'Volunteer guidance content would appear here.'
    }
  ];
};

export default {
  uploadReport,
  getReports
};