const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
const router = express.Router();

// Configure multer for handling multipart form uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// SIH Pipeline API endpoint
const SIH_PIPELINE_URL = 'https://pipeline-1-sih.onrender.com';

// Process report endpoint - proxies to SIH pipeline with multipart form data
router.post('/process', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!req.body.gps) {
      return res.status(400).json({ error: 'GPS data is required' });
    }

    // Parse GPS data
    let gpsData;
    try {
      gpsData = typeof req.body.gps === 'string' ? JSON.parse(req.body.gps) : req.body.gps;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid GPS data format' });
    }

    // Create FormData for SIH pipeline
    const formData = new FormData();
    
    // Add image file
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    
    // Add GPS data as JSON string (as expected by the pipeline)
    formData.append('gps', JSON.stringify(gpsData));

    console.log('Sending request to SIH pipeline:', SIH_PIPELINE_URL + '/process');
    console.log('GPS data:', JSON.stringify(gpsData));
    console.log('Image file:', req.file.originalname, req.file.mimetype, req.file.size, 'bytes');

    // Send to SIH pipeline
    const pipelineResponse = await fetch(`${SIH_PIPELINE_URL}/process`, {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 60000, // 60 second timeout
    });

    if (!pipelineResponse.ok) {
      const errorText = await pipelineResponse.text();
      console.error('SIH Pipeline error:', pipelineResponse.status, errorText);
      return res.status(pipelineResponse.status).json({ 
        error: 'Pipeline processing failed',
        details: errorText 
      });
    }

    const result = await pipelineResponse.json();
    console.log('SIH Pipeline response:', result);

    // Return the pipeline result
    res.json(result);

  } catch (error) {
    console.error('Error processing report:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Pipeline service temporarily unavailable',
        message: 'Please try again later'
      });
    }
    
    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({ 
        error: 'Processing timeout',
        message: 'The request took too long to process'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Processing failed'
    });
  }
});

// Health check for reports service
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'reports',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;