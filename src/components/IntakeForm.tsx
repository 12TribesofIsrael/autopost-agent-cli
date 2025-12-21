import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Upload, X, Link, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const ACCEPTED_VIDEO_TYPES = [".mp4", ".mov"];

const platforms = [
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "x", label: "X (Twitter)" },
];

const IntakeForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoLink, setVideoLink] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [platformError, setPlatformError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    
    if (!file) {
      setVideoFile(null);
      return;
    }

    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ACCEPTED_VIDEO_TYPES.includes(extension)) {
      setFileError("Please upload a .mp4 or .mov file");
      setVideoFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size must be less than 2GB");
      setVideoFile(null);
      return;
    }

    setVideoFile(file);
    setVideoLink(""); // Clear link if file is uploaded
  };

  const removeFile = () => {
    setVideoFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

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
    setFileError(null);
    setPlatformError(null);
    setEmailError(null);
    setNameError(null);

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

    // Validate video (file OR link required)
    if (!videoFile && !videoLink.trim()) {
      setFileError("Please upload a video or paste a link");
      return;
    }

    // Validate platforms
    if (selectedPlatforms.length === 0) {
      setPlatformError("Please select at least one platform");
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert directly into the database
      const { error } = await supabase.from("video_requests").insert({
        name: name.trim(),
        email: email.trim(),
        video_link: videoFile ? `[File Upload: ${videoFile.name}]` : videoLink.trim(),
        file_name: videoFile?.name || null,
        platforms: selectedPlatforms,
        notes: notes.trim() || null,
        frequency: "once",
        drive_upload_status: "pending",
      });

      if (error) throw error;

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
    setSelectedPlatforms([]);
    setNotes("");
    setVideoFile(null);
    setVideoLink("");
    setName("");
    setEmail("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Success state
  if (isSubmitted) {
    return (
      <section id="get-started" className="py-14 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-lg animate-fade-in-up">
            <div className="gradient-card rounded-2xl border border-border/80 p-8 shadow-soft text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mb-2 text-2xl font-bold">Thanks! We're on it 🎬</h2>
              <p className="mb-6 text-muted-foreground">
                We received your video request and will have it posted to your selected platforms within 2 hours. You'll receive a confirmation email once it's live.
              </p>
              <Button onClick={resetForm} variant="outline">
                Submit another video
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="get-started" className="py-14 md:py-20">
      <div className="container">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          {/* Copy */}
          <div className="animate-fade-in-up">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              Get your content autoposted
            </h2>
            <p className="mb-6 text-muted-foreground">
              Upload your video or paste a link, select your platforms, and we'll handle the rest.
              Your content will be posted within 2 hours.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Upload once, post everywhere
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                We handle platform optimization
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Posted within 2 hours
              </li>
            </ul>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="animate-slide-in-right gradient-card rounded-2xl border border-border/80 p-6 shadow-soft"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Smith"
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
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
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

              {/* Video Upload OR Link */}
              <div className="space-y-2">
                <Label>Video (upload or paste link)</Label>
                
                {!videoFile ? (
                  <div className="space-y-3">
                    <div 
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-muted/30 p-6 transition-colors hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-foreground">Click to upload video</p>
                      <p className="text-xs text-muted-foreground mt-1">MP4 or MOV, max 2GB</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-border"></div>
                      <span className="text-xs text-muted-foreground">or paste a link</span>
                      <div className="h-px flex-1 bg-border"></div>
                    </div>
                    
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="https://drive.google.com/... or https://dropbox.com/..."
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <Upload className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{videoFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(videoFile.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  id="videoFile"
                  accept=".mp4,.mov"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {fileError && (
                  <p className="text-sm text-destructive">{fileError}</p>
                )}
              </div>

              {/* Platform Selection */}
              <div className="space-y-3">
                <Label>Platforms to post on</Label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
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
                        className="text-sm font-normal text-muted-foreground"
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

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or captions..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={2200}
                />
              </div>

              <Button type="submit" size="full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit video"
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