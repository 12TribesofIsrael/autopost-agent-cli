import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, LogOut, Home, Shield, Key, Copy, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PlatformCredential {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  password: string;
  two_factor_backup: string | null;
  notes: string | null;
  submitted_at: string;
  user_email?: string;
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

const AdminCredentials = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [credentials, setCredentials] = useState<PlatformCredential[]>([]);
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

      // Check if user is admin
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
      await fetchCredentials();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCredentials = async () => {
    // Fetch all credentials (admin policy allows this)
    const { data, error } = await supabase
      .from("platform_credentials")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error fetching credentials:", error);
      toast({
        title: "Error",
        description: "Failed to load credentials.",
        variant: "destructive",
      });
      return;
    }

    // Get user emails from profiles
    const userIds = [...new Set(data.map(c => c.user_id))];
    
    // We can't directly query profiles for other users, so we'll just show user_id
    // In a real app, you might have a separate admin-only view or edge function for this
    setCredentials(data);
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

  // Group credentials by user
  const credentialsByUser = credentials.reduce((acc, cred) => {
    if (!acc[cred.user_id]) {
      acc[cred.user_id] = [];
    }
    acc[cred.user_id].push(cred);
    return acc;
  }, {} as Record<string, PlatformCredential[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold text-xl text-primary">Admin Panel</span>
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
            <Key className="w-8 h-8 text-primary" />
            Platform Credentials
          </h1>
          <p className="text-muted-foreground">
            View all submitted platform credentials to set up user accounts.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Credentials</CardDescription>
              <CardTitle className="text-2xl">{credentials.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Unique Users</CardDescription>
              <CardTitle className="text-2xl">{Object.keys(credentialsByUser).length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Platforms</CardDescription>
              <CardTitle className="text-2xl">
                {new Set(credentials.map(c => c.platform)).size}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Credentials Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Credentials</CardTitle>
            <CardDescription>
              Click to reveal passwords. Use copy buttons to quickly grab credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {credentials.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No credentials submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead>2FA Codes</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {credentials.map((cred) => (
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
                                <Check className="h-3 w-3 text-success" />
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
                                <Check className="h-3 w-3 text-success" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {cred.two_factor_backup ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                {cred.two_factor_backup.substring(0, 20)}...
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(cred.two_factor_backup!, `2fa-${cred.id}`)}
                              >
                                {copiedField === `2fa-${cred.id}` ? (
                                  <Check className="h-3 w-3 text-success" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground truncate max-w-[150px] block">
                            {cred.notes || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(cred.submitted_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCredentials;
