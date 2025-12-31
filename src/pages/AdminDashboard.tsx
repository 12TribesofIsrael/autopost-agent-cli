import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, LogOut, Home, Shield, Key, Copy, Check, Workflow, Users, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PlatformCredential {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  password: string;
  two_factor_backup: string | null;
  notes: string | null;
  submitted_at: string;
}

interface WorkflowConfig {
  id: string;
  user_id: string;
  source_platform: string;
  destination_platform: string;
  enabled: boolean;
  created_at: string;
}

interface UserData {
  user_id: string;
  credentials: PlatformCredential[];
  workflows: WorkflowConfig[];
}

const platformDisplayNames: Record<string, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  snapchat: 'Snapchat',
  pinterest: 'Pinterest',
  linkedin: 'LinkedIn',
  twitch: 'Twitch',
  podcast: 'Podcast (RSS)',
  googledrive: 'Google Drive',
  dropbox: 'Dropbox',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError || !roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this page.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await fetchAllData();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllData = async () => {
    // Fetch credentials and workflows in parallel
    const [credentialsResult, workflowsResult] = await Promise.all([
      supabase.from("platform_credentials").select("*").order("submitted_at", { ascending: false }),
      supabase.from("workflows").select("*").order("created_at", { ascending: false })
    ]);

    if (credentialsResult.error) {
      console.error("Error fetching credentials:", credentialsResult.error);
    }
    if (workflowsResult.error) {
      console.error("Error fetching workflows:", workflowsResult.error);
    }

    const credentials = credentialsResult.data || [];
    const workflows = workflowsResult.data || [];

    // Group by user_id
    const userMap = new Map<string, UserData>();

    credentials.forEach(cred => {
      if (!userMap.has(cred.user_id)) {
        userMap.set(cred.user_id, { user_id: cred.user_id, credentials: [], workflows: [] });
      }
      userMap.get(cred.user_id)!.credentials.push(cred);
    });

    workflows.forEach(wf => {
      if (!userMap.has(wf.user_id)) {
        userMap.set(wf.user_id, { user_id: wf.user_id, credentials: [], workflows: [] });
      }
      userMap.get(wf.user_id)!.workflows.push(wf);
    });

    setUserData(Array.from(userMap.values()));
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const getPlatformBadgeColor = (platform: string) => {
    const colors: Record<string, string> = {
      tiktok: 'bg-black text-white',
      instagram: 'bg-pink-500 text-white',
      youtube: 'bg-red-600 text-white',
      facebook: 'bg-blue-600 text-white',
      twitter: 'bg-black text-white',
      snapchat: 'bg-yellow-400 text-black',
      pinterest: 'bg-red-700 text-white',
      linkedin: 'bg-blue-700 text-white',
      twitch: 'bg-purple-600 text-white',
      podcast: 'bg-violet-500 text-white',
      googledrive: 'bg-blue-500 text-white',
      dropbox: 'bg-blue-600 text-white',
    };
    return colors[platform] || 'bg-muted text-muted-foreground';
  };

  const totalCredentials = userData.reduce((sum, u) => sum + u.credentials.length, 0);
  const totalWorkflows = userData.reduce((sum, u) => sum + u.workflows.length, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold text-xl text-primary">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/admin/beta')} 
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              Beta Requests
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')} 
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut} 
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            User Setup Dashboard
          </h1>
          <p className="text-muted-foreground">
            View all user credentials and workflow configurations in one place.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-2xl">{userData.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Credentials</CardDescription>
              <CardTitle className="text-2xl">{totalCredentials}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Workflows</CardDescription>
              <CardTitle className="text-2xl">{totalWorkflows}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Users with Workflows</CardDescription>
              <CardTitle className="text-2xl">
                {userData.filter(u => u.workflows.length > 0).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Users Accordion */}
        {userData.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No user data submitted yet.
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {userData.map((user, index) => (
              <AccordionItem 
                key={user.user_id} 
                value={user.user_id}
                className="border rounded-lg bg-card px-4"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-muted-foreground mb-1">
                        User ID: {user.user_id.slice(0, 8)}...
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Key className="w-3 h-3" />
                          {user.credentials.length} credentials
                        </span>
                        <span className="flex items-center gap-1">
                          <Workflow className="w-3 h-3" />
                          {user.workflows.length} workflows
                        </span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-6">
                    {/* Credentials Section */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Key className="w-4 h-4 text-primary" />
                        Platform Credentials
                      </h4>
                      {user.credentials.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No credentials submitted.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Platform</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Password</TableHead>
                                <TableHead>2FA</TableHead>
                                <TableHead>Notes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {user.credentials.map((cred) => (
                                <TableRow key={cred.id}>
                                  <TableCell>
                                    <Badge className={getPlatformBadgeColor(cred.platform)}>
                                      {platformDisplayNames[cred.platform] || cred.platform}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-sm">{cred.username}</span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => copyToClipboard(cred.username, `user-${cred.id}`)}
                                      >
                                        {copiedField === `user-${cred.id}` ? (
                                          <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-sm">
                                        {visiblePasswords.has(cred.id) ? cred.password : '••••••••'}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => togglePasswordVisibility(cred.id)}
                                      >
                                        {visiblePasswords.has(cred.id) ? (
                                          <EyeOff className="h-3 w-3" />
                                        ) : (
                                          <Eye className="h-3 w-3" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => copyToClipboard(cred.password, `pass-${cred.id}`)}
                                      >
                                        {copiedField === `pass-${cred.id}` ? (
                                          <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {cred.two_factor_backup ? (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs"
                                        onClick={() => copyToClipboard(cred.two_factor_backup!, `2fa-${cred.id}`)}
                                      >
                                        {copiedField === `2fa-${cred.id}` ? (
                                          <Check className="h-3 w-3 text-green-500 mr-1" />
                                        ) : (
                                          <Copy className="h-3 w-3 mr-1" />
                                        )}
                                        Copy 2FA
                                      </Button>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">None</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-xs text-muted-foreground">
                                      {cred.notes || '-'}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>

                    {/* Workflows Section */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Workflow className="w-4 h-4 text-primary" />
                        Workflow Configuration
                      </h4>
                      {user.workflows.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No workflows configured (may have skipped setup).</p>
                      ) : (
                        <div className="grid gap-2">
                          {user.workflows.map((wf) => (
                            <div 
                              key={wf.id} 
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                            >
                              <Badge className={getPlatformBadgeColor(wf.source_platform)}>
                                {platformDisplayNames[wf.source_platform] || wf.source_platform}
                              </Badge>
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                              <Badge className={getPlatformBadgeColor(wf.destination_platform)}>
                                {platformDisplayNames[wf.destination_platform] || wf.destination_platform}
                              </Badge>
                              <Badge variant={wf.enabled ? "default" : "secondary"} className="ml-auto">
                                {wf.enabled ? 'Active' : 'Disabled'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;