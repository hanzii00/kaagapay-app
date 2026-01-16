import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, 
  Search, 
  Users, 
  Clock,
  Filter,
  MapPin,
  AlertTriangle,
  Check,
  Heart,
  Truck,
  Utensils,
  Home,
  Stethoscope,
  Package
} from 'lucide-react';
import type { Task } from '@/lib/api';
import { tasksApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const categoryIcons: Record<string, React.ElementType> = {
  medical: Stethoscope,
  logistics: Package,
  food: Utensils,
  shelter: Home,
  transport: Truck,
  other: ClipboardList,
};

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getTasks();
      setTasks(data);
    } catch (error) {
      toast({
        title: 'Error loading tasks',
        description: error instanceof Error ? error.message : 'Failed to load tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.site_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive-light text-destructive';
      case 'high':
        return 'bg-warning-light text-warning';
      case 'medium':
        return 'bg-primary-light text-primary';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medical':
        return 'bg-destructive-light text-destructive';
      case 'food':
        return 'bg-success-light text-success';
      case 'transport':
        return 'bg-primary-light text-primary';
      case 'shelter':
        return 'bg-accent-light text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSignUp = async (taskId: number, taskTitle: string) => {
    try {
      await tasksApi.signUp(taskId);
      toast({
        title: 'Signed up successfully!',
        description: `You've been registered for "${taskTitle}". Check your email for details.`,
      });
      // Reload tasks to update volunteer count
      loadTasks();
    } catch (error) {
      toast({
        title: 'Sign up failed',
        description: error instanceof Error ? error.message : 'Failed to sign up for task',
        variant: 'destructive',
      });
    }
  };

  const isFull = (task: Task) => task.volunteers_signed_up >= task.volunteers_needed;

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center animate-pulse">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Loading tasks...</p>
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
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Volunteer Tasks</h1>
          <p className="text-muted-foreground text-lg">
            Find opportunities to help your community
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Priority:</span>
              {['all', 'urgent', 'high', 'medium', 'low'].map((priority) => (
                <Button
                  key={priority}
                  variant={priorityFilter === priority ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriorityFilter(priority)}
                >
                  {priority === 'urgent' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Category:</span>
            {['all', 'medical', 'food', 'shelter', 'transport', 'logistics', 'other'].map((category) => {
              const Icon = categoryIcons[category] || ClipboardList;
              return (
                <Button
                  key={category}
                  variant={categoryFilter === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(category)}
                  className="gap-1"
                >
                  {category !== 'all' && <Icon className="h-3 w-3" />}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const CategoryIcon = categoryIcons[task.category] || ClipboardList;
            const taskIsFull = isFull(task);
            
            return (
              <div
                key={task.id}
                className={`group bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300 overflow-hidden ${
                  taskIsFull ? 'opacity-75' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(task.category)}`}>
                        <CategoryIcon className="h-6 w-6" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-display text-xl font-semibold group-hover:text-primary transition-colors">
                          {task.title}
                        </h3>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority === 'urgent' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {task.priority}
                        </Badge>
                        {taskIsFull && (
                          <Badge className="bg-success-light text-success">
                            <Check className="h-3 w-3 mr-1" />
                            Full
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{task.site_name}</span>
                      </div>

                      <p className="text-muted-foreground mb-4">
                        {task.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{formatDate(task.start_time)}</span>
                          <span className="text-muted-foreground">
                            {formatTime(task.start_time)} - {formatTime(task.end_time)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-medium">{task.volunteers_signed_up}</span>
                          <span className="text-muted-foreground">/ {task.volunteers_needed} volunteers</span>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      <Button
                        variant={taskIsFull ? 'outline' : 'hero'}
                        disabled={taskIsFull}
                        onClick={() => handleSignUp(task.id, task.title)}
                        className="gap-2"
                      >
                        {taskIsFull ? (
                          <>
                            <Check className="h-4 w-4" />
                            Filled
                          </>
                        ) : (
                          <>
                            <Heart className="h-4 w-4" />
                            Sign Up
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-muted">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      taskIsFull ? 'bg-success' : 'bg-primary'
                    }`}
                    style={{ width: `${(task.volunteers_signed_up / task.volunteers_needed) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tasks;