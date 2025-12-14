import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Check, Loader2, Upload, X } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const ACCEPTED_VIDEO_TYPES = [".mp4", ".mov"];

const platforms = [
  { id: "tiktok", label: "TikTok" },
  { id: "youtube_shorts", label: "YouTube Shorts" },
  { id: "instagram_reels", label: "Instagram Reels" },
  { id: "facebook_reels", label: "Facebook Reels" },
];

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  videoLink: z.string().trim().url("Please enter a valid URL starting with http:// or https://").optional().or(z.literal("")),
  platforms: z.array(z.string()).min(1, "Please select at least one platform"),
  frequency: z.string(),
  notes: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof formSchema>;

const IntakeForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    videoLink: "",
    platforms: [],
    frequency: "one_time",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    
    if (!file) {
      setVideoFile(null);
      return;
    }

    // Check file extension
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ACCEPTED_VIDEO_TYPES.includes(extension)) {
      setFileError("Please upload a .mp4 or .mov file");
      setVideoFile(null);
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size must be less than 2GB");
      setVideoFile(null);
      return;
    }

    setVideoFile(file);
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
    setFormData((prev) => ({
      ...prev,
      platforms: checked
        ? [...prev.platforms, platformId]
        : prev.platforms.filter((p) => p !== platformId),
    }));
    setErrors((prev) => ({ ...prev, platforms: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setFileError(null);

    // Require either a file or a video link
    if (!videoFile && !formData.videoLink) {
      setFileError("Please upload a video file or provide a video link");
      return;
    }

    const result = formSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: If videoFile exists, upload to temporary storage first
      // For now, we'll store the file reference and pass metadata
      const response = await supabase.functions.invoke("submit-request", {
        body: {
          name: result.data.name,
          email: result.data.email,
          videoLink: result.data.videoLink || null,
          videoFileName: videoFile?.name || null,
          videoFileSize: videoFile?.size || null,
          platforms: result.data.platforms,
          frequency: result.data.frequency,
          notes: result.data.notes || null,
        },
      });

      if (response.error || !response.data?.success) {
        throw new Error(response.data?.error || response.error?.message || "Failed to submit request");
      }

      toast({
        title: "Request submitted!",
        description: "Thanks! Your request was saved. In the full version, this will trigger the autopost workflow.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        videoLink: "",
        platforms: [],
        frequency: "one_time",
        notes: "",
      });
      removeFile();
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
              Fill out this quick form and our AI agent can take over from here.
              This MVP just logs your data and shows a success message so you can
              test the flow.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Built to be API-ready
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Easy to plug into backend
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Clean JSON payload on submit
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
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  placeholder="Jordan Creator"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoFile">Upload video file</Label>
                <div className="flex flex-col gap-2">
                  {!videoFile ? (
                    <div 
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-muted/30 p-6 transition-colors hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-foreground">Click to upload video</p>
                      <p className="text-xs text-muted-foreground mt-1">MP4 or MOV, max 2GB</p>
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
                </div>
                {fileError && (
                  <p className="text-sm text-destructive">{fileError}</p>
                )}
              </div>

              <div className="relative flex items-center gap-4">
                <div className="flex-1 border-t border-border/60" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 border-t border-border/60" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoLink">Video link</Label>
                <Input
                  id="videoLink"
                  type="url"
                  placeholder="https://..."
                  value={formData.videoLink}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, videoLink: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Google Drive, Dropbox, YouTube, Loom, etc.
                </p>
                {errors.videoLink && (
                  <p className="text-sm text-destructive">{errors.videoLink}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Platforms to post on</Label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="flex items-center gap-2">
                      <Checkbox
                        id={platform.id}
                        checked={formData.platforms.includes(platform.id)}
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
                <p className="text-xs text-muted-foreground">
                  Backend can map these to actual posting APIs.
                </p>
                {errors.platforms && (
                  <p className="text-sm text-destructive">{errors.platforms}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">How often should we post?</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, frequency: value }))
                  }
                >
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One-time blast</SelectItem>
                    <SelectItem value="daily">Daily clips for a week</SelectItem>
                    <SelectItem value="three_per_week">3x per week</SelectItem>
                    <SelectItem value="custom">Custom plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Any notes or style preferences?</Label>
                <Textarea
                  id="notes"
                  placeholder="Example: Focus on hooks, add subtitles, post evenings in EST..."
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>

              <Button type="submit" size="full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit video request"
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
