import { useOnboarding } from '@/contexts/OnboardingContext';
import { WizardNavigation } from '../WizardNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Lock, Instagram, Youtube, Facebook, Twitter, Podcast, HardDrive, Cloud, Eye, EyeOff, Check, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Platform {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  brandColor: string;
}

interface CredentialForm {
  username: string;
  password: string;
  twoFactorBackup: string;
  notes: string;
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

// All platforms combined (source + destination)
const allPlatforms: Platform[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Your TikTok account credentials',
    icon: <TikTokIcon className="w-6 h-6" />,
    brandColor: '#000000',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Your Instagram account credentials',
    icon: <Instagram className="w-6 h-6" />,
    brandColor: '#E4405F',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Your YouTube/Google account credentials',
    icon: <Youtube className="w-6 h-6" />,
    brandColor: '#FF0000',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Your Facebook account credentials',
    icon: <Facebook className="w-6 h-6" />,
    brandColor: '#1877F2',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    description: 'Your X/Twitter account credentials',
    icon: <Twitter className="w-6 h-6" />,
    brandColor: '#000000',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    description: 'Your Snapchat account credentials',
    icon: <SnapchatIcon className="w-6 h-6" />,
    brandColor: '#FFFC00',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    description: 'Your Pinterest account credentials',
    icon: <PinterestIcon className="w-6 h-6" />,
    brandColor: '#E60023',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Your LinkedIn account credentials',
    icon: <LinkedInIcon className="w-6 h-6" />,
    brandColor: '#0A66C2',
  },
  {
    id: 'twitch',
    name: 'Twitch',
    description: 'Your Twitch account credentials',
    icon: <TwitchIcon className="w-6 h-6" />,
    brandColor: '#9146FF',
  },
  {
    id: 'podcast',
    name: 'Podcast (RSS)',
    description: 'Your podcast platform credentials',
    icon: <Podcast className="w-6 h-6" />,
    brandColor: '#8B5CF6',
  },
  {
    id: 'googledrive',
    name: 'Google Drive',
    description: 'Your Google account credentials',
    icon: <HardDrive className="w-6 h-6" />,
    brandColor: '#4285F4',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Your Dropbox account credentials',
    icon: <Cloud className="w-6 h-6" />,
    brandColor: '#0061FF',
  },
];

