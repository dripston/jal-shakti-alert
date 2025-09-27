import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';
import { Download, RotateCcw } from 'lucide-react';
import { useReports } from '../contexts/ReportsContext';

const FiltersPanel = ({ isOpen, onClose }) => {
  const { filters, setFilters, exportReports, reports } = useReports();

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'all',
      radius: 'all', 
      trustScore: 'all',
      alertLevel: 'all'
    });
  };

  const getFilteredCount = () => {
    return reports.length;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader className="text-left">
          <SheetTitle>Filter Reports</SheetTitle>
          <SheetDescription>
            Customize which reports you want to see
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Date Range</Label>
            <RadioGroup 
              value={filters.dateRange} 
              onValueChange={(value) => handleFilterChange('dateRange', value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="date-all" />
                <Label htmlFor="date-all" className="text-sm">All time</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1d" id="date-1d" />
                <Label htmlFor="date-1d" className="text-sm">Last 24 hours</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="7d" id="date-7d" />
                <Label htmlFor="date-7d" className="text-sm">Last 7 days</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30d" id="date-30d" />
                <Label htmlFor="date-30d" className="text-sm">Last 30 days</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Trust Score Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Trust Score</Label>
            <RadioGroup 
              value={filters.trustScore} 
              onValueChange={(value) => handleFilterChange('trustScore', value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="trust-all" />
                <Label htmlFor="trust-all" className="text-sm">All levels</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="trust-high" />
                <Label htmlFor="trust-high" className="text-sm">
                  High (71-100%) <span className="inline-block w-3 h-3 bg-green-500 rounded ml-1"></span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="trust-medium" />
                <Label htmlFor="trust-medium" className="text-sm">
                  Medium (41-70%) <span className="inline-block w-3 h-3 bg-yellow-500 rounded ml-1"></span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="trust-low" />
                <Label htmlFor="trust-low" className="text-sm">
                  Low (0-40%) <span className="inline-block w-3 h-3 bg-red-500 rounded ml-1"></span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Alert Level Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Alert Level</Label>
            <RadioGroup 
              value={filters.alertLevel} 
              onValueChange={(value) => handleFilterChange('alertLevel', value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="alert-all" />
                <Label htmlFor="alert-all" className="text-sm">All alerts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="alert-high" />
                <Label htmlFor="alert-high" className="text-sm">
                  High Priority <span className="inline-block w-3 h-3 bg-red-500 rounded ml-1"></span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="alert-medium" />
                <Label htmlFor="alert-medium" className="text-sm">
                  Medium Priority <span className="inline-block w-3 h-3 bg-yellow-500 rounded ml-1"></span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="alert-low" />
                <Label htmlFor="alert-low" className="text-sm">
                  Low Priority <span className="inline-block w-3 h-3 bg-green-500 rounded ml-1"></span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Distance Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Distance from You</Label>
            <RadioGroup 
              value={filters.radius} 
              onValueChange={(value) => handleFilterChange('radius', value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="distance-all" />
                <Label htmlFor="distance-all" className="text-sm">Anywhere</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5km" id="distance-5km" />
                <Label htmlFor="distance-5km" className="text-sm">Within 5 km</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="25km" id="distance-25km" />
                <Label htmlFor="distance-25km" className="text-sm">Within 25 km</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="100km" id="distance-100km" />
                <Label htmlFor="distance-100km" className="text-sm">Within 100 km</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Results Count */}
        <div className="bg-muted/50 p-3 rounded-lg mb-4">
          <p className="text-sm text-center text-muted-foreground">
            Showing <span className="font-medium text-foreground">{getFilteredCount()}</span> reports with current filters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
          
          <Button
            variant="outline"
            onClick={() => exportReports('json')}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button
            onClick={onClose}
            className="flex-1"
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FiltersPanel;