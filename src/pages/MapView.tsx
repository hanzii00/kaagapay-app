import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  List, 
  Grid,
  Phone,
  Mail,
  Users,
  ExternalLink,
  Navigation
} from 'lucide-react';
import type { ReliefSite } from '@/lib/api';
import { mapApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// TypeScript declaration for Leaflet
declare global {
  interface Window {
    L: any;
  }
}

const MapView: React.FC = () => {
  const [sites, setSites] = useState<ReliefSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<ReliefSite | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [mapLoaded, setMapLoaded] = useState(false);
  const { toast } = useToast();
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);

    loadSites();

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && sites.length > 0 && mapRef.current && !mapInstanceRef.current) {
      console.log('Initializing map with sites:', sites);
      initializeMap();
    }
  }, [mapLoaded, sites]);

  const loadSites = async () => {
    try {
      setLoading(true);
      const data = await mapApi.getSites();
      setSites(data || []);
    } catch (error) {
      console.error('Error loading sites:', error);
      toast({
        title: 'Error loading sites',
        description: error instanceof Error ? error.message : 'Failed to load relief sites',
        variant: 'destructive',
      });
      setSites([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!window.L || !mapRef.current || sites.length === 0) {
      console.log('Cannot initialize map:', { 
        hasLeaflet: !!window.L, 
        hasMapRef: !!mapRef.current, 
        sitesCount: sites.length 
      });
      return;
    }

    console.log('Map initialization starting...');
    const L = window.L;

    // Validate that sites have valid coordinates
    const validSites = sites.filter(site => 
      typeof site.latitude === 'number' && 
      typeof site.longitude === 'number' &&
      !isNaN(site.latitude) && 
      !isNaN(site.longitude)
    );

    console.log('Valid sites:', validSites);

    if (validSites.length === 0) {
      console.warn('No sites with valid coordinates');
      return;
    }

    // Calculate center from valid sites
    const centerLat = validSites.reduce((sum, site) => sum + site.latitude, 0) / validSites.length;
    const centerLng = validSites.reduce((sum, site) => sum + site.longitude, 0) / validSites.length;

    console.log('Map center:', { lat: centerLat, lng: centerLng });

    // Create map
    let map;
    try {
      map = L.map(mapRef.current).setView([centerLat, centerLng], 12);
      mapInstanceRef.current = map;
      console.log('Map instance created');
    } catch (error) {
      console.error('Error creating map:', error);
      return;
    }

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Custom icon function
    const createCustomIcon = (status: string) => {
      const colors: Record<string, string> = {
        open: '#10b981',
        full: '#f59e0b',
        completed: '#6b7280'
      };
      
      const color = colors[status] || colors.completed;
      
      return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div style="
            background-color: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            <div style="
              width: 12px;
              height: 12px;
              background-color: white;
              border-radius: 50%;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            "></div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
      });
    };

    // Add markers (only for valid sites)
    validSites.forEach((site) => {
      const marker = L.marker([site.latitude, site.longitude], {
        icon: createCustomIcon(site.status)
      }).addTo(map);

      const statusColors: Record<string, string> = {
        open: '#10b981',
        full: '#f59e0b',
        completed: '#6b7280'
      };
      const color = statusColors[site.status] || statusColors.completed;

      marker.bindPopup(`
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 4px; color: #111;">${site.name}</h3>
          <p style="font-size: 14px; color: #666; margin-bottom: 8px;">${site.address}</p>
          <div style="display: flex; gap: 8px; align-items: center; font-size: 12px; margin-bottom: 8px;">
            <span style="padding: 4px 8px; border-radius: 12px; background: ${color}20; color: ${color}; border: 1px solid ${color};">
              ${site.status}
            </span>
          </div>
          <button 
            onclick="window.selectSite(${site.id})"
            style="
              width: 100%;
              padding: 8px 12px;
              background: #2563eb;
              color: white;
              border: none;
              border-radius: 6px;
              font-weight: 500;
              cursor: pointer;
              font-size: 14px;
            "
          >
            View Details
          </button>
        </div>
      `);
    });

    // Add global function to select site
    (window as any).selectSite = (siteId: number) => {
      const site = sites.find(s => s.id === siteId);
      if (site) setSelectedSite(site);
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-success text-success-foreground';
      case 'full':
        return 'bg-warning text-warning-foreground';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getOccupancyPercentage = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100);
  };

  const openDirections = (site: ReliefSite) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Layout>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center animate-pulse">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="container mx-auto px-4 py-4 flex items-center justify-between border-b border-border">
          <div>
            <h1 className="font-display text-2xl font-bold">Map View</h1>
            <p className="text-sm text-muted-foreground">
              {sites.length} relief sites in your area
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="gap-2"
            >
              <Grid className="h-4 w-4" />
              Map
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Map Area */}
          <div className={`flex-1 relative bg-muted ${viewMode === 'list' ? 'hidden lg:block' : ''}`}>
            {!mapLoaded ? (
              <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-muted flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">Loading Map...</h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Initializing OpenStreetMap
                  </p>
                </div>
              </div>
            ) : (
              <div ref={mapRef} className="w-full h-full" />
            )}
          </div>

          {/* Site List / Details Panel */}
          <div className={`w-full lg:w-96 bg-card border-l border-border overflow-y-auto ${viewMode === 'map' && !selectedSite ? 'hidden lg:block' : ''}`}>
            {selectedSite ? (
              /* Site Details */
              <div className="p-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSite(null)}
                  className="mb-4"
                >
                  ← Back to list
                </Button>

                <div className="flex items-start justify-between mb-4">
                  <h2 className="font-display text-xl font-bold">{selectedSite.name}</h2>
                  <Badge className={getStatusColor(selectedSite.status)}>
                    {selectedSite.status}
                  </Badge>
                </div>

                <p className="text-muted-foreground mb-4">Relief site in {selectedSite.address}</p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedSite.address}</span>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button 
                    variant="hero" 
                    className="w-full gap-2"
                    onClick={() => openDirections(selectedSite)}
                  >
                    <Navigation className="h-4 w-4" />
                    Get Directions
                  </Button>
                  <Link to={`/sites/${selectedSite.id}/tasks`}>
                    <Button variant="outline" className="w-full gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View Tasks
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Site List */
              <div className="divide-y divide-border">
                <div className="p-4 bg-muted/50">
                  <h3 className="font-semibold">All Sites</h3>
                </div>
                {sites.length > 0 ? (
                  sites.map((site) => (
                    <div
                      key={site.id}
                      className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedSite(site)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{site.name}</h4>
                        <Badge className={`text-xs ${getStatusColor(site.status)}`}>
                          {site.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                        {site.address}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Created {new Date(site.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No sites found</h3>
                    <p className="text-muted-foreground text-sm">
                      Relief sites will appear here when available
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MapView;