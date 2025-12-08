import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import { WizardLayout } from '@/components/onboarding/WizardLayout';
import { WelcomeStep } from '@/components/onboarding/steps/WelcomeStep';
import { BrandBasicsStep } from '@/components/onboarding/steps/BrandBasicsStep';
import { ConnectAccountsStep } from '@/components/onboarding/steps/ConnectAccountsStep';
import { WorkflowsStep } from '@/components/onboarding/steps/WorkflowsStep';
import { AutoPublishStep } from '@/components/onboarding/steps/AutoPublishStep';

function OnboardingSteps() {
  const { currentStep } = useOnboarding();

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

export default function Onboarding() {
  return (
    <OnboardingProvider>
      <OnboardingSteps />
    </OnboardingProvider>
  );
}
