import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import PlatformIntake, { type PlatformData, type PostTypes } from "@/components/intake/PlatformIntake";
import Navigation from "@/components/Navigation";
import { CheckCircle, ArrowLeft, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

type PlatformsState = Record<string, PlatformData>;

type PlatformConfig = {
  key: string;
  name: string;
  placeholder: string;
  supportedPostTypes?: Array<keyof PostTypes>;
};

const PLATFORMS: PlatformConfig[] = [
  { key: "youtube", name: "YouTube", placeholder: "e.g. https://youtube.com/@yourchannel" },
  { key: "tiktok", name: "TikTok", placeholder: "e.g. @yourhandle" },
  { key: "facebook", name: "Facebook", placeholder: "e.g. https://facebook.com/yourpage", supportedPostTypes: ["feed", "stories"] },
  { key: "instagram", name: "Instagram", placeholder: "e.g. @yourhandle", supportedPostTypes: ["reels", "stories"] },
  { key: "pinterest", name: "Pinterest", placeholder: "e.g. https://pinterest.com/yourprofile" },
  { key: "linkedin", name: "LinkedIn", placeholder: "e.g. https://linkedin.com/company/yourcompany" },
  { key: "snapchat", name: "Snapchat", placeholder: "e.g. @yourhandle", supportedPostTypes: ["stories"] },
];

const createEmptyPlatformData = (key: string): PlatformData => {
  const base: PlatformData = {
    hasAccount: null,
    handleOrUrl: "",
    addToWorkflow: false,
    wantsAccountCreation: null,
  };

  // Initialize postTypes for platforms that support them
  if (key === "instagram") {
    base.postTypes = { reels: true, stories: false };
  } else if (key === "facebook") {
    base.postTypes = { feed: true, stories: false };
  } else if (key === "snapchat") {
    base.postTypes = { stories: true };
  }

  return base;
};

const createInitialPlatformsState = (): PlatformsState => {
  const state: PlatformsState = {};
  PLATFORMS.forEach((p) => {
    state[p.key] = createEmptyPlatformData(p.key);
  });
  return state;
};

const Intake = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<{ id: string; name: string; email: string } | null>(null);

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

  // Validate token on mount
  useEffect(() => {
    const token = searchParams.get("token");
    validateToken(token);
  }, [searchParams]);

  const validateToken = async (token: string | null) => {
    if (!token) {
      setTokenError("No intake token provided. Please use the link from your approval email.");
      setIsValidating(false);
      return;
    }

    try {
      // Check if token exists and request is approved
      const { data, error } = await supabase
        .from("video_requests")
        .select("id, name, email, status, intake_completed")
        .eq("intake_token", token)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setTokenError("Invalid intake token. Please use the link from your approval email.");
        setIsValidating(false);
        return;
      }

      if (data.status !== "approved") {
        setTokenError("Your beta request hasn't been approved yet. Please wait for approval.");
        setIsValidating(false);
        return;
      }

      if (data.intake_completed) {
        setTokenError("You've already completed the intake form. Please sign up or sign in to continue.");
        setIsValidating(false);
        return;
      }

      // Token is valid
      setRequestData({ id: data.id, name: data.name, email: data.email });
      setFullName(data.name);
      setEmail(data.email);
      setIsValidToken(true);
    } catch (error: any) {
      console.error("Error validating token:", error);
      setTokenError("Something went wrong. Please try again later.");
    } finally {
      setIsValidating(false);
    }
  };

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

  // State for account creation after intake
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !requestData) {
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
      // Insert intake submission
      const { error: intakeError } = await supabase.from("intake_submissions").insert([formData]);

      if (intakeError) {
        throw intakeError;
      }

      // Mark intake as completed on the video_request
      const { error: updateError } = await supabase
        .from("video_requests")
        .update({ intake_completed: true })
        .eq("id", requestData.id);

      if (updateError) {
        console.error("Error updating intake status:", updateError);
      }

      // Show account creation step instead of redirecting
      setShowAccountCreation(true);
      toast({
        title: "Intake submitted!",
        description: "Now create your password to finish setting up your account.",
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

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingAccount(true);

    try {
      const token = searchParams.get("token");
      
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Link the video request to the user
        if (token) {
          await supabase
            .from("video_requests")
            .update({ user_id: authData.user.id })
            .eq("intake_token", token);
        }

        toast({
          title: "Account created!",
          description: "Redirecting to your dashboard...",
        });

        // Navigate to onboarding
        navigate("/onboarding");
      }
    } catch (error: any) {
      console.error("Error creating account:", error);
      let message = error.message;
      if (error.message.includes("User already registered")) {
        message = "This email is already registered. Please sign in instead.";
        navigate(`/auth?token=${searchParams.get("token")}`);
      }
      toast({
        title: "Account creation failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Validating your intake link...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="container max-w-md">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mx-auto">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold">Unable to Access Intake Form</h1>
              <p className="text-muted-foreground">{tokenError}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate("/")} variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
                {tokenError?.includes("already completed") && (
                  <Button onClick={() => navigate("/auth")} className="gap-2">
                    Sign In / Sign Up
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Account creation step after intake submission
  if (showAccountCreation) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="container max-w-md">
            <div className="text-center space-y-6 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mx-auto">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h1 className="text-3xl font-bold">Intake Complete!</h1>
              <p className="text-muted-foreground">
                Create a password to finish setting up your account.
              </p>
              
              <form onSubmit={handleCreateAccount} className="space-y-4 text-left mt-8">
                <div className="space-y-2">
                  <Label htmlFor="email-display">Email</Label>
                  <Input
                    id="email-display"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">This is the email from your intake form</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Create Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isCreatingAccount}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isCreatingAccount}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={isCreatingAccount}
                >
                  {isCreatingAccount ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account & Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Old success state - no longer used but keeping for reference
  if (isSubmitted) {
    const token = searchParams.get("token");
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="container max-w-2xl">
            <div className="text-center space-y-6 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mx-auto">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h1 className="text-3xl font-bold">Intake Complete!</h1>
              <p className="text-lg text-muted-foreground">
                Great! Now let's create your account so you can start using the autopost workflow.
              </p>
              <Button onClick={() => navigate(`/auth?token=${token}`)} size="lg" className="gap-2">
                Create Your Account
                <ArrowRight className="h-4 w-4" />
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
              Welcome {requestData?.name}! Answer a few questions so we can design the right autopost workflow for your brand.
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
                    disabled
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Email is locked to your approved application</p>
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
                    supportedPostTypes={platform.supportedPostTypes}
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
              <Button type="submit" size="lg" className="w-full sm:w-auto gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit & Continue to Signup
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Intake;
