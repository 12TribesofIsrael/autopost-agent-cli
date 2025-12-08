import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import { WizardLayout } from '@/components/onboarding/WizardLayout';
import { WelcomeStep } from '@/components/onboarding/steps/WelcomeStep';
import { BrandBasicsStep } from '@/components/onboarding/steps/BrandBasicsStep';
import { ConnectAccountsStep } from '@/components/onboarding/steps/ConnectAccountsStep';
import { WorkflowsStep } from '@/components/onboarding/steps/WorkflowsStep';
import { AutoPublishStep } from '@/components/onboarding/steps/AutoPublishStep';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

function OnboardingSteps() {
  const { currentStep, loading } = useOnboarding();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <BrandBasicsStep />;
      case 2:
        return <ConnectAccountsStep />;
      case 3:
        return <WorkflowsStep />;
      case 4:
        return <AutoPublishStep />;
      default:
        return <WelcomeStep />;
    }
  };

  return <WizardLayout>{renderStep()}</WizardLayout>;
}

function OnboardingContent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <OnboardingSteps />;
}

export default function Onboarding() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
}
