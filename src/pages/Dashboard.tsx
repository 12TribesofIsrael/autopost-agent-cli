import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Plus, Settings, BarChart3, Video, Clock, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  businessName: string;
  mainPlatform: string;
  connectedPlatforms: number;
  workflowsActive: number;
}

export default function Dashboard() {
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        // Load profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_name, onboarding_completed')
          .eq('id', user.id)
          .maybeSingle();

        if (profile && !profile.onboarding_completed) {
          navigate('/onboarding');
          return;
        }

        // Show welcome banner for newly completed onboarding
        const justCompleted = localStorage.getItem('onboardingComplete');
        if (justCompleted === 'true') {
          setShowWelcomeBanner(true);
          localStorage.removeItem('onboardingComplete');
        }

        // Load connected platforms count
        const { data: connections } = await supabase
          .from('social_connections')
          .select('platform, connected')
          .eq('user_id', user.id)
          .eq('connected', true);

        // Load workflows
        const { data: workflows } = await supabase
          .from('workflows')
          .select('source_platform, enabled')
          .eq('user_id', user.id)
          .eq('enabled', true);

        setDashboardData({
          businessName: profile?.business_name || 'Your Business',
          mainPlatform: workflows?.[0]?.source_platform || 'your main platform',
          connectedPlatforms: connections?.length || 0,
          workflowsActive: workflows?.length || 0,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              Autopost<span className="text-primary">Agent</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        {showWelcomeBanner && (
          <div className="mb-8 p-6 rounded-2xl gradient-card border border-primary/30 shadow-soft animate-fade-in">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    🎉 Setup Complete
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Your workflows are live. Post on {dashboardData?.mainPlatform} or click "Create New Post" to let Autopost Agent push it everywhere.
                  </p>
                  <Button className="mt-4 gradient-primary glow-primary gap-2">
                    <Plus className="w-4 h-4" />
                    Create New Post
                  </Button>
                </div>
              </div>
              <button
                onClick={() => setShowWelcomeBanner(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back{dashboardData?.businessName ? `, ${dashboardData.businessName}` : ''}! Here's your content overview.
            </p>
          </div>
          <Button className="gradient-primary glow-primary gap-2">
            <Plus className="w-4 h-4" />
            Create New Post
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-xl border border-border/50 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground">Posts This Week</span>
            </div>
            <p className="text-3xl font-bold">0</p>
          </div>

          <div className="p-6 rounded-xl border border-border/50 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-success/10">
                <BarChart3 className="w-5 h-5 text-success" />
              </div>
              <span className="text-muted-foreground">Platforms Active</span>
            </div>
            <p className="text-3xl font-bold">{dashboardData?.connectedPlatforms || 0}</p>
          </div>

          <div className="p-6 rounded-xl border border-border/50 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <span className="text-muted-foreground">Workflows Active</span>
            </div>
            <p className="text-3xl font-bold">{dashboardData?.workflowsActive || 0}</p>
          </div>
        </div>

        {/* Empty State */}
        <div className="p-12 rounded-2xl border border-dashed border-border/50 bg-card/50 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by creating your first post or posting on your connected platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="gradient-primary glow-primary gap-2">
                <Plus className="w-4 h-4" />
                Create New Post
              </Button>
              <Button variant="outline" asChild>
                <Link to="/onboarding">Edit Workflows</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
