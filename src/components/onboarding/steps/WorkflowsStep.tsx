import { useOnboarding } from '@/contexts/OnboardingContext';
import { WizardNavigation } from '../WizardNavigation';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Instagram, Youtube, Facebook, Twitter, Podcast, HardDrive, Cloud } from 'lucide-react';

// Source platforms - where content originates (based on Repurpose.io)
const sourcePlatforms = {
  tiktok: { 
    name: 'TikTok', 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    ), 
    description: 'Repurpose your TikTok videos automatically.' 
  },
  instagram: { 
    name: 'Instagram Reels', 
    icon: <Instagram className="w-5 h-5" />, 
    description: 'Repurpose your Instagram Reels automatically.' 
  },
  youtube: { 
    name: 'YouTube / Shorts', 
    icon: <Youtube className="w-5 h-5" />, 
    description: 'Repurpose your YouTube videos and Shorts.' 
  },
  facebook: { 
    name: 'Facebook Reels', 
    icon: <Facebook className="w-5 h-5" />, 
    description: 'Repurpose your Facebook Reels automatically.' 
  },
  twitch: { 
    name: 'Twitch', 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
      </svg>
    ), 
    description: 'Repurpose clips from your Twitch streams.' 
  },
  snapchat: { 
    name: 'Snapchat Stories', 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.475-.104.18 0 .33.048.43.126.15.12.255.3.27.51.016.21-.06.45-.27.66-.12.12-.39.285-.84.42-.18.045-.405.12-.66.195-.315.09-.705.225-.9.33-.195.12-.313.27-.405.405-.09.165-.12.42-.075.69.048.255.18.585.27.825.18.45.435 1.02.285 1.605-.075.285-.24.555-.54.705a2.64 2.64 0 0 1-.72.24c-.27.06-.555.09-.84.12-.315.03-.54.06-.735.15a1.56 1.56 0 0 0-.435.39c-.18.24-.36.54-.585.855-.405.57-.93 1.305-1.785 1.545-1.02.3-2.04.06-2.94-.18-.69-.195-1.35-.36-1.92-.12-.3.12-.585.315-.855.495-.33.195-.735.435-1.155.57-.51.165-1.05.225-1.575.225-.495 0-.975-.06-1.335-.195a2.85 2.85 0 0 1-.87-.51c-.18-.165-.285-.345-.315-.54a.866.866 0 0 1 .075-.45c.06-.135.165-.255.285-.36.27-.21.615-.315.93-.39.42-.09.84-.12 1.17-.165a2.4 2.4 0 0 0 .585-.105c.225-.075.39-.195.495-.33.12-.15.195-.345.225-.555.03-.195.03-.405.015-.615a8.67 8.67 0 0 1-.015-.54c0-.12.015-.24.03-.36.015-.12.045-.24.075-.345.045-.165.12-.315.21-.45a1.2 1.2 0 0 1 .345-.345c.135-.09.285-.15.45-.195.12-.03.255-.06.39-.075.15-.015.315-.03.48-.03.15 0 .285.015.405.03.105.015.21.03.3.06.18.03.33.09.45.15.165.09.285.195.375.33.09.12.15.27.18.42.03.165.03.345.015.525-.015.165-.045.33-.09.495-.045.18-.105.36-.18.54-.075.165-.15.33-.24.495-.09.15-.18.285-.285.42a2.58 2.58 0 0 1-.33.375c-.12.12-.255.225-.405.315a2.04 2.04 0 0 1-.465.21 2.19 2.19 0 0 1-.51.09c-.165.015-.33.015-.495 0a2.28 2.28 0 0 1-.48-.075 2.1 2.1 0 0 1-.435-.165 1.65 1.65 0 0 1-.36-.24 1.2 1.2 0 0 1-.27-.3.96.96 0 0 1-.15-.345.93.93 0 0 1-.015-.36.87.87 0 0 1 .105-.33c.06-.105.135-.195.225-.27a.99.99 0 0 1 .315-.18c.12-.045.255-.06.39-.06.12 0 .24.015.345.045.105.03.195.075.285.135.075.06.15.135.21.21.06.09.105.18.135.285.03.09.045.195.045.3 0 .09-.015.195-.045.285a.72.72 0 0 1-.135.255.69.69 0 0 1-.225.18.69.69 0 0 1-.285.075.48.48 0 0 1-.21-.045.42.42 0 0 1-.165-.135.45.45 0 0 1-.075-.195.39.39 0 0 1 .015-.21.36.36 0 0 1 .12-.165.36.36 0 0 1 .18-.075c.06-.015.12 0 .165.03a.18.18 0 0 1 .075.09c.015.03.015.06 0 .09 0 .03-.015.06-.045.075-.015.015-.045.03-.075.03l-.03.015z"/>
      </svg>
    ), 
    description: 'Repurpose your Snapchat Stories.' 
  },
  podcast: { 
    name: 'Podcast (RSS)', 
    icon: <Podcast className="w-5 h-5" />, 
    description: 'Repurpose audio from your podcast feed.' 
  },
  googledrive: { 
    name: 'Google Drive', 
    icon: <HardDrive className="w-5 h-5" />, 
    description: 'Repurpose videos from your Google Drive.' 
  },
  dropbox: { 
    name: 'Dropbox', 
    icon: <Cloud className="w-5 h-5" />, 
    description: 'Repurpose videos from your Dropbox.' 
  },
};

