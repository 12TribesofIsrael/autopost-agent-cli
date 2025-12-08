import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface WizardNavigationProps {
  onContinue: () => void;
  onBack?: () => void;
  continueLabel?: string;
  showSkip?: boolean;
  onSkip?: () => void;
  disableContinue?: boolean;
  isFirstStep?: boolean;
}

export function WizardNavigation({
  onContinue,
  onBack,
  continueLabel = 'Continue',
  showSkip = false,
  onSkip,
  disableContinue = false,
  isFirstStep = false,
}: WizardNavigationProps) {
  const { currentStep, setCurrentStep } = useOnboarding();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setCurrentStep(Math.max(0, currentStep - 1));
    }
  };

  return (
    <div className="flex items-center justify-between pt-8 border-t border-border/40 mt-8">
      <div>
        {!isFirstStep && (
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {showSkip && (
          <Button variant="link" onClick={onSkip} className="text-muted-foreground">
            Skip for now
          </Button>
        )}
        <Button
          onClick={onContinue}
          disabled={disableContinue}
          className="gap-2 gradient-primary glow-primary hover:glow-primary-hover"
        >
          {continueLabel}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
