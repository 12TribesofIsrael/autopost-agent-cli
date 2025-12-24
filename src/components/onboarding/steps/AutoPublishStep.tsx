import { useOnboarding } from '@/contexts/OnboardingContext';
import { WizardNavigation } from '../WizardNavigation';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

const destinationNames: Record<string, string> = {
  youtube: 'YouTube Shorts',
  tiktok: 'TikTok',
  instagram: 'Instagram Reels',
  facebook: 'Facebook Reels',
  snapchat: 'Snapchat Spotlight',
  pinterest: 'Pinterest',
  twitter: 'X (Twitter)',
  linkedin: 'LinkedIn',
};

const sourceNames: Record<string, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram Reels',
  youtube: 'YouTube',
  facebook: 'Facebook Reels',
  twitch: 'Twitch',
  snapchat: 'Snapchat Stories',
  podcast: 'Podcast (RSS)',
  googledrive: 'Google Drive',
  dropbox: 'Dropbox',
};

export function AutoPublishStep() {
  const { data, updateData, completeOnboarding, saving } = useOnboarding();
  const navigate = useNavigate();

  const handleFinish = async () => {
    await completeOnboarding();
    localStorage.setItem('onboardingComplete', 'true');
    navigate('/dashboard');
  };

  const getSourceName = () => {
    return sourceNames[data.mainSourcePlatform] || data.mainSourcePlatform || 'your source platform';
  };

  const getDestinationList = () => {
    if (data.destinations.length === 0) return 'no platforms selected';
    return data.destinations.map(d => destinationNames[d] || d).join(', ');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Confirm Your Settings</h1>
        <p className="text-muted-foreground">
          Review your repurposing workflow and enable auto-publish when you're ready.
        </p>
      </div>

      {/* Workflow Summary */}
      <div className="p-6 rounded-xl border border-border/50 bg-card space-y-4">
        <h3 className="font-semibold">Your Workflow</h3>
        <div className="flex items-center gap-3 text-sm">
          <div className="px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium">
            {getSourceName()}
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className="px-3 py-2 rounded-lg bg-muted text-muted-foreground">
            {getDestinationList()}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          When you post new content on <strong>{getSourceName()}</strong>, it will automatically be repurposed and published to your selected destinations.
        </p>
      </div>

      {/* Auto-Publish Toggle */}
      <div className="p-6 rounded-xl border border-border/50 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-semibold">Auto-Publish</Label>
            <p className="text-sm text-muted-foreground">
              Automatically publish repurposed content without manual approval.
            </p>
          </div>
          <Switch
            checked={data.autoPublishEnabled}
            onCheckedChange={(checked) => updateData({ autoPublishEnabled: checked })}
          />
        </div>
        <div className={cn(
          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
          data.autoPublishEnabled 
            ? 'bg-success/10 text-success border border-success/20' 
            : 'bg-muted text-muted-foreground'
        )}>
          {data.autoPublishEnabled ? '✓ Auto-Publish is ON' : 'Auto-Publish is OFF - you\'ll review each post'}
        </div>
      </div>

      {/* How It Works */}
      <div className="p-6 rounded-xl border border-border/50 bg-card space-y-4">
        <h3 className="font-semibold">How It Works</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Post content on <strong>{getSourceName()}</strong> as you normally would
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
            <p className="text-sm text-muted-foreground">
              We detect new posts and automatically repurpose them
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {data.autoPublishEnabled 
                ? 'Content is published automatically to your destinations'
                : 'Review and approve each post before it goes live'}
            </p>
          </div>
        </div>
      </div>

      {/* Ready to Go */}
      <div className="p-6 rounded-xl gradient-card border border-primary/20 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">You're all set!</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Your repurposing workflow is ready. Start posting on {getSourceName()} and watch your content spread across all your platforms automatically.
        </p>
      </div>

      <WizardNavigation
        onContinue={handleFinish}
        continueLabel={saving ? "Saving..." : "Finish Setup"}
        disableContinue={saving}
      />
    </div>
  );
}
