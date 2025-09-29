import React from 'react';
import { Check, Settings, Cloud, Bot, BarChart } from 'lucide-react';

const ReportProgress = ({ report }) => {
  const getStepIcon = (step) => {
    switch(step) {
      case 1: return Check;
      case 2: return Settings;
      case 3: return Cloud;
      case 4: return Bot;
      case 5: return BarChart;
      default: return null;
    }
  };

  const getStepLabel = (step) => {
    switch(step) {
      case 0: return 'Preparing submission...';
      case 1: return 'Image uploaded successfully';
      case 2: return 'AI analyzing visual content...';
      case 3: return 'Checking weather conditions...';
      case 4: return 'Calculating trust score...';
      case 5: return 'Generating final reports';
      default: return '';
    }
  };

  const getStepDescription = (step) => {
    switch(step) {
      case 0: return 'Getting ready to process your report';
      case 1: return 'Your image has been securely uploaded';
      case 2: return 'Our AI is identifying hazards in your image';
      case 3: return 'Cross-referencing with real-time weather data';
      case 4: return 'Evaluating report credibility using multiple sources';
      case 5: return 'Creating alerts for authorities and volunteers';
      default: return '';
    }
  };

  const steps = [
    { id: 1, name: 'Uploaded', icon: Check },
    { id: 2, name: 'Visual Summary', icon: Settings },
    { id: 3, name: 'Weather Data', icon: Cloud },
    { id: 4, name: 'Trust Evaluation', icon: Bot },
    { id: 5, name: 'Reports Generated', icon: BarChart }
  ];

  const currentStep = report.processingStep || 0;

  return React.createElement('div', { className: 'bg-white rounded-xl shadow-md p-6 mb-6' },
    React.createElement('div', { className: 'mb-4' },
      React.createElement('h3', { className: 'text-lg font-semibold text-saffron-800' }, 'Processing Report'),
      React.createElement('p', { className: 'text-sm text-gray-600' }, 'Your report is being analyzed by our system')
    ),
    
    // Progress bar
    React.createElement('div', { className: 'mb-6' },
      React.createElement('div', { className: 'flex justify-between mb-2' },
        React.createElement('span', { className: 'text-sm font-medium text-saffron-700' }, 'Progress'),
        React.createElement('span', { className: 'text-sm font-medium text-saffron-700' }, `${report.progress || 0}%`)
      ),
      React.createElement('div', { className: 'w-full bg-gray-200 rounded-full h-2.5' },
        React.createElement('div', { 
          className: 'bg-saffron-600 h-2.5 rounded-full transition-all duration-500', 
          style: { width: `${report.progress || 0}%` } 
        })
      )
    ),
    
    // Step indicators
    React.createElement('div', { className: 'space-y-4' },
      steps.map((step) => {
        const Icon = step.icon;
        const isCompleted = currentStep >= step.id;
        const isCurrent = currentStep === step.id;
        
        return React.createElement('div', { 
          key: step.id, 
          className: `flex items-center ${isCompleted ? 'text-green-600' : isCurrent ? 'text-saffron-600' : 'text-gray-400'}` 
        },
          React.createElement('div', { 
            className: `flex items-center justify-center w-8 h-8 rounded-full ${isCompleted ? 'bg-green-100' : isCurrent ? 'bg-saffron-100' : 'bg-gray-100'}` 
          },
            isCompleted ? 
              React.createElement(Check, { className: 'w-5 h-5 text-green-600' }) : 
              React.createElement(Icon, { className: `w-5 h-5 ${isCompleted ? 'text-green-600' : isCurrent ? 'text-saffron-600' : 'text-gray-400'}` })
          ),
          React.createElement('span', { className: 'ml-3 text-sm font-medium' }, step.name)
        );
      })
    ),
    
    // Current status
    React.createElement('div', { className: 'mt-6 p-4 bg-gradient-to-r from-saffron-50 to-orange-50 rounded-lg border border-saffron-200' },
      React.createElement('div', { className: 'flex items-center space-x-2 mb-2' },
        React.createElement('div', { className: 'animate-pulse w-2 h-2 bg-saffron-500 rounded-full' }),
        React.createElement('p', { className: 'text-sm font-medium text-saffron-800' }, getStepLabel(currentStep))
      ),
      React.createElement('p', { className: 'text-xs text-saffron-600' }, getStepDescription(currentStep))
    )
  );
};

export default ReportProgress;