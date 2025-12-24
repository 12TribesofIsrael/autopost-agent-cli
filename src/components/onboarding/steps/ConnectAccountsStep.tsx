import { useOnboarding } from '@/contexts/OnboardingContext';
import { WizardNavigation } from '../WizardNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Instagram, Youtube, Facebook, Twitter, Podcast, HardDrive, Cloud } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Platform {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  brandColor: string;
}

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

// Twitch icon component
const TwitchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
  </svg>
);

// Snapchat icon component
const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.166 0c2.112 0 4.327.865 5.647 2.389 1.32 1.524 1.706 3.473 1.706 5.607v1.284c.264-.02.525-.03.774-.03.53 0 .87.107 1.091.323.222.216.283.493.19.85-.093.356-.398.675-.867.906-.469.232-1.09.373-1.737.484-.648.11-1.294.19-1.8.311-.505.121-.833.27-1.014.512-.182.242-.274.543-.274.882 0 .34.092.67.274.912.182.242.509.39 1.014.512.506.12 1.152.201 1.8.31.647.112 1.268.253 1.737.485.469.231.774.55.867.906.093.357.032.634-.19.85-.221.216-.561.323-1.09.323-.25 0-.51-.01-.775-.03v.214c0 .668-.25 1.267-.63 1.697-.38.43-.891.69-1.454.69h-.637c-.563 0-1.074-.26-1.454-.69-.38-.43-.63-1.029-.63-1.697v-.214c-.265.02-.526.03-.775.03-.53 0-.87-.107-1.091-.323-.222-.216-.283-.493-.19-.85.093-.356.398-.674.867-.906.469-.232 1.09-.373 1.737-.484.648-.11 1.294-.19 1.8-.311.505-.121.833-.27 1.014-.512.182-.242.274-.572.274-.912 0-.34-.092-.64-.274-.882-.181-.242-.509-.39-1.014-.512-.506-.12-1.152-.201-1.8-.31-.647-.112-1.268-.253-1.737-.485-.469-.231-.774-.55-.867-.906-.093-.357-.032-.634.19-.85.221-.216.561-.323 1.09-.323.25 0 .511.01.775.03V8c0-2.134-.386-4.083-1.706-5.607C7.839.865 5.624 0 3.512 0h8.654z"/>
  </svg>
);

// Pinterest icon component
const PinterestIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
  </svg>
);

// LinkedIn icon component
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

// Source platforms - where content originates from
const sourcePlatforms: Platform[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Repurpose your TikTok videos automatically.',
    icon: <TikTokIcon className="w-6 h-6" />,
    brandColor: '#000000',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Repurpose your Instagram Reels.',
    icon: <Instagram className="w-6 h-6" />,
    brandColor: '#E4405F',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Repurpose your YouTube videos and Shorts.',
    icon: <Youtube className="w-6 h-6" />,
    brandColor: '#FF0000',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Repurpose your Facebook Reels.',
    icon: <Facebook className="w-6 h-6" />,
    brandColor: '#1877F2',
  },
  {
    id: 'twitch',
    name: 'Twitch',
    description: 'Repurpose clips from your Twitch streams.',
    icon: <TwitchIcon className="w-6 h-6" />,
    brandColor: '#9146FF',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    description: 'Repurpose your Snapchat Stories.',
    icon: <SnapchatIcon className="w-6 h-6" />,
    brandColor: '#FFFC00',
  },
  {
    id: 'podcast',
    name: 'Podcast (RSS)',
    description: 'Repurpose audio clips from your podcast.',
    icon: <Podcast className="w-6 h-6" />,
    brandColor: '#8B5CF6',
  },
  {
    id: 'googledrive',
    name: 'Google Drive',
    description: 'Repurpose videos from your Drive.',
    icon: <HardDrive className="w-6 h-6" />,
    brandColor: '#4285F4',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Repurpose videos from Dropbox.',
    icon: <Cloud className="w-6 h-6" />,
    brandColor: '#0061FF',
  },
];

// Destination platforms - where content gets published to
const destinationPlatforms: Platform[] = [
  {
    id: 'youtube_dest',
    name: 'YouTube Shorts',
    description: 'Publish to YouTube Shorts.',
    icon: <Youtube className="w-6 h-6" />,
    brandColor: '#FF0000',
  },
  {
    id: 'tiktok_dest',
    name: 'TikTok',
    description: 'Publish to TikTok.',
    icon: <TikTokIcon className="w-6 h-6" />,
    brandColor: '#000000',
  },
  {
    id: 'instagram_dest',
    name: 'Instagram Reels',
    description: 'Publish to Instagram Reels.',
    icon: <Instagram className="w-6 h-6" />,
    brandColor: '#E4405F',
  },
  {
    id: 'facebook_dest',
    name: 'Facebook Reels',
    description: 'Publish to Facebook Reels.',
    icon: <Facebook className="w-6 h-6" />,
    brandColor: '#1877F2',
  },
  {
    id: 'snapchat_dest',
    name: 'Snapchat Spotlight',
    description: 'Publish to Snapchat Spotlight.',
    icon: <SnapchatIcon className="w-6 h-6" />,
    brandColor: '#FFFC00',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    description: 'Publish video pins to Pinterest.',
    icon: <PinterestIcon className="w-6 h-6" />,
    brandColor: '#E60023',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    description: 'Share video clips to X.',
    icon: <Twitter className="w-6 h-6" />,
    brandColor: '#000000',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Share professional content to LinkedIn.',
    icon: <LinkedInIcon className="w-6 h-6" />,
    brandColor: '#0A66C2',
  },
];

