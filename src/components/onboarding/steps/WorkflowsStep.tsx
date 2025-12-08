import { useOnboarding } from '@/contexts/OnboardingContext';
import { WizardNavigation } from '../WizardNavigation';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Instagram, Youtube, Facebook, Twitter, Upload } from 'lucide-react';

const platformConfigs = {
  instagram: { name: 'Instagram Reels', icon: <Instagram className="w-5 h-5" />, description: 'I usually post new content on Instagram first.' },
  tiktok: { 
    name: 'TikTok', 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    ), 
    description: 'I usually post new content on TikTok first.' 
  },
  facebook: { name: 'Facebook Reels', icon: <Facebook className="w-5 h-5" />, description: 'I usually post new content on Facebook first.' },
  youtube: { name: 'YouTube Shorts', icon: <Youtube className="w-5 h-5" />, description: 'I usually post new content on YouTube first.' },
  direct: { name: 'Upload directly', icon: <Upload className="w-5 h-5" />, description: "I'll upload directly inside Autopost Agent." },
};

const frequencies = [
  { value: 'few_times_week', label: 'A few times a week' },
  { value: 'daily', label: 'Daily' },
  { value: 'multiple_daily', label: 'Multiple times per day' },
];

export function WorkflowsStep() {
  const { data, updateData, setCurrentStep } = useOnboarding();

  // Get connected platforms
  const connectedPlatforms = Object.entries(data.connectedAccounts)
    .filter(([_, acc]) => acc.connected)
    .map(([id]) => id);

  const availableSources = ['direct', ...connectedPlatforms];

  // Generate destination options based on source
  const getDestinations = () => {
    if (!data.mainSourcePlatform || data.mainSourcePlatform === 'direct') {
      return connectedPlatforms;
    }
    return connectedPlatforms.filter(p => p !== data.mainSourcePlatform);
  };

  const toggleDestination = (dest: string) => {
    const newDests = data.destinations.includes(dest)
      ? data.destinations.filter(d => d !== dest)
      : [...data.destinations, dest];
    updateData({ destinations: newDests });
  };

  const handleContinue = () => {
    setCurrentStep(4);
  };

  const hasValidWorkflow = data.mainSourcePlatform && data.destinations.length > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Choose Your Main Workflow</h1>
        <p className="text-muted-foreground">
          Tell us where you usually post first and where you want that content to go. We'll set up the automations for you.
        </p>
      </div>

      {/* Section 1: Source Platform */}
      <div className="space-y-4">
        <Label className="text-base">What's your main source platform?</Label>
        <div className="grid gap-3">
          {availableSources.map((platformId) => {
            const config = platformConfigs[platformId as keyof typeof platformConfigs];
            if (!config) return null;

            return (
              <button
                key={platformId}
                onClick={() => {
                  updateData({ mainSourcePlatform: platformId, destinations: [] });
                }}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                  data.mainSourcePlatform === platformId
                    ? 'border-primary bg-primary/10'
                    : 'border-border/50 bg-card hover:border-primary/50'
                )}
              >
                <div className={cn(
                  'p-2 rounded-lg',
                  data.mainSourcePlatform === platformId ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  {config.icon}
                </div>
                <div>
                  <h3 className="font-medium">{config.name}</h3>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Destinations */}
      {data.mainSourcePlatform && (
        <div className="space-y-4 animate-fade-in">
          <Label className="text-base">
            From {platformConfigs[data.mainSourcePlatform as keyof typeof platformConfigs]?.name || 'your source'}, also post to:
          </Label>
          <div className="space-y-3">
            {getDestinations().map((destId) => {
              const config = platformConfigs[destId as keyof typeof platformConfigs];
              if (!config) return null;

              return (
                <div
                  key={destId}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                      {config.icon}
                    </div>
                    <span className="font-medium">{config.name}</span>
                  </div>
                  <Switch
                    checked={data.destinations.includes(destId)}
                    onCheckedChange={() => toggleDestination(destId)}
                  />
                </div>
              );
            })}
          </div>
          {getDestinations().length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Connect more accounts to add destinations.
            </p>
          )}
        </div>
      )}

      {/* Section 3: Frequency */}
      <div className="space-y-4">
        <Label className="text-base">How often do you want content going out?</Label>
        <RadioGroup
          value={data.frequency}
          onValueChange={(val) => updateData({ frequency: val })}
          className="space-y-2"
        >
          {frequencies.map((freq) => (
            <div
              key={freq.value}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer',
                data.frequency === freq.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border/50 bg-card hover:border-primary/50'
              )}
              onClick={() => updateData({ frequency: freq.value })}
            >
              <RadioGroupItem value={freq.value} id={freq.value} />
              <label htmlFor={freq.value} className="cursor-pointer font-medium">
                {freq.label}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {!hasValidWorkflow && data.mainSourcePlatform && (
        <p className="text-sm text-destructive">
          Please select at least one workflow or destination before continuing.
        </p>
      )}

      <WizardNavigation
        onContinue={handleContinue}
        continueLabel="Continue to Auto-Publish"
        disableContinue={!hasValidWorkflow}
      />
    </div>
  );
}
