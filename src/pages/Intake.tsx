import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PlatformIntake from "@/components/intake/PlatformIntake";
import Navigation from "@/components/Navigation";
import { CheckCircle, ArrowLeft } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface PlatformData {
  hasAccount: boolean | null;
  handleOrUrl: string;
  addToWorkflow: boolean;
  wantsAccountCreation: boolean | null;
}

type PlatformsState = Record<string, PlatformData>;

const PLATFORMS = [
  { key: "youtube", name: "YouTube", placeholder: "e.g. https://youtube.com/@yourchannel" },
  { key: "tiktok", name: "TikTok", placeholder: "e.g. @yourhandle" },
  { key: "facebook", name: "Facebook", placeholder: "e.g. https://facebook.com/yourpage" },
  { key: "instagram", name: "Instagram", placeholder: "e.g. @yourhandle" },
  { key: "pinterest", name: "Pinterest", placeholder: "e.g. https://pinterest.com/yourprofile" },
  { key: "linkedin", name: "LinkedIn", placeholder: "e.g. https://linkedin.com/company/yourcompany" },
  { key: "snapchat", name: "Snapchat", placeholder: "e.g. @yourhandle" },
];

const createEmptyPlatformData = (): PlatformData => ({
  hasAccount: null,
  handleOrUrl: "",
  addToWorkflow: false,
  wantsAccountCreation: null,
});

const createInitialPlatformsState = (): PlatformsState => {
  const state: PlatformsState = {};
  PLATFORMS.forEach((p) => {
    state[p.key] = createEmptyPlatformData();
  });
  return state;
};

const Intake = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [postingFrequency, setPostingFrequency] = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [platforms, setPlatforms] = useState<PlatformsState>(createInitialPlatformsState);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePlatformChange = (key: string, data: PlatformData) => {
    setPlatforms((prev) => ({ ...prev, [key]: data }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!businessType) {
      newErrors.businessType = "Business type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: "Please fix the errors",
        description: "Some required fields are missing or invalid.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const formData = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      business_name: businessName.trim() || null,
      business_type: businessType,
      posting_frequency: postingFrequency || null,
      pain_point: painPoint.trim() || null,
      extra_notes: extraNotes.trim() || null,
      platforms: JSON.parse(JSON.stringify(platforms)) as Json,
    };
    try {
      const { error } = await supabase.from("intake_submissions").insert([formData]);

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast({
        title: "Intake submitted!",
        description: "We've received your details and will follow up soon.",
      });
    } catch (error: any) {
      console.error("Error submitting intake:", error);
      toast({
        title: "Submission failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="container max-w-2xl">
            <div className="text-center space-y-6 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mx-auto">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h1 className="text-3xl font-bold">Thanks!</h1>
              <p className="text-lg text-muted-foreground">
                We've received your intake details. We'll review your platforms and follow up by email with next steps for your autopost workflow.
              </p>
              <Button onClick={() => navigate("/")} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 py-12">
        <div className="container max-w-3xl">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">Client Intake – Autopost Setup</h1>
            <p className="text-muted-foreground">
              Answer a few questions so we can design the right autopost workflow for your brand.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Section 1: Basic Info */}
            <section className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold border-b border-border pb-2">Basic Info</h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={errors.fullName ? "border-destructive" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Your Gym LLC"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger className={errors.businessType ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select your business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boxing_gym">Boxing gym</SelectItem>
                      <SelectItem value="gym_fitness">Gym / Fitness</SelectItem>
                      <SelectItem value="daycare">Daycare</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.businessType && (
                    <p className="text-sm text-destructive">{errors.businessType}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Section 2: Social Platform Presence */}
            <section className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-semibold border-b border-border pb-2 mb-2">
                  Your Social Media Presence
                </h2>
                <p className="text-sm text-muted-foreground">
                  For each platform, tell us if you already have an account, whether you want it in your autopost workflow, and if you want us to create it for you if it doesn't exist.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {PLATFORMS.map((platform) => (
                  <PlatformIntake
                    key={platform.key}
                    platformName={platform.name}
                    platformKey={platform.key}
                    placeholder={platform.placeholder}
                    data={platforms[platform.key]}
                    onChange={handlePlatformChange}
                  />
                ))}
              </div>

              <p className="text-xs text-muted-foreground italic">
                Account creation is a paid add-on handled by an adult on our team. No payments are taken inside this app.
              </p>
            </section>

            {/* Section 3: Summary & Intent */}
            <section className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold border-b border-border pb-2">Posting Goals</h2>

              <div className="space-y-2">
                <Label htmlFor="postingFrequency">How many short videos do you post per week?</Label>
                <Select value={postingFrequency} onValueChange={setPostingFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1-2">1–2</SelectItem>
                    <SelectItem value="3-5">3–5</SelectItem>
                    <SelectItem value="6+">6+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="painPoint">
                  What's the most annoying part about posting your videos everywhere?
                </Label>
                <Textarea
                  id="painPoint"
                  placeholder="Tell us about your biggest frustration..."
                  value={painPoint}
                  onChange={(e) => setPainPoint(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="extraNotes">
                  Anything else we should know before we design your autopost workflow? (optional)
                </Label>
                <Textarea
                  id="extraNotes"
                  placeholder="Any special requests, questions, or notes..."
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-4">
              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Intake"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Intake;