// Destination platforms - where content gets published to
const destinationPlatforms = {
  youtube: { name: 'YouTube Shorts', icon: <Youtube className="w-5 h-5" /> },
  tiktok: { 
    name: 'TikTok', 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    ) 
  },
  instagram: { name: 'Instagram Reels', icon: <Instagram className="w-5 h-5" /> },
  facebook: { name: 'Facebook Reels', icon: <Facebook className="w-5 h-5" /> },
  snapchat: { 
    name: 'Snapchat Spotlight', 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.475-.104.18 0 .33.048.43.126.15.12.255.3.27.51.016.21-.06.45-.27.66-.12.12-.39.285-.84.42-.18.045-.405.12-.66.195-.315.09-.705.225-.9.33-.195.12-.313.27-.405.405-.09.165-.12.42-.075.69.048.255.18.585.27.825.18.45.435 1.02.285 1.605-.075.285-.24.555-.54.705a2.64 2.64 0 0 1-.72.24c-.27.06-.555.09-.84.12-.315.03-.54.06-.735.15a1.56 1.56 0 0 0-.435.39c-.18.24-.36.54-.585.855-.405.57-.93 1.305-1.785 1.545-1.02.3-2.04.06-2.94-.18-.69-.195-1.35-.36-1.92-.12-.3.12-.585.315-.855.495-.33.195-.735.435-1.155.57-.51.165-1.05.225-1.575.225-.495 0-.975-.06-1.335-.195a2.85 2.85 0 0 1-.87-.51c-.18-.165-.285-.345-.315-.54a.866.866 0 0 1 .075-.45c.06-.135.165-.255.285-.36.27-.21.615-.315.93-.39.42-.09.84-.12 1.17-.165a2.4 2.4 0 0 0 .585-.105c.225-.075.39-.195.495-.33.12-.15.195-.345.225-.555.03-.195.03-.405.015-.615a8.67 8.67 0 0 1-.015-.54c0-.12.015-.24.03-.36.015-.12.045-.24.075-.345.045-.165.12-.315.21-.45a1.2 1.2 0 0 1 .345-.345c.135-.09.285-.15.45-.195.12-.03.255-.06.39-.075.15-.015.315-.03.48-.03.15 0 .285.015.405.03.105.015.21.03.3.06.18.03.33.09.45.15.165.09.285.195.375.33.09.12.15.27.18.42.03.165.03.345.015.525-.015.165-.045.33-.09.495-.045.18-.105.36-.18.54-.075.165-.15.33-.24.495-.09.15-.18.285-.285.42a2.58 2.58 0 0 1-.33.375c-.12.12-.255.225-.405.315a2.04 2.04 0 0 1-.465.21 2.19 2.19 0 0 1-.51.09c-.165.015-.33.015-.495 0a2.28 2.28 0 0 1-.48-.075 2.1 2.1 0 0 1-.435-.165 1.65 1.65 0 0 1-.36-.24 1.2 1.2 0 0 1-.27-.3.96.96 0 0 1-.15-.345.93.93 0 0 1-.015-.36.87.87 0 0 1 .105-.33c.06-.105.135-.195.225-.27a.99.99 0 0 1 .315-.18c.12-.045.255-.06.39-.06.12 0 .24.015.345.045.105.03.195.075.285.135.075.06.15.135.21.21.06.09.105.18.135.285.03.09.045.195.045.3 0 .09-.015.195-.045.285a.72.72 0 0 1-.135.255.69.69 0 0 1-.225.18.69.69 0 0 1-.285.075.48.48 0 0 1-.21-.045.42.42 0 0 1-.165-.135.45.45 0 0 1-.075-.195.39.39 0 0 1 .015-.21.36.36 0 0 1 .12-.165.36.36 0 0 1 .18-.075c.06-.015.12 0 .165.03a.18.18 0 0 1 .075.09c.015.03.015.06 0 .09 0 .03-.015.06-.045.075-.015.015-.045.03-.075.03l-.03.015z"/>
      </svg>
    ) 
  },
  pinterest: { 
    name: 'Pinterest', 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
      </svg>
    ) 
  },
  twitter: { name: 'X (Twitter)', icon: <Twitter className="w-5 h-5" /> },
  linkedin: { 
    name: 'LinkedIn', 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ) 
  },
};

