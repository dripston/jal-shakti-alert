# OceanWatch - Ocean Hazard Monitoring System

## Overview
OceanWatch is a crowd-sourced ocean hazard monitoring and reporting system that allows users to report maritime emergencies, pollution incidents, and other ocean-related hazards. The system uses AI-powered analysis through the SIH (Smart India Hackathon) pipeline to process images and generate trust scores, weather analysis, and response reports.

## Project Architecture

### Frontend (React + Vite)
- **Port**: 5000 (configured for Replit proxy)
- **Framework**: React 18.3.1 with Vite 5.4.19
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: React Context API
- **Features**: 
  - User authentication and registration
  - Real-time report submission with camera/file upload
  - Interactive map visualization with Leaflet
  - Progressive Web App (PWA) capabilities
  - Offline queueing for reports

### Backend (Node.js + Express)
- **Port**: 3001 (localhost)
- **Database**: SQLite with pre-configured tables
- **API Integration**: Proxies requests to SIH Pipeline (https://pipeline-1-sih.onrender.com)
- **Security**: Helmet, CORS, rate limiting, input validation
- **File Handling**: Multer for multipart form uploads

### Database Schema
- **Users**: Authentication, profiles, trust ratings
- **Reports**: Ocean hazard reports with processing status
- **Admin**: System administration and moderation

## Key Features Fixed in Replit Environment

### 1. SIH Pipeline Integration
- **Fixed multipart form data handling** in backend
- **Removed direct frontend calls** to external API
- **Proper proxy through backend** with error handling
- **Real GPS coordinates and image processing**

### 2. Mock Data Removal
- **Cleared localStorage cache** that showed fake reports
- **Removed hardcoded sample data** from initialization
- **Clean app startup** with no pre-loaded content

### 3. Replit Compatibility
- **Frontend configured** with `allowedHosts: true` for proxy environment
- **CORS properly set** for localhost:5000 frontend
- **Host binding**: Frontend on 0.0.0.0:5000, Backend on localhost:3001

## Development Setup

### Credentials
- **Admin User**: admin / admin123 ⚠️ Change in production
- **Test User**: testuser / test123
- **Demo Login**: demo@oceanwatch.in / demo123

### Running the Application
1. **Frontend**: Automatically starts on port 5000
2. **Backend**: Automatically starts on port 3001
3. **Database**: SQLite initialized with tables and users

### API Endpoints
- `GET /api/health` - System health check
- `POST /api/reports/process` - Submit report for SIH pipeline analysis
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration

## Deployment Configuration
- **Type**: Autoscale (stateless web application)
- **Build**: `npm run build` (Vite production build)
- **Run**: Parallel backend + frontend preview servers

## Recent Changes (September 28, 2025)
- ✅ Fixed SIH pipeline integration with proper multipart form data
- ✅ Implemented backend proxy for external API calls
- ✅ Removed mock data showing on app initialization
- ✅ Configured Replit environment compatibility
- ✅ Set up proper workflows for development
- ✅ Initialized SQLite database with admin/test users
- ✅ Configured deployment settings for production

## User Preferences
- **Clean initialization**: No mock data on startup
- **Real API integration**: All calls go through backend proxy
- **Proper error handling**: Network issues gracefully handled
- **Replit optimized**: Host settings configured for proxy environment

## Next Steps
- Change default admin password in production
- Add environment variables for API URLs
- Implement proper user management and permissions
- Add monitoring and logging for production deployment