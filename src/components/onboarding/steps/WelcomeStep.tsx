import { useOnboarding } from '@/contexts/OnboardingContext';
import { WizardNavigation } from '../WizardNavigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const businessTypes = [
  { id: 'boxer_fighter', label: 'Pro Boxer / Amateur Fighter', icon: '🥊' },
  { id: 'gym_studio', label: 'Boxing Gym / Fitness Studio', icon: '🏋️' },
  { id: 'restaurant_food', label: 'Local Restaurant / Food Business', icon: '🍽️' },
  { id: 'other_local_business', label: 'Other Local Business', icon: '🏪' },
];

export function WelcomeStep() {
  const { data, updateData, setCurrentStep } = useOnboarding();

  const handleContinue = () => {
    setCurrentStep(1);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">
          Welcome to <span className="text-gradient">GrowYourBrand</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Turn one post into content everywhere. Let's connect your business and set up your automations.
        </p>
      </div>

      {/* Benefits */}
      <div className="gradient-card rounded-2xl p-6 border border-border/50 space-y-3">
        <p className="text-muted-foreground">
          ✨ Perfect for boxers, athletes, entrepreneurs, gyms, and local businesses who want to look active online without living on social media.
        </p>
        <p className="text-muted-foreground">
          🚀 We'll walk you through this once, then your content runs on autopilot.
        </p>
      </div>

      {/* Business Type Selection */}
      <div className="space-y-4">
        <Label className="text-base">What best describes you?</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {businessTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => updateData({ businessType: type.id })}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border transition-all text-left',
                data.businessType === type.id
                  ? 'border-primary bg-primary/10 shadow-soft'
                  : 'border-border/50 bg-card hover:border-primary/50'
              )}
            >
              <span className="text-2xl">{type.icon}</span>
              <span className="font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Name */}
      <div className="space-y-2">
        <Label htmlFor="brandName">Business / Brand Name</Label>
        <Input
          id="brandName"
          placeholder="e.g., Philly Knockout Boxing Club"
          value={data.brandName}
          onChange={(e) => updateData({ brandName: e.target.value })}
          className="bg-card border-border/50"
        />
      </div>

      {/* Website / Social */}
      <div className="space-y-2">
        <Label htmlFor="websiteOrSocial">Website or main social link (optional)</Label>
        <Input
          id="websiteOrSocial"
          placeholder="https://instagram.com/yourbrand"
          value={data.websiteOrSocial}
          onChange={(e) => updateData({ websiteOrSocial: e.target.value })}
          className="bg-card border-border/50"
        />
      </div>

      <WizardNavigation
        onContinue={handleContinue}
        continueLabel="Let's Get Started"
        isFirstStep
        disableContinue={!data.businessType || !data.brandName}
      />
    </div>
  );
}
