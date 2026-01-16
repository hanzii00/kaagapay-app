import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi } from '@/lib/api';
import type { DashboardStats } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  ClipboardList, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Heart
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Dashboard error:', error);
      
      // If authentication error, show friendly message
      if (error instanceof Error && error.message.includes('Authentication required')) {
        // Set default stats for non-authenticated users
        setStats({
          total_sites: 0,
          active_sites: 0,
          total_tasks: 0,
          open_tasks: 0,
          total_volunteers: 0,
          tasks_by_priority: {},
          tasks_by_category: {},
        });
      } else {
        toast({
          title: 'Error loading dashboard',
          description: error instanceof Error ? error.message : 'Failed to load dashboard data',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // User's upcoming tasks - empty for now (backend endpoint needed)
  const myTasks: any[] = [];

  // Recent activity - empty for now (backend endpoint needed)
  const recentActivity: any[] = [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <TrendingUp className="h-4 w-4 text-primary" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center animate-pulse">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h3 className="font-display text-xl font-semibold mb-2">Unable to load dashboard</h3>
            <p className="text-muted-foreground mb-4">Please try again later</p>
            <Button onClick={loadDashboardData}>Retry</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Welcome back{user?.first_name ? `, ${user.first_name}` : ''}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's an overview of your volunteer activity and community updates.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <span className="text-2xl font-display font-bold">{stats.active_sites}</span>
            </div>
            <p className="text-sm text-muted-foreground">Active Sites</p>
            <p className="text-xs text-muted-foreground">of {stats.total_sites} total</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="text-2xl font-display font-bold">{stats.open_tasks}</span>
            </div>
            <p className="text-sm text-muted-foreground">Open Tasks</p>
            <p className="text-xs text-muted-foreground">need volunteers</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-success-light flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <span className="text-2xl font-display font-bold">
                {stats.total_tasks - stats.open_tasks}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-xs text-muted-foreground">this week</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-warning-light flex items-center justify-center">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <span className="text-2xl font-display font-bold">{stats.total_volunteers}</span>
            </div>
            <p className="text-sm text-muted-foreground">Active Volunteers</p>
            <p className="text-xs text-muted-foreground">in network</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Upcoming Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h2 className="font-display text-xl font-semibold">My Upcoming Tasks</h2>
                </div>
                <Link to="/tasks">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-border">
                {myTasks.length > 0 ? (
                  myTasks.map((task) => (
                    <div key={task.id} className="p-6 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold mb-1">{task.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4" />
                            <span>{task.site}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{new Date(task.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <span>{task.time}</span>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          task.status === 'confirmed' 
                            ? 'bg-success-light text-success' 
                            : 'bg-warning-light text-warning'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No upcoming tasks</h3>
                    <p className="text-muted-foreground mb-4">
                      Sign up for tasks to start making a difference
                    </p>
                    <Link to="/tasks">
                      <Button variant="hero">Browse Tasks</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <h2 className="font-display text-xl font-semibold">Recent Activity</h2>
                </div>
              </div>

              <div className="divide-y divide-border">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="p-4 flex items-start gap-3">
                    <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 space-y-3">
              <Link to="/sites" className="block">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <MapPin className="h-5 w-5" />
                  Find Relief Sites
                </Button>
              </Link>
              <Link to="/tasks" className="block">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <ClipboardList className="h-5 w-5" />
                  Browse Volunteer Tasks
                </Button>
              </Link>
              <Link to="/profile" className="block">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Users className="h-5 w-5" />
                  Update Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;