export function ConnectAccountsStep() {
  const { setCurrentStep } = useOnboarding();
  const { toast } = useToast();
  const { user } = useAuth();
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [savedPlatforms, setSavedPlatforms] = useState<Set<string>>(new Set());
  const [forms, setForms] = useState<Record<string, CredentialForm>>({});

  // Load existing credentials on mount
  useEffect(() => {
    if (!user) return;

    const loadCredentials = async () => {
      const { data: credentials } = await supabase
        .from('platform_credentials')
        .select('platform, username, two_factor_backup, notes')
        .eq('user_id', user.id);

      if (credentials) {
        const saved = new Set<string>();
        const loadedForms: Record<string, CredentialForm> = {};
        
        credentials.forEach(cred => {
          saved.add(cred.platform);
          loadedForms[cred.platform] = {
            username: cred.username,
            password: '••••••••', // Don't show actual password
            twoFactorBackup: cred.two_factor_backup || '',
            notes: cred.notes || '',
          };
        });
        
        setSavedPlatforms(saved);
        setForms(loadedForms);
      }
    };

    loadCredentials();
  }, [user]);

  const getForm = (platformId: string): CredentialForm => {
    return forms[platformId] || { username: '', password: '', twoFactorBackup: '', notes: '' };
  };

  const updateForm = (platformId: string, field: keyof CredentialForm, value: string) => {
    setForms(prev => ({
      ...prev,
      [platformId]: {
        ...getForm(platformId),
        [field]: value,
      },
    }));
  };

  const handleSaveCredentials = async (platformId: string) => {
    if (!user) return;

    const form = getForm(platformId);
    
    if (!form.username.trim() || !form.password.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter both username and password.',
        variant: 'destructive',
      });
      return;
    }

    // Don't save if password is masked placeholder
    if (form.password === '••••••••') {
      toast({
        title: 'Password required',
        description: 'Please enter your password to update credentials.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(platformId);

    try {
      const { error } = await supabase
        .from('platform_credentials')
        .upsert({
          user_id: user.id,
          platform: platformId,
          username: form.username.trim(),
          password: form.password,
          two_factor_backup: form.twoFactorBackup.trim() || null,
          notes: form.notes.trim() || null,
        }, { onConflict: 'user_id,platform' });

      if (error) throw error;

      setSavedPlatforms(prev => new Set([...prev, platformId]));
      setExpandedPlatform(null);
      
      // Mask the password after saving
      setForms(prev => ({
        ...prev,
        [platformId]: {
          ...form,
          password: '••••••••',
        },
      }));

      // Send notification email to team (fire and forget)
      supabase.functions.invoke('send-credentials-notification', {
        body: {
          platform: platformId,
          username: form.username.trim(),
          userEmail: user.email,
        },
      }).catch(err => console.error('Failed to send notification:', err));

      toast({
        title: 'Credentials saved!',
        description: 'Your team will set up this account for you.',
      });
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast({
        title: 'Error saving',
        description: 'Could not save credentials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  const handleRemoveCredentials = async (platformId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('platform_credentials')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', platformId);

      setSavedPlatforms(prev => {
        const next = new Set(prev);
        next.delete(platformId);
        return next;
      });

      setForms(prev => {
        const next = { ...prev };
        delete next[platformId];
        return next;
      });

      toast({
        title: 'Credentials removed',
        description: 'Account credentials have been deleted.',
      });
    } catch (error) {
      console.error('Error removing credentials:', error);
    }
  };

  const hasAtLeastOneCredential = savedPlatforms.size > 0;

  const handleContinue = () => {
    setCurrentStep(3);
  };

  const handleSkip = () => {
    setCurrentStep(3);
  };

  const renderPlatformCard = (platform: Platform) => {
    const isSaved = savedPlatforms.has(platform.id);
    const isExpanded = expandedPlatform === platform.id;
    const form = getForm(platform.id);
    const isSaving = saving === platform.id;

    return (
      <div
        key={platform.id}
        className={`rounded-xl border transition-all overflow-hidden ${
          isSaved
            ? 'border-success/30 bg-success/5'
            : 'border-border/50 bg-card'
        }`}
      >
        {/* Header */}
        <div 
          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setExpandedPlatform(isExpanded ? null : platform.id)}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{ 
                  backgroundColor: isSaved ? `${platform.brandColor}20` : 'hsl(var(--muted))',
                  color: isSaved ? platform.brandColor : 'hsl(var(--muted-foreground))'
                }}
              >
                {platform.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm">{platform.name}</h3>
                  {isSaved && (
                    <Badge className="bg-success text-success-foreground text-xs gap-1">
                      <Check className="w-3 h-3" />
                      Submitted
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isSaved ? `@${form.username}` : 'Click to add credentials'}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        {/* Expanded Form */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-border/50 space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Username / Email / Handle
              </label>
              <Input
                placeholder="Enter your username or email"
                value={form.username}
                onChange={(e) => updateForm(platform.id, 'username', e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword[platform.id] ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => updateForm(platform.id, 'password', e.target.value)}
                  onFocus={() => {
                    if (form.password === '••••••••') {
                      updateForm(platform.id, 'password', '');
                    }
                  }}
                  className="h-9 text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, [platform.id]: !prev[platform.id] }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword[platform.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                2FA Backup Codes <span className="text-muted-foreground/60">(optional)</span>
              </label>
              <Textarea
                placeholder="If you have 2FA enabled, paste backup codes here"
                value={form.twoFactorBackup}
                onChange={(e) => updateForm(platform.id, 'twoFactorBackup', e.target.value)}
                className="text-sm min-h-[60px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Notes <span className="text-muted-foreground/60">(optional)</span>
              </label>
              <Input
                placeholder="Any additional login info or instructions"
                value={form.notes}
                onChange={(e) => updateForm(platform.id, 'notes', e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => handleSaveCredentials(platform.id)}
                disabled={isSaving}
                size="sm"
                className="flex-1"
                style={{ 
                  backgroundColor: platform.brandColor,
                  color: platform.brandColor === '#FFFC00' ? '#000' : '#fff'
                }}
              >
                {isSaving ? 'Saving...' : isSaved ? 'Update' : 'Save Credentials'}
              </Button>
              {isSaved && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCredentials(platform.id)}
                  className="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Provide Account Access</h1>
        <p className="text-muted-foreground">
          Share login credentials for the accounts you <strong>already have</strong>. We'll connect them to our automation system for you.
        </p>
      </div>

      {/* Important Note Banner */}
      <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/30 rounded-xl">
        <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">Only add accounts you already have</p>
          <p className="text-muted-foreground mt-1">
            Skip any platforms where you don't have an account. If you want us to create new accounts for you, just let us know separately — no need to fill anything here for those.
          </p>
        </div>
      </div>

      {/* Security Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <Lock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-primary">Your credentials are secure</p>
          <p className="text-muted-foreground mt-1">
            Stored with encryption and only accessible by our setup team. You can remove credentials at any time.
          </p>
        </div>
      </div>

      {/* Platform List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Existing Accounts</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Click on a platform to add your login credentials
        </p>
        <div className="grid gap-2">
          {allPlatforms.map(renderPlatformCard)}
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground text-center">
        {hasAtLeastOneCredential 
          ? `${savedPlatforms.size} platform${savedPlatforms.size > 1 ? 's' : ''} ready for setup`
          : 'Add at least one platform to continue'}
      </p>

      <WizardNavigation
        onContinue={handleContinue}
        continueLabel="Continue to Workflows"
        showSkip
        onSkip={handleSkip}
        disableContinue={!hasAtLeastOneCredential}
      />
    </div>
  );
}
