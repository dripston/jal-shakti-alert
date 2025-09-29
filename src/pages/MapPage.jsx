import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useReports } from '../contexts/ReportsContext';
import { MapPin, Layers, ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';
import PostCard from '../components/PostCard';

// Fix for default markers in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapPage = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const { allReports } = useReports();
  
  // Filter out rejected reports for consistency with dashboards
  const reports = allReports.filter(report => report.status !== 'rejected');
  
  console.log('All reports:', allReports.length);
  console.log('Filtered reports for map:', reports.length);
  console.log('Sample report:', reports[0]);
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showAlertZones, setShowAlertZones] = useState(true);

  useEffect(() => {
    initializeMap();
    
    // Check if there's a selected report from navigation
    const savedReport = localStorage.getItem('selectedReport');
    if (savedReport) {
      const report = JSON.parse(savedReport);
      setSelectedReport(report);
      localStorage.removeItem('selectedReport');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMapMarkers();
    }
  }, [reports, showHeatmap, showAlertZones]);

  useEffect(() => {
    if (selectedReport && mapInstanceRef.current) {
      const lat = selectedReport.coords?.latitude || selectedReport.latitude;
      const lng = selectedReport.coords?.longitude || selectedReport.longitude;
      if (lat && lng) {
        // Fly to selected report
        mapInstanceRef.current.flyTo([lat, lng], 15, {
          animate: true,
          duration: 1.5
        });
      }
    }
  }, [selectedReport]);

  const initializeMap = () => {
    if (!mapRef.current) return;

    // Initialize map centered on Indian Ocean coastal area
    const map = L.map(mapRef.current).setView([13.0827, 80.2707], 6);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Add custom controls
    const zoomInButton = L.control({ position: 'topright' });
    zoomInButton.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
      div.innerHTML = '<button style="background: white; width: 30px; height: 30px; border: none; cursor: pointer;"><span style="font-size: 18px;">+</span></button>';
      div.onclick = () => map.zoomIn();
      return div;
    };
    zoomInButton.addTo(map);

    const zoomOutButton = L.control({ position: 'topright' });
    zoomOutButton.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
      div.innerHTML = '<button style="background: white; width: 30px; height: 30px; border: none; cursor: pointer; margin-top: 2px;"><span style="font-size: 18px;">−</span></button>';
      div.onclick = () => map.zoomOut();
      return div;
    };
    zoomOutButton.addTo(map);

    mapInstanceRef.current = map;
    
    // Add a test marker to verify map is working
    const testMarker = L.marker([13.0827, 80.2707])
      .addTo(map)
      .bindPopup('Test marker - Map is working!');
    console.log('Test marker added to map');
  };

  const updateMapMarkers = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Add markers for each report
    console.log('Total reports for map:', reports.length);
    reports.forEach(report => {
      // Skip if report doesn't have valid coordinates
      const lat = report.coords?.latitude || report.latitude;
      const lng = report.coords?.longitude || report.longitude;
      console.log('Report coordinates:', { id: report.id, lat, lng, coords: report.coords });
      if (!lat || !lng) {
        console.log('Skipping report due to missing coordinates:', report.id);
        return;
      }
      
      console.log('Adding marker for report:', report.id, 'at', lat, lng);
      
      const markerColor = getMarkerColor(report.trustScore || report.trust_score, report.alert_level);
      
      // Create custom icon based on trust score and alert level
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: ${markerColor};
            border: 2px solid white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            position: relative;
          ">
            ${report.alert_level === 'high' ? '<div style="position: absolute; top: -5px; right: -5px; width: 8px; height: 8px; background: red; border-radius: 50%; border: 1px solid white;"></div>' : ''}
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .on('click', () => setSelectedReport(report));

      // Add popup with basic info
      const popupContent = `
        <div style="min-width: 200px;">
          <div style="font-weight: bold; margin-bottom: 5px;">${report.visual_tag?.replace('_', ' ').toUpperCase() || 'Water Quality Report'}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${report.address || report.location || 'Location not specified'}</div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="background: ${markerColor}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 11px;">
              Trust: ${report.trustScore || report.trust_score || 0}%
            </div>
            <div style="font-size: 11px; color: #666;">
              ${new Date(report.timestamp || report.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Add clustering if many markers (simplified clustering)
    if (reports.length > 20) {
      // In a real app, use proper clustering library like Leaflet.markercluster
      console.log('Consider adding marker clustering for better performance');
    }
  };

  const getMarkerColor = (trustScore, alertLevel) => {
    if (alertLevel === 'high') return '#ef4444'; // red
    if (alertLevel === 'medium') return '#f59e0b'; // yellow
    if (trustScore >= 71) return '#10b981'; // green
    if (trustScore >= 41) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const flyToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([
              position.coords.latitude,
              position.coords.longitude
            ], 12);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  const resetMapView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([13.0827, 80.2707], 6);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-100">
      <div className="absolute top-4 left-4 z-50 bg-white p-2 rounded shadow">
        <p>Map Debug: {reports.length} reports loaded</p>
      </div>
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '500px' }} />

      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        <Card className="p-2">
          <div className="flex space-x-2">
            <Button
              variant={showHeatmap ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <Layers className="h-4 w-4 mr-1" />
              Heatmap
            </Button>
            <Button
              variant={showAlertZones ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAlertZones(!showAlertZones)}
            >
              <MapPin className="h-4 w-4 mr-1" />
              Alerts
            </Button>
          </div>
        </Card>

        <Card className="p-2">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={flyToCurrentLocation}
            >
              <MapPin className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetMapView}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Card className="p-3">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm">Map Legend</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
              <span>High Alert / Low Trust</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-white"></div>
              <span>Medium Alert</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
              <span>High Trust / Low Alert</span>
            </div>
            <div className="text-xs text-muted-foreground pt-1 border-t">
              <div>📍 Markers: {reports.filter(r => {
                const lat = r.coords?.latitude || r.latitude;
                const lng = r.coords?.longitude || r.longitude;
                return lat && lng;
              }).length} reports</div>
              {showAlertZones && <div>🚨 Alert zones active</div>}
              {showHeatmap && <div>🔥 Heatmap overlay</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overlay */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Card className="p-3 min-w-[200px]">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-red-500">
                  {reports.filter(r => r.alert_level === 'high').length}
                </div>
                <div className="text-xs text-muted-foreground">High Alerts</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {reports.filter(r => r.status === 'approved').length}
                </div>
                <div className="text-xs text-muted-foreground">Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Report Detail Panel */}
      {selectedReport && (
        <div className="absolute inset-x-0 bottom-0 z-[1000] p-4">
          <Card className="relative max-w-md mx-auto">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={() => setSelectedReport(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="max-h-[60vh] overflow-y-auto">
              <PostCard 
                report={selectedReport} 
                compact={true}
                onViewOnMap={() => {}} 
              />
            </div>

            <div className="p-3 border-t bg-muted/20">
              <div className="flex space-x-2">
                <Button size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Report Issue
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MapPage;
