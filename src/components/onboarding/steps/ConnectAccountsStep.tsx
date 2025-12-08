import { useOnboarding } from '@/contexts/OnboardingContext';
import { WizardNavigation } from '../WizardNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Instagram, Youtube, Facebook, Twitter } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Platform {
  id: keyof typeof platformIcons;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const platformIcons = {
  instagram: <Instagram className="w-6 h-6" />,
  tiktok: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  ),
  facebook: <Facebook className="w-6 h-6" />,
  youtube: <Youtube className="w-6 h-6" />,
  twitter: <Twitter className="w-6 h-6" />,
};

const platforms: Platform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Use Instagram Reels as your main source or post repurposed content back to your feed.',
    icon: platformIcons.instagram,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Turn your TikTok videos into content for other platforms automatically.',
    icon: platformIcons.tiktok,
  },
  {
    id: 'facebook',
    name: 'Facebook Page',
    description: 'Connect your business page so we can post Reels and updates for you.',
    icon: platformIcons.facebook,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Turn long-form videos into Shorts and clips across other platforms.',
    icon: platformIcons.youtube,
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    description: 'Share short clips and announcements to X automatically.',
    icon: platformIcons.twitter,
  },
];

export function ConnectAccountsStep() {
  const { data, updateData, setCurrentStep } = useOnboarding();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (platformId: keyof typeof data.connectedAccounts) => {
    setConnecting(platformId);
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockHandles: Record<string, string> = {
      instagram: '@yourbrand',
      tiktok: '@yourbrand_tiktok',
      facebook: 'Your Brand Page',
      youtube: 'Your Brand Channel',
      twitter: '@yourbrand_x',
    };

    updateData({
      connectedAccounts: {
        ...data.connectedAccounts,
        [platformId]: { connected: true, handle: mockHandles[platformId] },
      },
    });

    setConnecting(null);
    toast({
      title: 'Account connected!',
      description: `Successfully connected ${platformId}.`,
    });
  };

  const handleDisconnect = (platformId: keyof typeof data.connectedAccounts) => {
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
        <h1 className="text-2xl md:text-3xl font-bold">Connect Your Social Accounts</h1>
        <p className="text-muted-foreground">
          Log in once to each platform you use. We'll never see your passwords—everything is handled securely by the social platforms.
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
        {platforms.map((platform) => {
          const account = data.connectedAccounts[platform.id];
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
                        ? "We'll automatically repurpose new posts according to your workflows."
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
                      {isConnecting ? 'Connecting...' : `Connect ${platform.name}`}
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
