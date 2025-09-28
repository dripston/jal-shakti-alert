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
      case 0: return 'Not Started';
      case 1: return 'Uploaded';
      case 2: return 'Processing Visual Summary';
      case 3: return 'Processing Weather Data';
      case 4: return 'Running Trust Evaluation';
      case 5: return 'Generating Reports';
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
    React.createElement('div', { className: 'mt-6 p-3 bg-saffron-50 rounded-lg' },
      React.createElement('p', { className: 'text-sm text-saffron-700' },
        React.createElement('span', { className: 'font-medium' }, 'Current step:'),
        ' ', getStepLabel(currentStep)
      )
    )
  );
};

export default ReportProgress;