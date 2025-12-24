import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Turnstile site key - this is a public key, safe to include in code
// Get yours at: https://dash.cloudflare.com/?to=/:account/turnstile
const TURNSTILE_SITE_KEY = "0x4AAAAAABdFX2mB1rEK0Xnz"; // Replace with your actual site key

const platforms = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram_reels", label: "Instagram Reels" },
  { id: "youtube_shorts", label: "YouTube Shorts" },
  { id: "facebook_reels", label: "Facebook Reels" },
  { id: "other", label: "Other" },
];

const IntakeForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [sourcePlatform, setSourcePlatform] = useState("");
  const [serviceTier, setServiceTier] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [videosPerWeek, setVideosPerWeek] = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [businessTypeError, setBusinessTypeError] = useState<string | null>(null);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [tierError, setTierError] = useState<string | null>(null);
  const [platformError, setPlatformError] = useState<string | null>(null);
  const [videosError, setVideosError] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Load Turnstile script and render widget
  useEffect(() => {
    const loadTurnstile = () => {
      // Check if script already exists
      if (document.getElementById('turnstile-script')) {
        renderWidget();
        return;
      }

      const script = document.createElement('script');
      script.id = 'turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = () => renderWidget();
      document.head.appendChild(script);
    };

    const renderWidget = () => {
      if (!turnstileRef.current || widgetIdRef.current) return;
      
      const win = window as any;
      if (!win.turnstile) {
        setTimeout(renderWidget, 100);
        return;
      }

      widgetIdRef.current = win.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'auto',
        callback: (token: string) => {
          setTurnstileToken(token);
          setCaptchaError(null);
        },
        'error-callback': () => {
          setTurnstileToken(null);
          setCaptchaError("Security check failed. Please try again.");
        },
        'expired-callback': () => {
          setTurnstileToken(null);
        },
      });
    };

    loadTurnstile();

    return () => {
      const win = window as any;
      if (widgetIdRef.current && win.turnstile) {
        win.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  const resetTurnstile = useCallback(() => {
    const win = window as any;
    if (widgetIdRef.current && win.turnstile) {
      win.turnstile.reset(widgetIdRef.current);
    }
  }, []);

  const handlePlatformChange = (platformId: string, checked: boolean) => {
    setSelectedPlatforms((prev) =>
      checked ? [...prev, platformId] : prev.filter((p) => p !== platformId)
    );
    setPlatformError(null);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    setEmailError(null);
    setBusinessTypeError(null);
    setSourceError(null);
    setTierError(null);
    setPlatformError(null);
    setVideosError(null);
    setCaptchaError(null);

    // Validate name
    if (!name.trim()) {
      setNameError("Please enter your name");
      return;
    }

    // Validate email
    if (!email.trim()) {
      setEmailError("Please enter your email");
      return;
    }
    if (!validateEmail(email.trim())) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Validate business type
    if (!businessType.trim()) {
      setBusinessTypeError("Please enter your business type");
      return;
    }

    // Validate source platform (only required for self-service)
    if (serviceTier === "self-service" && !sourcePlatform) {
      setSourceError("Please select your primary posting platform");
      return;
    }

    // Validate service tier
    if (!serviceTier) {
      setTierError("Please select a service tier");
      return;
    }

    // Validate destination platforms
    if (selectedPlatforms.length === 0) {
      setPlatformError("Please select at least one destination platform");
      return;
    }

    // Validate videos per week
    if (!videosPerWeek) {
      setVideosError("Please select how many videos you post");
      return;
    }

    // CAPTCHA validation disabled

    setIsSubmitting(true);

    const formData = {
      name: name.trim(),
      email: email.trim(),
      businessType: businessType.trim(),
      serviceTier,
      sourcePlatform: serviceTier === "self-service" ? sourcePlatform : "",
      platforms: selectedPlatforms,
      videosPerWeek,
      painPoint: painPoint.trim() || "",
      turnstileToken,
    };

    console.log("Beta form submission:", formData);

    try {
      // Insert into the database
      const { error } = await supabase.from("video_requests").insert({
        name: formData.name,
        email: formData.email,
        video_link: "",
        platforms: formData.platforms,
        notes: `Service Tier: ${formData.serviceTier}\nBusiness Type: ${formData.businessType}\nSource Platform: ${formData.sourcePlatform || "N/A"}\nVideos per week: ${formData.videosPerWeek}\nPain point: ${formData.painPoint || "Not provided"}`,
        frequency: formData.videosPerWeek,
        drive_upload_status: "beta_request",
      });

      if (error) throw error;

      console.log("Beta request saved to database successfully");

      // Send email notification with CAPTCHA token for verification
      supabase.functions.invoke("send-beta-notification", {
        body: formData,
      }).then((res) => {
        console.log("Email notification response:", res);
      }).catch((err) => {
        console.error("Email notification error:", err);
      });

      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit. Please try again.",
        variant: "destructive",
      });
      // Reset Turnstile on error
      resetTurnstile();
      setTurnstileToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setName("");
    setEmail("");
    setBusinessType("");
    setServiceTier("");
    setSourcePlatform("");
    setSelectedPlatforms([]);
    setVideosPerWeek("");
    setPainPoint("");
    setTurnstileToken(null);
    resetTurnstile();
  };

  // Success state
  if (isSubmitted) {
    return (
      <section id="beta-form" className="py-14 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-lg animate-fade-in-up">
            <div className="gradient-card rounded-2xl border border-border/80 p-8 shadow-soft text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mb-2 text-2xl font-bold">Thanks for joining the beta!</h2>
              <p className="mb-6 text-muted-foreground">
                We'll review your info and email you with next steps. Beta spots are limited while we refine the experience.
              </p>
              <Button onClick={resetForm} variant="outline">
                Submit another request
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="beta-form" className="py-14 md:py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in-up">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              Join the Free Beta
            </h2>
            <p className="text-lg text-muted-foreground">
              Tell us where you post and where you want to expand. You keep posting to your favorite platform—we'll handle distributing it everywhere else.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="animate-slide-in-right gradient-card rounded-2xl border border-border/80 p-6 md:p-8 shadow-soft"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Coach Mike"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError(null);
                  }}
                  maxLength={100}
                />
                {nameError && (
                  <p className="text-sm text-destructive">{nameError}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. coach@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  maxLength={255}
                />
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>

              {/* Business Type */}
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Input
                  id="businessType"
                  type="text"
                  placeholder="e.g. Boxing gym, fitness coach, daycare owner"
                  value={businessType}
                  onChange={(e) => {
                    setBusinessType(e.target.value);
                    setBusinessTypeError(null);
                  }}
                  maxLength={150}
                />
                {businessTypeError && (
                  <p className="text-sm text-destructive">{businessTypeError}</p>
                )}
              </div>

              {/* Service Tier Selection */}
              <div className="space-y-3">
                <Label>Which service level are you interested in?</Label>
                <div className="grid gap-3">
                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${serviceTier === "self-service" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <input
                      type="radio"
                      name="serviceTier"
                      value="self-service"
                      checked={serviceTier === "self-service"}
                      onChange={(e) => {
                        setServiceTier(e.target.value);
                        setTierError(null);
                      }}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">Self-Service</div>
                      <div className="text-sm text-muted-foreground">I'll post to my source platform, you repurpose everywhere else</div>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${serviceTier === "done-for-you" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <input
                      type="radio"
                      name="serviceTier"
                      value="done-for-you"
                      checked={serviceTier === "done-for-you"}
                      onChange={(e) => {
                        setServiceTier(e.target.value);
                        setTierError(null);
                      }}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">Done-For-You Upload</div>
                      <div className="text-sm text-muted-foreground">I'll send you my content, you handle all uploads & repurposing</div>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${serviceTier === "full-creation" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <input
                      type="radio"
                      name="serviceTier"
                      value="full-creation"
                      checked={serviceTier === "full-creation"}
                      onChange={(e) => {
                        setServiceTier(e.target.value);
                        setTierError(null);
                      }}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">Full Content Creation</div>
                      <div className="text-sm text-muted-foreground">Create original content for me AND repurpose across platforms</div>
                    </div>
                  </label>
                </div>
                {tierError && (
                  <p className="text-sm text-destructive">{tierError}</p>
                )}
              </div>

              {/* Source Platform Selection - only show for self-service */}
              {serviceTier === "self-service" && (
                <div className="space-y-2 animate-fade-in">
                  <Label>Where do you currently post your videos?</Label>
                  <p className="text-sm text-muted-foreground">This is your primary source—we'll pull content from here.</p>
                  <Select value={sourcePlatform} onValueChange={(value) => {
                    setSourcePlatform(value);
                    setSourceError(null);
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your main platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.filter(p => p.id !== "other").map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {sourceError && (
                    <p className="text-sm text-destructive">{sourceError}</p>
                  )}
                </div>
              )}

              {/* Destination Platform Selection */}
              <div className="space-y-3">
                <Label>Where do you want your content distributed?</Label>
                <p className="text-sm text-muted-foreground">Select all the platforms you want us to post to.</p>
                <div className="flex flex-wrap gap-x-4 gap-y-3">
                  {platforms.filter(p => p.id !== sourcePlatform).map((platform) => (
                    <div key={platform.id} className="flex items-center gap-2">
                      <Checkbox
                        id={platform.id}
                        checked={selectedPlatforms.includes(platform.id)}
                        onCheckedChange={(checked) =>
                          handlePlatformChange(platform.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={platform.id}
                        className="text-sm font-normal text-muted-foreground cursor-pointer"
                      >
                        {platform.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {platformError && (
                  <p className="text-sm text-destructive">{platformError}</p>
                )}
              </div>

              {/* Videos per week dropdown */}
              <div className="space-y-2">
                <Label>How many short videos do you post per week?</Label>
                <Select value={videosPerWeek} onValueChange={(value) => {
                  setVideosPerWeek(value);
                  setVideosError(null);
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1-2">1–2</SelectItem>
                    <SelectItem value="3-5">3–5</SelectItem>
                    <SelectItem value="6+">6+</SelectItem>
                  </SelectContent>
                </Select>
                {videosError && (
                  <p className="text-sm text-destructive">{videosError}</p>
                )}
              </div>

              {/* Pain point textarea */}
              <div className="space-y-2">
                <Label htmlFor="painPoint">What's the most annoying part about posting everywhere?</Label>
                <Textarea
                  id="painPoint"
                  placeholder="e.g. re-uploading to each app, writing captions 3 times, etc."
                  rows={3}
                  value={painPoint}
                  onChange={(e) => setPainPoint(e.target.value)}
                  maxLength={1000}
                />
              </div>

              {/* CAPTCHA disabled */}

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Request Beta Access"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default IntakeForm;
