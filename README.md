# Pragyan Chakra - Smart Water Management System

A comprehensive water management and hazard reporting platform built for Smart India Hackathon.

## 🌟 Features

- **Real-time Water Hazard Reporting**: Community-driven reporting system
- **AI-Powered Analysis**: Integration with SIH pipeline for intelligent processing
- **Multi-Role Dashboards**: Separate interfaces for authorities, volunteers, and users
- **Offline Support**: Works offline with automatic sync when online
- **Responsive Design**: Optimized for both mobile and desktop
- **Social Features**: Community engagement with likes, comments, and sharing

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **UI Components**: Radix UI, Shadcn/ui
- **State Management**: React Context API
- **Storage**: LocalForage for offline support
- **Maps**: Leaflet for interactive mapping
- **Deployment**: Vercel (Full-stack)

## 📱 User Roles

### 1. Community Users
- Report water hazards with photos and GPS
- View community feed with social features
- Track personal reporting statistics

### 2. Authorities
- Review and verify reports
- Access detailed analysis and weather data
- Coordinate emergency response
- Assign tasks to volunteers

### 3. Volunteers
- Accept and manage assigned tasks
- Access safety guidelines and instructions
- Coordinate field operations

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pragyan-chakra
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Update the environment variables as needed
```

4. Start development servers:
```bash
# Start both frontend and backend
npm run dev:full

# Or start individually
npm run dev          # Frontend only
npm run dev:backend  # Backend only
```

## 🌐 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy with automatic builds

### Environment Variables

```env
NODE_ENV=production
VITE_API_URL=/api
```

## 📊 SIH Pipeline Integration

The system integrates with the Smart India Hackathon pipeline for:
- Image analysis and hazard detection
- Weather data correlation
- Trust score calculation
- Automated report generation

## 🔧 API Endpoints

- `POST /api/reports/process` - Submit report for processing
- `GET /api/reports` - Fetch all reports
- `POST /api/reports/save` - Save processed report
- `GET /api/reports/health` - Health check

## 🎨 Design System

The application uses a custom design system inspired by Indian traditional elements:
- Saffron and blue color palette
- Responsive typography
- Accessible UI components
- Mobile-first approach

## 📱 Progressive Web App

- Offline functionality
- Push notifications
- App-like experience on mobile
- Automatic updates

## 🔒 Security Features

- Input validation and sanitization
- CORS protection
- Rate limiting
- Secure file uploads

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is developed for Smart India Hackathon 2024.

## 👥 Team

Pragyan Chakra Development Team - SIH 2024

---

Built with ❤️ for Smart Water Management