export function ConnectAccountsStep() {
  const { data, updateData, setCurrentStep } = useOnboarding();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockHandles: Record<string, string> = {
      tiktok: '@yourbrand_tiktok',
      instagram: '@yourbrand',
      youtube: 'Your Brand Channel',
      facebook: 'Your Brand Page',
      twitch: 'yourbrand_tv',
      snapchat: '@yourbrand_snap',
      podcast: 'Your Podcast Feed',
      googledrive: 'Connected',
      dropbox: 'Connected',
      youtube_dest: 'Your Brand Channel',
      tiktok_dest: '@yourbrand_tiktok',
      instagram_dest: '@yourbrand',
      facebook_dest: 'Your Brand Page',
      snapchat_dest: '@yourbrand_snap',
      pinterest: '@yourbrand_pins',
      twitter: '@yourbrand_x',
      linkedin: 'Your Brand',
    };

    updateData({
      connectedAccounts: {
        ...data.connectedAccounts,
        [platformId]: { connected: true, handle: mockHandles[platformId] || 'Connected' },
      },
    });

    setConnecting(null);
    toast({
      title: 'Account connected!',
      description: `Successfully connected.`,
    });
  };

  const handleDisconnect = (platformId: string) => {
    updateData({
      connectedAccounts: {
        ...data.connectedAccounts,
        [platformId]: { connected: false, handle: '' },
      },
    });
    toast({
      title: 'Account disconnected',
      description: `Account has been disconnected.`,
    });
  };

  const hasAtLeastOneConnection = Object.values(data.connectedAccounts).some(acc => acc.connected);

  const handleContinue = () => {
    setCurrentStep(3);
  };

  const handleSkip = () => {
    setCurrentStep(3);
  };

  const renderPlatformCard = (platform: Platform) => {
    const account = data.connectedAccounts[platform.id as keyof typeof data.connectedAccounts];
    const isConnected = account?.connected;
    const isConnecting = connecting === platform.id;

    return (
      <div
        key={platform.id}
        className={`p-4 rounded-xl border transition-all ${
          isConnected
            ? 'border-success/30 bg-success/5'
            : 'border-border/50 bg-card hover:border-border'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ 
                backgroundColor: isConnected ? `${platform.brandColor}20` : 'hsl(var(--muted))',
                color: isConnected ? platform.brandColor : 'hsl(var(--muted-foreground))'
              }}
            >
              {platform.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm">{platform.name}</h3>
                {isConnected && (
                  <Badge className="bg-success text-success-foreground text-xs">
                    {account.handle}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {platform.description}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {isConnected ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDisconnect(platform.id)}
                className="text-destructive hover:text-destructive text-xs"
              >
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={() => handleConnect(platform.id)}
                disabled={isConnecting}
                size="sm"
                style={{ 
                  backgroundColor: platform.brandColor,
                  color: platform.brandColor === '#FFFC00' || platform.brandColor === '#FFFC00' ? '#000' : '#fff'
                }}
                className="hover:opacity-90"
              >
                {isConnecting ? '...' : 'Connect'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Connect Your Accounts</h1>
        <p className="text-muted-foreground">
          Connect your source platforms (where you post) and destination platforms (where we'll repurpose to).
        </p>
      </div>

      {/* Security Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <Lock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Secure:</strong> We use official OAuth—your passwords are never stored.
        </p>
      </div>

      {/* Source Platforms */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source Platforms</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <p className="text-xs text-muted-foreground text-center">Where your original content lives</p>
        <div className="grid gap-3">
          {sourcePlatforms.map(renderPlatformCard)}
        </div>
      </div>

      {/* Destination Platforms */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Destination Platforms</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <p className="text-xs text-muted-foreground text-center">Where we'll publish your repurposed content</p>
        <div className="grid gap-3">
          {destinationPlatforms.map(renderPlatformCard)}
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground text-center">
        Connect at least one source and one destination to set up your workflow.
      </p>

      <WizardNavigation
        onContinue={handleContinue}
        continueLabel="Continue to Workflows"
        showSkip
        onSkip={handleSkip}
        disableContinue={!hasAtLeastOneConnection}
      />
    </div>
  );
}
