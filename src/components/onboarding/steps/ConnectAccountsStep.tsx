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
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-6 h-6" />,
  tiktok: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  ),
  facebook: <Facebook className="w-6 h-6" />,
  youtube: <Youtube className="w-6 h-6" />,
  twitter: <Twitter className="w-6 h-6" />,
  twitch: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
    </svg>
  ),
  snapchat: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c-1.5 0-3 .5-4 1.5-1.5 1.5-1.5 3.5-1.5 5v1c-.5 0-1 .5-1 1s.5 1 1 1c0 1-1 2-2 2.5-.5.5 0 1 .5 1.5 1 0 2 .5 2.5 1 .5.5.5 1 1 1.5.5.5 1.5.5 2.5.5s2 0 2.5-.5c.5-.5.5-1 1-1.5.5-.5 1.5-1 2.5-1 .5-.5 1-1 .5-1.5-1-.5-2-1.5-2-2.5.5 0 1-.5 1-1s-.5-1-1-1v-1c0-1.5 0-3.5-1.5-5C15 2.5 13.5 2 12 2z"/>
    </svg>
  ),
  podcast: <Podcast className="w-6 h-6" />,
  googledrive: <HardDrive className="w-6 h-6" />,
  dropbox: <Cloud className="w-6 h-6" />,
  pinterest: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
    </svg>
  ),
  linkedin: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
};

// Source platforms - where content can be pulled from
const sourcePlatforms: Platform[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Repurpose your TikTok videos to other platforms automatically.',
    icon: platformIcons.tiktok,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Repurpose your Instagram Reels to other platforms.',
    icon: platformIcons.instagram,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Repurpose your YouTube videos and Shorts to other platforms.',
    icon: platformIcons.youtube,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Repurpose your Facebook Reels to other platforms.',
    icon: platformIcons.facebook,
  },
  {
    id: 'twitch',
    name: 'Twitch',
    description: 'Repurpose clips from your Twitch streams.',
    icon: platformIcons.twitch,
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    description: 'Repurpose your Snapchat Stories to other platforms.',
    icon: platformIcons.snapchat,
  },
  {
    id: 'podcast',
    name: 'Podcast (RSS)',
    description: 'Repurpose audio clips from your podcast feed.',
    icon: platformIcons.podcast,
  },
  {
    id: 'googledrive',
    name: 'Google Drive',
    description: 'Repurpose videos stored in your Google Drive.',
    icon: platformIcons.googledrive,
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Repurpose videos stored in your Dropbox.',
    icon: platformIcons.dropbox,
  },
];

// Destination platforms - where content can be published to
const destinationPlatforms: Platform[] = [
  {
    id: 'youtube',
    name: 'YouTube Shorts',
    description: 'Publish short-form videos to YouTube Shorts.',
    icon: platformIcons.youtube,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Publish videos to TikTok.',
    icon: platformIcons.tiktok,
  },
  {
    id: 'instagram',
    name: 'Instagram Reels',
    description: 'Publish videos to Instagram Reels.',
    icon: platformIcons.instagram,
  },
  {
    id: 'facebook',
    name: 'Facebook Reels',
    description: 'Publish videos to Facebook Reels.',
    icon: platformIcons.facebook,
  },
  {
    id: 'snapchat',
    name: 'Snapchat Spotlight',
    description: 'Publish videos to Snapchat Spotlight.',
    icon: platformIcons.snapchat,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    description: 'Publish video pins to Pinterest.',
    icon: platformIcons.pinterest,
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    description: 'Share video clips to X.',
    icon: platformIcons.twitter,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Share professional video content to LinkedIn.',
    icon: platformIcons.linkedin,
  },
];

// Combine all unique platforms for the connection step
const allPlatforms = [...sourcePlatforms, ...destinationPlatforms].reduce<Platform[]>((acc, platform) => {
  if (!acc.find(p => p.id === platform.id)) {
    acc.push(platform);
  }
  return acc;
}, []);

export function ConnectAccountsStep() {
  const { data, updateData, setCurrentStep } = useOnboarding();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockHandles: Record<string, string> = {
      instagram: '@yourbrand',
      tiktok: '@yourbrand_tiktok',
      facebook: 'Your Brand Page',
      youtube: 'Your Brand Channel',
      twitter: '@yourbrand_x',
      twitch: 'yourbrand_tv',
      snapchat: '@yourbrand_snap',
      podcast: 'Your Podcast Feed',
      googledrive: 'Connected',
      dropbox: 'Connected',
      pinterest: '@yourbrand_pins',
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
      description: `Successfully connected ${platformId}.`,
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
      description: `${platformId} has been disconnected.`,
    });
  };

  const hasAtLeastOneConnection = Object.values(data.connectedAccounts).some(acc => acc.connected);

  const handleContinue = () => {
    setCurrentStep(3);
  };

  const handleSkip = () => {
    setCurrentStep(3);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Connect Your Accounts</h1>
        <p className="text-muted-foreground">
          Connect the platforms where you post content and where you want to repurpose to. We handle everything securely.
        </p>
      </div>

      {/* Security Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <Lock className="w-5 h-5 text-primary mt-0.5" />
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Security note:</strong> When you click "Connect", you'll be taken to the official login screen for that platform. We never store your password—only a secure token that you can revoke at any time.
        </p>
      </div>

      {/* Platform Cards */}
      <div className="grid gap-4">
        {allPlatforms.map((platform) => {
          const account = data.connectedAccounts[platform.id as keyof typeof data.connectedAccounts];
          const isConnected = account?.connected;
          const isConnecting = connecting === platform.id;

          return (
            <div
              key={platform.id}
              className={`p-5 rounded-xl border transition-all ${
                isConnected
                  ? 'border-success/30 bg-success/5'
                  : 'border-border/50 bg-card'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${isConnected ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {platform.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{platform.name}</h3>
                      <Badge
                        variant={isConnected ? 'default' : 'secondary'}
                        className={isConnected ? 'bg-success text-success-foreground' : ''}
                      >
                        {isConnected ? `Connected as ${account.handle}` : 'Not Connected'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isConnected
                        ? "We'll automatically repurpose content according to your workflows."
                        : platform.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {isConnected ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnect(platform.id)}
                        disabled={isConnecting}
                      >
                        {isConnecting ? 'Connecting...' : 'Reconnect'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(platform.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleConnect(platform.id)}
                      disabled={isConnecting}
                      className="gradient-primary glow-primary"
                    >
                      {isConnecting ? 'Connecting...' : 'Connect'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground text-center">
        You'll need at least one connected account before your workflows can run.
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
