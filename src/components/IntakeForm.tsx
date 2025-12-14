import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Upload, X } from "lucide-react";

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
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [platformError, setPlatformError] = useState<string | null>(null);
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
    setSelectedPlatforms((prev) =>
      checked ? [...prev, platformId] : prev.filter((p) => p !== platformId)
    );
    setPlatformError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFileError(null);
    setPlatformError(null);

    // Validate video file
    if (!videoFile) {
      setFileError("Please upload a video file");
      return;
    }

    // Validate platforms
    if (selectedPlatforms.length === 0) {
      setPlatformError("Please select at least one platform");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build multipart/form-data
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("platforms", JSON.stringify(selectedPlatforms));
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }

      // Send to edge function using fetch for multipart support
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/submit-request`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseAnonKey}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit request");
      }

      toast({
        title: "Video submitted!",
        description: "Your video is being processed and will be posted to the selected platforms.",
      });

      // Reset form
      setSelectedPlatforms([]);
      setCaption("");
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
              Upload your video, select your platforms, and we'll handle the rest.
              Your content will be automatically posted across all selected channels.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Upload once, post everywhere
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Automatic platform optimization
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Track your posts in the dashboard
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
              {/* Video Upload */}
              <div className="space-y-2">
                <Label htmlFor="videoFile">Upload video</Label>
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

              {/* Caption */}
              <div className="space-y-2">
                <Label htmlFor="caption">Caption (optional)</Label>
                <Textarea
                  id="caption"
                  placeholder="Add a caption for your post..."
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={2200}
                />
                <p className="text-xs text-muted-foreground">
                  {caption.length}/2200 characters
                </p>
              </div>

              <Button type="submit" size="full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
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
