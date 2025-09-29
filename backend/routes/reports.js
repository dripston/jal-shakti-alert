const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
const { db, ensureInitialized } = require('../config/database');
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
    // Ensure database is initialized
    await ensureInitialized();
    
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
        
        // Transform database rows to match frontend expectations
        const transformedReports = (rows || []).map(row => {
          let agents_analysis = {};
          try {
            agents_analysis = JSON.parse(row.agents_analysis || '{}');
          } catch (e) {
            console.warn('Failed to parse agents_analysis for report', row.id);
          }
          
          return {
            id: row.id,
            userId: row.user_id,
            timestamp: row.created_at,
            image: row.image_data,
            coords: {
              latitude: row.latitude,
              longitude: row.longitude,
              accuracy: row.accuracy
            },
            address: row.address,
            location: row.address,
            description: row.description,
            visual_tag: row.visual_tag,
            alert_level: row.alert_level,
            trustScore: row.trust_score,
            trust_score: row.trust_score, // Include both for compatibility
            status: row.status,
            likes: 0, // Default values for social features
            comments: 0,
            shares: 0,
            // Include all the analysis data
            visualSummary: agents_analysis.visualSummary,
            weatherSummary: agents_analysis.weatherSummary,
            authorityReport: agents_analysis.authorityReport,
            publicAlert: agents_analysis.publicAlert,
            volunteerGuidance: agents_analysis.volunteerGuidance,
            pipelineStatus: agents_analysis.pipelineStatus,
            rejectionReason: agents_analysis.rejectionReason,
            errorMessage: agents_analysis.errorMessage,
            progress: agents_analysis.progress || (row.status === 'processed' ? 100 : 0),
            processingStep: agents_analysis.processingStep || (row.status === 'processed' ? 5 : 0),
            // Include the raw agents data for compatibility
            agents: agents_analysis
          };
        });
        
        console.log(`Fetched ${transformedReports.length} reports from database`);
        res.json(transformedReports);
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
    // Ensure database is initialized
    await ensureInitialized();
    
    const report = req.body;
    
    // Add ID if not present
    if (!report.id) {
      report.id = `r_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Extract fields for database insertion
    const {
      id, 
      userId: user_id = 'anonymous',
      image = null,
      coords = null,
      address = null,
      description = report.description || '',
      visual_tag = report.visual_tag || null,
      alert_level = report.alert_level || 'medium',
      trustScore = null,
      trust_score = null,
      status = 'pending',
      visualSummary = null,
      weatherSummary = null,
      authorityReport = null,
      publicAlert = null,
      volunteerGuidance = null,
      location = null,
      pipelineStatus = null,
      rejectionReason = null,
      errorMessage = null
    } = report;
    
    // Handle coordinates
    const latitude = coords?.latitude || coords?.coords?.latitude || null;
    const longitude = coords?.longitude || coords?.coords?.longitude || null;
    const accuracy = coords?.accuracy || coords?.coords?.accuracy || null;
    
    // Handle trust score (use whichever is available)
    const finalTrustScore = trustScore || trust_score || 50;
    
    // Handle image data
    const image_data = typeof image === 'string' ? image : null;
    const image_url = null; // We'll store base64 in image_data for now
    
    // Create comprehensive agents analysis
    const agents_analysis = JSON.stringify({
      visualSummary: visualSummary || report.visualSummary,
      weatherSummary: weatherSummary || report.weatherSummary,
      authorityReport: authorityReport || report.authorityReport,
      publicAlert: publicAlert || report.publicAlert,
      volunteerGuidance: volunteerGuidance || report.volunteerGuidance,
      pipelineStatus: pipelineStatus || report.pipelineStatus,
      rejectionReason: rejectionReason || report.rejectionReason,
      errorMessage: errorMessage || report.errorMessage,
      timestamp: report.timestamp,
      progress: report.progress,
      processingStep: report.processingStep
    });
    
    // Insert into database with REPLACE to handle updates
    db.run(
      `INSERT OR REPLACE INTO reports (
        id, user_id, image_url, image_data, latitude, longitude, 
        accuracy, address, description, visual_tag, alert_level, 
        trust_score, status, agents_analysis
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, user_id, image_url, image_data, latitude, longitude,
        accuracy, address || location, description, visual_tag, alert_level,
        finalTrustScore, status, agents_analysis
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