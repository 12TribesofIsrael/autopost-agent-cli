import { useState } from "react";
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
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [videosPerWeek, setVideosPerWeek] = useState("");
  const [painPoint, setPainPoint] = useState("");
  
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [businessTypeError, setBusinessTypeError] = useState<string | null>(null);
  const [platformError, setPlatformError] = useState<string | null>(null);
  const [videosError, setVideosError] = useState<string | null>(null);

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
    setPlatformError(null);
    setVideosError(null);

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

    // Validate platforms
    if (selectedPlatforms.length === 0) {
      setPlatformError("Please select at least one platform");
      return;
    }

    // Validate videos per week
    if (!videosPerWeek) {
      setVideosError("Please select how many videos you post");
      return;
    }

    setIsSubmitting(true);

    const formData = {
      name: name.trim(),
      email: email.trim(),
      businessType: businessType.trim(),
      platforms: selectedPlatforms,
      videosPerWeek,
      painPoint: painPoint.trim() || "",
    };

    // Log to console for debugging
    console.log("Beta form submission:", formData);

    try {
      // Insert into the database
      const { error } = await supabase.from("video_requests").insert({
        name: formData.name,
        email: formData.email,
        video_link: "", // No video link for beta signup
        platforms: formData.platforms,
        notes: `Business Type: ${formData.businessType}\nVideos per week: ${formData.videosPerWeek}\nPain point: ${formData.painPoint || "Not provided"}`,
        frequency: formData.videosPerWeek,
        drive_upload_status: "beta_request",
      });

      if (error) throw error;

      console.log("Beta request saved to database successfully");

      // Send email notification (non-blocking)
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setName("");
    setEmail("");
    setBusinessType("");
    setSelectedPlatforms([]);
    setVideosPerWeek("");
    setPainPoint("");
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
              <h2 className="mb-2 text-2xl font-bold">Thanks for joining the beta! 🎉</h2>
              <p className="mb-6 text-muted-foreground">
                I'll review your info and email you with next steps. I'm a 13-year-old building this, so I may limit beta spots to a small group while I test.
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
              Tell me a bit about your content, and I'll invite you to try Autopost Agent. You upload one video, choose your platforms, and I help you get it posted everywhere.
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

              {/* Platform Selection */}
              <div className="space-y-3">
                <Label>Which platforms do you post on?</Label>
                <div className="flex flex-wrap gap-x-4 gap-y-3">
                  {platforms.map((platform) => (
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
