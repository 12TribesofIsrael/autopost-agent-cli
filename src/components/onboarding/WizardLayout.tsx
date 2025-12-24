import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Check, Loader2, LogOut, Home } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const stepLabels = [
  'Welcome',
  'Brand Basics',
  'Connect Accounts',
  'Workflows',
  'Final Setup',
];

interface WizardLayoutProps {
  children: React.ReactNode;
}

export function WizardLayout({ children }: WizardLayoutProps) {
  const { currentStep, totalSteps, saveProgress, saving } = useOnboarding();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSaveAndExit = async () => {
    await saveProgress();
    navigate('/dashboard');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              Grow<span className="text-primary">YourBrand</span>
            </span>
          </Link>

          {/* Center: Step Progress */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="font-medium">{stepLabels[currentStep]}</span>
          </div>

          {/* Right: Navigation */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSaveAndExit} 
              className="text-muted-foreground hover:text-foreground gap-2"
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Home className="w-4 h-4" />}
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut} 
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 container mx-auto px-4 py-8 gap-8">
        {/* Left: Vertical Progress List */}
        <aside className="hidden lg:block w-64 shrink-0">
          <nav className="sticky top-24 space-y-2">
            {stepLabels.slice(1).map((label, idx) => {
              const stepNum = idx + 1;
              const isActive = currentStep === stepNum;
              const isCompleted = currentStep > stepNum;

              return (
                <div
                  key={label}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary/10 border border-primary/30'
                      : isCompleted
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                  </div>
                  <span className={isActive ? 'font-medium text-foreground' : ''}>
                    {label}
                  </span>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Right: Step Content */}
        <main className="flex-1 max-w-2xl">
          {children}
        </main>
      </div>
    </div>
  );
}
