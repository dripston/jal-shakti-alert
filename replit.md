# OceanWatch - Ocean Hazard Reporting System

## Overview
OceanWatch is a crowd-sourced ocean hazard monitoring system built with React frontend and Express.js backend. It allows users to report ocean hazards through image uploads and GPS coordinates, which are processed through an AI pipeline for trust evaluation and automated report generation.

## Project Architecture

### Frontend (React + Vite)
- **Port**: 5000
- **Framework**: React 18 with Vite build system
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: React Context (AuthContext, ReportsContext, NotificationContext)
- **Key Features**:
  - Image upload with camera integration
  - GPS coordinate capture
  - Real-time processing status tracking
  - Interactive map visualization with Leaflet
  - Trust scoring system
  - Offline queue support with localforage

### Backend (Express.js)
- **Port**: 3001
- **Database**: SQLite with initialization scripts
- **Key Features**:
  - Multipart form data handling for image uploads
  - SIH Pipeline integration for AI processing
  - CORS configuration for frontend communication
  - Rate limiting and security middleware
  - User authentication and management

### External Integration
- **SIH Pipeline**: `https://pipeline-1-sih.onrender.com/process`
  - Expects multipart form data with `image` file and `gps` JSON string
  - Returns processed results with trust scores and automated reports

## Recent Changes (Project Import Setup)

### Dependencies Installed
- Frontend: All React dependencies via npm
- Backend: Added node-fetch@2 and form-data for pipeline integration

### Configuration Updates
1. **Vite Config**: Updated to allow all hosts for Replit proxy (`allowedHosts: true`)
2. **Backend CORS**: Configured to accept requests from frontend on port 5000
3. **Pipeline Integration**: Fixed to use proper multipart form data format
4. **Data Storage**: Cleared cached mock data, starts with clean slate

### Database Setup
- Initialized SQLite database with admin user
- Default credentials: admin/admin123 (change in production)
- Test user: testuser/test123

### Deployment Configuration
- **Target**: Autoscale (stateless web app)
- **Build**: `npm run build`
- **Run**: Backend and frontend served together

## Project Structure
```
├── backend/               # Express.js backend
│   ├── routes/           # API routes (auth, reports, users)
│   ├── config/          # Database configuration
│   ├── scripts/         # Database initialization
│   └── server.js        # Main server file
├── src/                 # React frontend
│   ├── components/      # Reusable UI components
│   ├── pages/          # Application pages
│   ├── contexts/       # React context providers
│   ├── services/       # API service layer
│   └── hooks/          # Custom React hooks
├── public/             # Static assets
└── package.json        # Frontend dependencies
```

## User Preferences
- Clean, modern UI with ocean-themed design
- Real-time processing feedback with progress indicators
- Offline-first approach with queue synchronization
- No mock data - only real pipeline results
- Trust scoring system for report validation

## Development Workflow
1. Frontend runs on port 5000 (user-facing)
2. Backend runs on port 3001 (API server)
3. Reports uploaded via frontend → backend → SIH pipeline → results displayed
4. All hosts allowed for Replit proxy environment
5. SQLite database for user management and local data

## Key Features Working
✅ Image upload with multipart form data  
✅ GPS coordinate capture and transmission  
✅ SIH Pipeline integration with proper data format  
✅ Real-time processing status updates  
✅ Trust score evaluation and display  
✅ Clean UI without mock data interference  
✅ User authentication system  
✅ Offline queue support  
✅ Interactive map visualization  

## Next Steps for Production
1. Update production domain in CORS configuration
2. Change default admin password
3. Configure environment variables for sensitive data
4. Set up proper logging and monitoring
5. Add backup strategy for SQLite database