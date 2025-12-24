import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export type PostTypes = {
  reels?: boolean;
  feed?: boolean;
  stories?: boolean;
  shorts?: boolean;
  tiktoks?: boolean;
  spotlight?: boolean;
};

export interface PlatformData {
  hasAccount: boolean | null;
  handleOrUrl: string;
  addToWorkflow: boolean;
  wantsAccountCreation: boolean | null;
  postTypes?: PostTypes;
}

const POST_TYPE_LABELS: Record<keyof PostTypes, string> = {
  reels: "Reels",
  feed: "Feed",
  stories: "Stories",
  shorts: "Shorts",
  tiktoks: "TikToks",
  spotlight: "Spotlight",
};

interface PlatformIntakeProps {
  platformName: string;
  platformKey: string;
  placeholder: string;
  data: PlatformData;
  onChange: (key: string, data: PlatformData) => void;
  supportedPostTypes?: Array<keyof PostTypes>;
}

const PlatformIntake = ({
  platformName,
  platformKey,
  placeholder,
  data,
  onChange,
  supportedPostTypes,
}: PlatformIntakeProps) => {
  const handleHasAccountChange = (value: string) => {
    const hasAccount = value === "yes";
    onChange(platformKey, {
      ...data,
      hasAccount,
      // Reset related fields when toggling
      handleOrUrl: hasAccount ? data.handleOrUrl : "",
      addToWorkflow: hasAccount ? data.addToWorkflow : false,
      wantsAccountCreation: hasAccount ? null : data.wantsAccountCreation,
    });
  };

  const handleUrlChange = (value: string) => {
    onChange(platformKey, { ...data, handleOrUrl: value });
  };

  const handleWorkflowChange = (checked: boolean) => {
    onChange(platformKey, { ...data, addToWorkflow: checked });
  };

  const handleCreationChange = (value: string) => {
    onChange(platformKey, { ...data, wantsAccountCreation: value === "yes" });
  };

  const handlePostTypeChange = (postType: keyof PostTypes, checked: boolean) => {
    const newPostTypes = {
      ...data.postTypes,
      [postType]: checked,
    };
    onChange(platformKey, { ...data, postTypes: newPostTypes });
  };

  const showPostTypes = 
    supportedPostTypes && 
    supportedPostTypes.length > 0 && 
    data.hasAccount === true && 
    data.addToWorkflow === true;

  return (
    <div className="border border-border rounded-xl p-5 bg-card/50">
      <h4 className="font-semibold text-foreground mb-4">{platformName}</h4>

      {/* Question 1: Do you have an account? */}
      <div className="space-y-3">
        <Label className="text-sm text-foreground">
          Do you already have a {platformName} account for this business?
        </Label>
        <RadioGroup
          value={data.hasAccount === true ? "yes" : data.hasAccount === false ? "no" : ""}
          onValueChange={handleHasAccountChange}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id={`${platformKey}-has-yes`} />
            <Label htmlFor={`${platformKey}-has-yes`} className="font-normal cursor-pointer">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id={`${platformKey}-has-no`} />
            <Label htmlFor={`${platformKey}-has-no`} className="font-normal cursor-pointer">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* If YES: Show handle input and workflow checkbox */}
      {data.hasAccount === true && (
        <div className="mt-4 space-y-4 pl-4 border-l-2 border-primary/30">
          <div className="space-y-2">
            <Label htmlFor={`${platformKey}-url`} className="text-sm">
              {platformName} handle or URL
            </Label>
            <Input
              id={`${platformKey}-url`}
              placeholder={placeholder}
              value={data.handleOrUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${platformKey}-workflow`}
              checked={data.addToWorkflow}
              onCheckedChange={handleWorkflowChange}
            />
            <Label htmlFor={`${platformKey}-workflow`} className="font-normal cursor-pointer text-sm">
              Add this {platformName} account to my autopost workflow
            </Label>
          </div>

          {/* Post Type Selection */}
          {showPostTypes && (
            <div className="mt-4 space-y-3 p-3 bg-muted/30 rounded-lg">
              <Label className="text-sm text-foreground font-medium">
                Where should this content go on {platformName}?
              </Label>
              <div className="flex flex-wrap gap-4">
                {supportedPostTypes.map((postType) => (
                  <div key={postType} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${platformKey}-posttype-${postType}`}
                      checked={data.postTypes?.[postType] ?? false}
                      onCheckedChange={(checked) => handlePostTypeChange(postType, checked as boolean)}
                    />
                    <Label 
                      htmlFor={`${platformKey}-posttype-${postType}`} 
                      className="font-normal cursor-pointer text-sm"
                    >
                      {POST_TYPE_LABELS[postType]}
                    </Label>
                  </div>
                ))}
              </div>
              {platformKey === "instagram" && (
                <p className="text-xs text-muted-foreground mt-2">
                  We use this to decide whether to configure your workflows for Reels, Stories, or both inside our automation tools.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* If NO: Ask if they want us to create it */}
      {data.hasAccount === false && (
        <div className="mt-4 space-y-3 pl-4 border-l-2 border-muted">
          <Label className="text-sm text-foreground">
            Would you like us to create this {platformName} account for you as an extra setup service?
          </Label>
          <RadioGroup
            value={data.wantsAccountCreation === true ? "yes" : data.wantsAccountCreation === false ? "no" : ""}
            onValueChange={handleCreationChange}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${platformKey}-create-yes`} />
              <Label htmlFor={`${platformKey}-create-yes`} className="font-normal cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${platformKey}-create-no`} />
              <Label htmlFor={`${platformKey}-create-no`} className="font-normal cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );
};

export default PlatformIntake;
