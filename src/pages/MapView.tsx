import React, { useState, useEffect } from 'react';
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

const MapView: React.FC = () => {
  const [sites, setSites] = useState<ReliefSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<ReliefSite | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const { toast } = useToast();

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      const data = await mapApi.getSites();
      setSites(data);
    } catch (error) {
      toast({
        title: 'Error loading sites',
        description: error instanceof Error ? error.message : 'Failed to load relief sites',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'full':
        return 'bg-warning text-warning-foreground';
      case 'inactive':
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
            {/* Placeholder map with styled pins */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-muted flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Interactive Map</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Connect your preferred map provider (Google Maps, Mapbox, etc.) to display relief site locations.
                </p>
              </div>
            </div>

            {/* Mock map pins overlay */}
            {sites.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {sites.map((site, index) => (
                  <div
                    key={site.id}
                    className="absolute pointer-events-auto cursor-pointer group"
                    style={{
                      left: `${20 + (index % 2) * 30 + Math.random() * 20}%`,
                      top: `${20 + Math.floor(index / 2) * 30 + Math.random() * 10}%`,
                    }}
                    onClick={() => setSelectedSite(site)}
                  >
                    <div className={`w-10 h-10 rounded-full ${getStatusColor(site.status)} shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-card rounded-md shadow-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {site.name}
                    </div>
                  </div>
                ))}
              </div>
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

                <p className="text-muted-foreground mb-4">{selectedSite.description}</p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedSite.address}</span>
                </div>

                {/* Capacity */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Occupancy
                    </span>
                    <span className="font-medium">
                      {selectedSite.current_occupancy} / {selectedSite.capacity}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        getOccupancyPercentage(selectedSite.current_occupancy, selectedSite.capacity) > 90
                          ? 'bg-warning'
                          : 'bg-success'
                      }`}
                      style={{ width: `${getOccupancyPercentage(selectedSite.current_occupancy, selectedSite.capacity)}%` }}
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-3 mb-6">
                  {selectedSite.contact_phone && (
                    <a 
                      href={`tel:${selectedSite.contact_phone}`}
                      className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      {selectedSite.contact_phone}
                    </a>
                  )}
                  {selectedSite.contact_email && (
                    <a 
                      href={`mailto:${selectedSite.contact_email}`}
                      className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      {selectedSite.contact_email}
                    </a>
                  )}
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
                        <Users className="h-3 w-3" />
                        <span>{site.current_occupancy} / {site.capacity}</span>
                        <span className="ml-2">
                          {getOccupancyPercentage(site.current_occupancy, site.capacity)}% full
                        </span>
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