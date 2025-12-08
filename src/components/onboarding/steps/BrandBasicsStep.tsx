import { useOnboarding } from '@/contexts/OnboardingContext';
import { WizardNavigation } from '../WizardNavigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const industries = [
  { value: 'boxing_combat_sports', label: 'Boxing / Combat Sports' },
  { value: 'fitness_gym', label: 'Fitness / Gym' },
  { value: 'food_restaurant', label: 'Food & Restaurant' },
  { value: 'retail_storefront', label: 'Retail / Storefront' },
  { value: 'beauty_salon', label: 'Beauty / Salon' },
  { value: 'other_local_business', label: 'Other local business' },
];

const postingGoals = [
  { id: 'traffic', label: 'Get more people in the door' },
  { id: 'brand', label: 'Build my personal brand' },
  { id: 'events', label: 'Promote events or fights' },
  { id: 'sales', label: 'Sell products / services' },
  { id: 'visibility', label: 'Stay consistent and visible' },
];

export function BrandBasicsStep() {
  const { data, updateData, setCurrentStep } = useOnboarding();

  const toggleGoal = (goalId: string) => {
    const newGoals = data.postingGoals.includes(goalId)
      ? data.postingGoals.filter(g => g !== goalId)
      : [...data.postingGoals, goalId];
    updateData({ postingGoals: newGoals });
  };

  const handleContinue = () => {
    setCurrentStep(2);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Brand Basics</h1>
        <p className="text-muted-foreground">
          Help us understand your brand so captions and content match your voice.
        </p>
      </div>

      {/* Brand Name */}
      <div className="space-y-2">
        <Label htmlFor="brandNameEdit">Brand / Business name</Label>
        <Input
          id="brandNameEdit"
          placeholder="e.g., Philly Knockout Boxing Club"
          value={data.brandName}
          onChange={(e) => updateData({ brandName: e.target.value })}
          className="bg-card border-border/50"
        />
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <Label>Industry</Label>
        <Select value={data.industry} onValueChange={(val) => updateData({ industry: val })}>
          <SelectTrigger className="bg-card border-border/50">
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((ind) => (
              <SelectItem key={ind.value} value={ind.value}>
                {ind.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand Voice */}
      <div className="space-y-2">
        <Label htmlFor="brandVoice">How should we sound online?</Label>
        <Textarea
          id="brandVoice"
          placeholder="Example: High-energy, motivating, a little playful but always professional."
          value={data.brandVoice}
          onChange={(e) => updateData({ brandVoice: e.target.value })}
          className="bg-card border-border/50 min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          Short and punchy? Family-friendly? Motivational? Describe it in a sentence or two.
        </p>
      </div>

      {/* Posting Goals */}
      <div className="space-y-4">
        <Label>What's your main goal with content?</Label>
        <div className="space-y-3">
          {postingGoals.map((goal) => (
            <div key={goal.id} className="flex items-center gap-3">
              <Checkbox
                id={goal.id}
                checked={data.postingGoals.includes(goal.id)}
                onCheckedChange={() => toggleGoal(goal.id)}
              />
              <label
                htmlFor={goal.id}
                className="text-sm cursor-pointer hover:text-foreground transition-colors"
              >
                {goal.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <WizardNavigation
        onContinue={handleContinue}
        continueLabel="Continue to Connections"
        disableContinue={!data.brandName || !data.industry}
      />
    </div>
  );
}
