import { useState } from "react";
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
import { Check, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const platforms = [
  { id: "tiktok", label: "TikTok" },
  { id: "youtube_shorts", label: "YouTube Shorts" },
  { id: "instagram_reels", label: "Instagram Reels" },
  { id: "facebook_reels", label: "Facebook Reels" },
];

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  videoLink: z.string().trim().url("Please enter a valid URL starting with http:// or https://"),
  platforms: z.array(z.string()).min(1, "Please select at least one platform"),
  frequency: z.string(),
  notes: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof formSchema>;

const IntakeForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
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

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to submit a video request.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("video_requests").insert({
        user_id: user.id,
        name: result.data.name,
        email: result.data.email,
        video_link: result.data.videoLink,
        platforms: result.data.platforms,
        frequency: result.data.frequency,
        notes: result.data.notes || null,
      });

      if (error) throw error;

      toast({
        title: "Request submitted!",
        description: "Your video request has been saved and will be processed.",
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
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Something went wrong. Please try again.",
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