const frequencies = [
  { value: 'few_times_week', label: 'A few times a week' },
  { value: 'daily', label: 'Daily' },
  { value: 'multiple_per_day', label: 'Multiple times per day' },
];

export function WorkflowsStep() {
  const { data, updateData, setCurrentStep } = useOnboarding();

  // Get connected platforms from onboarding
  const connectedPlatforms = Object.entries(data.connectedAccounts)
    .filter(([_, acc]) => acc.connected)
    .map(([id]) => id);

  // Available sources are the connected platforms that exist in sourcePlatforms
  const availableSources = connectedPlatforms.filter(p => p in sourcePlatforms);

  // Generate destination options based on source (exclude the source from destinations)
  const getDestinations = () => {
    if (!data.mainSourcePlatform) return [];
    
    // Get all destination platforms except the source
    return Object.keys(destinationPlatforms).filter(p => p !== data.mainSourcePlatform);
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
        <h1 className="text-2xl md:text-3xl font-bold">Set Up Your Repurposing Workflow</h1>
        <p className="text-muted-foreground">
          Choose where you post your original content, and we'll automatically repurpose it to your other platforms.
        </p>
      </div>

      {/* Section 1: Source Platform */}
      <div className="space-y-4">
        <Label className="text-base">Where do you post your original content?</Label>
        {availableSources.length > 0 ? (
          <div className="grid gap-3">
            {availableSources.map((platformId) => {
              const config = sourcePlatforms[platformId as keyof typeof sourcePlatforms];
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
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-xl">
            No source platforms connected. Go back to connect your accounts first.
          </p>
        )}
      </div>

      {/* Section 2: Destinations */}
      {data.mainSourcePlatform && (
        <div className="space-y-4 animate-fade-in">
          <Label className="text-base">
            Repurpose to these platforms:
          </Label>
          <div className="space-y-3">
            {getDestinations().map((destId) => {
              const config = destinationPlatforms[destId as keyof typeof destinationPlatforms];
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
        </div>
      )}

      {/* Section 3: Frequency */}
      <div className="space-y-4">
        <Label className="text-base">How often do you post content?</Label>
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
          Please select at least one destination platform to repurpose to.
        </p>
      )}

      <WizardNavigation
        onContinue={handleContinue}
        continueLabel="Continue"
        disableContinue={!hasValidWorkflow}
      />
    </div>
  );
}
