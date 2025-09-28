# Jal Shakti Alert - React Frontend Implementation

This document describes the implementation of the React frontend for the Jal Shakti Alert ocean hazard reporting application.

## Features Implemented

### 1. Upload Flow
- Users can upload hazard reports with images and GPS coordinates
- Reports are immediately shown in the feed with a "Pending" status
- Data is sent to the backend API as multipart/form-data

### 2. Pipeline Progress UI
- Stepwise progress bar showing the report processing status:
  - ✅ Uploaded
  - ⚙️ Processing Visual Summary
  - 🌦️ Processing Weather Data
  - 🤖 Running Trust Evaluation
  - 📊 Generating Reports
- Real-time updates until the API response is received

### 3. Post Update
- Once the API response is received, the feed item is updated with:
  - User-uploaded image
  - Geo-tagged location with address
  - Timestamp
  - Trust score with reasoning
  - Generated reports (authority_report, public_alert, volunteer_guidance)

### 4. Notifications
- In-app notifications when the trust score is ready
- Red warning icon ⚠️ for trust scores < 50%
- Green verified tick ✅ for trust scores ≥ 50%

### 5. Global Visibility
- All uploaded posts are visible to everyone in the feed
- Near real-time updates through simulated polling

### 6. UI/UX
- Mobile-first responsive design
- Social media card layout for reports
- Indian traditional theme with warm earthy colors (saffron, green, beige)
- Offline mode support with queueing for later sync

## Technical Implementation

### Architecture
- **Context API** for state management
- **React.createElement** for JSX-free implementation
- **Tailwind CSS** for styling with custom color palette
- **Service layer** for API communication

### Components
1. **ReportsContext** - Manages report state and API communication
2. **NotificationContext** - Handles in-app notifications
3. **ReportForm** - Form for submitting new hazard reports
4. **ReportProgress** - Shows processing status of pending reports
5. **ProcessedReport** - Displays fully processed reports
6. **Notification** - In-app notification system

### Services
- **api.js** - Handles communication with the backend API

### Color Palette
- **Saffron** - Primary color (#e65c31)
- **Green** - Success states (#22c55e)
- **Beige** - Backgrounds (#f6f0c9)

## Integration with Backend
The frontend is designed to integrate with the backend API at:
`https://pipeline-1-sih.onrender.com/process`

### API Endpoints
- **POST /process** - Submit a new hazard report

## Offline Support
- Reports are queued when offline
- Automatic submission when connection is restored
- Visual indicator for offline status

## Local Storage
- Reports are persisted in localStorage
- Notifications are persisted in localStorage
- Settings are persisted in localStorage

## Future Enhancements
1. WebSocket integration for real-time updates
2. Push notifications
3. Enhanced offline capabilities with IndexedDB
4. Progressive Web App (PWA) support
5. Advanced filtering and search capabilities