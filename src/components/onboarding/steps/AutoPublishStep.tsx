import { useOnboarding } from '@/contexts/OnboardingContext';
import { WizardNavigation } from '../WizardNavigation';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertTriangle, Loader2, Sparkles } from 'lucide-react';

type TestStatus = 'idle' | 'processing' | 'success' | 'error';

export function AutoPublishStep() {
  const { data, updateData, completeOnboarding, saving } = useOnboarding();

  const navigate = useNavigate();
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [errorPlatform, setErrorPlatform] = useState<string | null>(null);

  const handleTest = async () => {
    setTestStatus('processing');
    setErrorPlatform(null);

    // Simulate test workflow
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Random success/error for demo
    const success = Math.random() > 0.2;
    
    if (success) {
      setTestStatus('success');
    } else {
      setTestStatus('error');
      setErrorPlatform('TikTok');
    }
  };

  const handleFinish = async () => {
    await completeOnboarding();
    localStorage.setItem('onboardingComplete', 'true');
    navigate('/dashboard');
  };

  const getDestinationNames = () => {
    const platformNames: Record<string, string> = {
      instagram: 'Instagram Reels',
      tiktok: 'TikTok',
      facebook: 'Facebook Reels',
      youtube: 'YouTube Shorts',
      twitter: 'X (Twitter)',
    };
    return data.destinations.map(d => platformNames[d] || d).join(', ');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Turn On Auto-Publish & Test</h1>
        <p className="text-muted-foreground">
          One final step. We'll send a test post through your workflow so you can see everything working end-to-end.
        </p>
      </div>

      {/* Auto-Publish Toggle */}
      <div className="p-6 rounded-xl border border-border/50 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-semibold">Auto-Publish New Content</Label>
            <p className="text-sm text-muted-foreground">
              When this is on, new posts from your main platform will automatically be sent to your selected destinations.
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
          {data.autoPublishEnabled ? '✓ Auto-Publish is ON' : 'Auto-Publish is OFF'}
        </div>
      </div>

      {/* Test Workflow */}
      <div className="p-6 rounded-xl border border-border/50 bg-card space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Test the workflow</h3>
          <p className="text-sm text-muted-foreground">
            We'll send a quick test post through your workflow. You can delete it later from your social accounts.
          </p>
        </div>

        <RadioGroup
          value={data.testOption}
          onValueChange={(val) => updateData({ testOption: val as 'watch' | 'provided' })}
          className="space-y-3"
        >
          <div
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer',
              data.testOption === 'watch'
                ? 'border-primary bg-primary/10'
                : 'border-border/50 bg-card hover:border-primary/50'
            )}
            onClick={() => updateData({ testOption: 'watch' })}
          >
            <RadioGroupItem value="watch" id="watch" className="mt-1" />
            <div>
              <label htmlFor="watch" className="cursor-pointer font-medium">
                I'll post a test Reel/Video on my main platform in the next few minutes.
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                We'll watch for it and repurpose automatically.
              </p>
            </div>
          </div>

          <div
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer',
              data.testOption === 'provided'
                ? 'border-primary bg-primary/10'
                : 'border-border/50 bg-card hover:border-primary/50'
            )}
            onClick={() => updateData({ testOption: 'provided' })}
          >
            <RadioGroupItem value="provided" id="provided" className="mt-1" />
            <div>
              <label htmlFor="provided" className="cursor-pointer font-medium">
                Use a simple test clip provided by Autopost Agent.
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                We'll upload a basic "Test Post" clip on your behalf.
              </p>
            </div>
          </div>
        </RadioGroup>

        <Button
          onClick={handleTest}
          disabled={testStatus === 'processing'}
          className="w-full gradient-primary glow-primary"
        >
          {testStatus === 'processing' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {data.testOption === 'provided' ? 'Send Test Post Now' : 'Start Watching for Test Post'}
        </Button>

        {/* Status Area */}
        <div className="min-h-[60px]">
          {testStatus === 'idle' && (
            <p className="text-sm text-muted-foreground text-center">Awaiting test...</p>
          )}
          {testStatus === 'processing' && (
            <div className="flex items-center justify-center gap-2 text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">We're processing your test post…</span>
            </div>
          )}
          {testStatus === 'success' && (
            <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-success">
              <div className="flex items-center gap-2 font-medium">
                <Check className="w-5 h-5" />
                Test successful!
              </div>
              <p className="text-sm mt-1 opacity-90">
                We've sent your content to: {getDestinationNames()}.
              </p>
            </div>
          )}
          {testStatus === 'error' && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="w-5 h-5" />
                Something went wrong.
              </div>
              <p className="text-sm mt-1 opacity-90">
                We couldn't post to: {errorPlatform}. Click "View Details" to see what happened.
              </p>
              <Button variant="link" size="sm" className="text-destructive p-0 h-auto mt-2">
                View Details
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Ready to Go */}
      <div className="p-6 rounded-xl gradient-card border border-primary/20 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">You're ready to go!</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          From now on, when you post on your main platform or inside Autopost Agent, we'll handle the repurposing for you.
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
