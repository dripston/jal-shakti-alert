const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
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

// Get all reports
router.get('/', async (req, res) => {
  try {
    db.all(
      'SELECT * FROM reports ORDER BY created_at DESC LIMIT 100',
      [],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ 
            error: 'Failed to fetch reports',
            message: process.env.NODE_ENV === 'development' ? err.message : 'Database error'
          });
        }
        
        console.log(`Fetched ${rows.length} reports from database`);
        res.json(rows || []);
      }
    );
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ 
      error: 'Failed to fetch reports',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Save processed report to database
router.post('/save', async (req, res) => {
  try {
    const report = req.body;
    
    // Add ID if not present
    if (!report.id) {
      report.id = `r_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Extract fields for database insertion
    const {
      id, 
      user_id = 'anonymous',
      image_url = null,
      image_data = null,
      latitude = null,
      longitude = null,
      accuracy = null,
      address = null,
      description = report.description || '',
      visual_tag = report.visual_tag || null,
      alert_level = report.alert_level || 'medium',
      trust_score = report.trust_score || 50,
      status = 'pending',
      agents_analysis = JSON.stringify(report.agents_analysis || {})
    } = report;
    
    // Insert into database
    db.run(
      `INSERT INTO reports (
        id, user_id, image_url, image_data, latitude, longitude, 
        accuracy, address, description, visual_tag, alert_level, 
        trust_score, status, agents_analysis
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, user_id, image_url, image_data, latitude, longitude,
        accuracy, address, description, visual_tag, alert_level,
        trust_score, status, agents_analysis
      ],
      function(err) {
        if (err) {
          console.error('Database error saving report:', err);
          return res.status(500).json({ 
            error: 'Failed to save report',
            message: process.env.NODE_ENV === 'development' ? err.message : 'Database error'
          });
        }
        
        console.log(`Saved report ${id} to database`);
        
        res.json({ 
          success: true, 
          reportId: id,
          message: 'Report saved successfully'
        });
      }
    );
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ 
      error: 'Failed to save report',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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