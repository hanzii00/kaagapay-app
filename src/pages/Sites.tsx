import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Search, 
  Users, 
  Phone, 
  Mail,
  Filter,
  ArrowRight
} from 'lucide-react';
import type { ReliefSite } from '@/lib/api';
import { reliefApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Sites: React.FC = () => {
  const [sites, setSites] = useState<ReliefSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      const data = await reliefApi.getSites();
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

  const filteredSites = sites.filter((site) => {
    const matchesSearch = 
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-light text-success';
      case 'full':
        return 'bg-warning-light text-warning';
      case 'inactive':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getOccupancyPercentage = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center animate-pulse">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Loading relief sites...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Relief Sites</h1>
          <p className="text-muted-foreground text-lg">
            Find relief centers and resources near you
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'full' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('full')}
            >
              Full
            </Button>
          </div>
        </div>

        {/* Sites Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              className="group bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300 overflow-hidden"
            >
              {/* Occupancy Bar */}
              <div className="h-1.5 bg-muted">
                <div 
                  className={`h-full transition-all duration-500 ${
                    getOccupancyPercentage(site.current_occupancy, site.capacity) > 90
                      ? 'bg-warning'
                      : 'bg-primary'
                  }`}
                  style={{ width: `${getOccupancyPercentage(site.current_occupancy, site.capacity)}%` }}
                />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-1 group-hover:text-primary transition-colors">
                      {site.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{site.address}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(site.status)}>
                    {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                  </Badge>
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {site.description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium">{site.current_occupancy}</span>
                    <span className="text-muted-foreground">/ {site.capacity}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {getOccupancyPercentage(site.current_occupancy, site.capacity)}% capacity
                  </span>
                </div>

                <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                  {site.contact_phone && (
                    <a 
                      href={`tel:${site.contact_phone}`}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {site.contact_phone}
                    </a>
                  )}
                  {site.contact_email && (
                    <a 
                      href={`mailto:${site.contact_email}`}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      {site.contact_email}
                    </a>
                  )}
                </div>

                <Link to={`/sites/${site.id}/tasks`}>
                  <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    View Tasks
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredSites.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No sites found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Sites;