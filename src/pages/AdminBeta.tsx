import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Mail, Clock, User, Building, LogOut, Home } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BetaRequest {
  id: string;
  name: string;
  email: string;
  notes: string | null;
  platforms: string[];
  frequency: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  intake_token: string;
  intake_completed: boolean;
}

const AdminBeta = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState<BetaRequest[]>([]);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

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
      await fetchRequests();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("video_requests")
      .select("*")
      .eq("drive_upload_status", "beta_request")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "Failed to load beta requests.",
        variant: "destructive",
      });
      return;
    }

    setRequests(data as BetaRequest[]);
  };

  const handleApprove = async (request: BetaRequest) => {
    setSendingEmail(request.id);
    
    try {
      // Update status to approved
      const { error: updateError } = await supabase
        .from("video_requests")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      if (updateError) throw updateError;

      // Send intake email
      const { error: emailError } = await supabase.functions.invoke("send-intake-link", {
        body: {
          email: request.email,
          name: request.name,
          intakeToken: request.intake_token,
        },
      });

      if (emailError) throw emailError;

      toast({
        title: "Approved!",
        description: `Intake link sent to ${request.email}`,
      });

      await fetchRequests();
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve and send email.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("video_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Rejected",
        description: "Beta request has been rejected.",
      });

      await fetchRequests();
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: "Failed to reject request.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
    }
  };

  const parseNotes = (notes: string | null) => {
    if (!notes) return {};
    const parsed: Record<string, string> = {};
    notes.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length) {
        parsed[key.trim()] = valueParts.join(":").trim();
      }
    });
    return parsed;
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

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Universal Navigation */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <span className="font-bold text-xl text-primary">GrowYourBrand</span>
          <div className="flex items-center gap-2">
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
          <h1 className="text-3xl font-bold mb-2">Beta Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve beta access requests. Approved users will receive an email with their intake link.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                {pendingCount}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                {approvedCount}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Requests</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {requests.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Beta Requests</CardTitle>
            <CardDescription>
              Click approve to send an intake link via email
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No beta requests yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Service Tier</TableHead>
                      <TableHead>Platforms</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => {
                      const parsed = parseNotes(request.notes);
                      return (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.name}</TableCell>
                          <TableCell>{request.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3 text-muted-foreground" />
                              {parsed["Business Type"] || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>{parsed["Service Tier"] || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {request.platforms.slice(0, 2).map((p) => (
                                <Badge key={p} variant="secondary" className="text-xs">
                                  {p}
                                </Badge>
                              ))}
                              {request.platforms.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{request.platforms.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(request.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {request.status === "pending" && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(request)}
                                  disabled={sendingEmail === request.id}
                                >
                                  {sendingEmail === request.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Mail className="h-4 w-4 mr-1" />
                                      Approve & Send
                                    </>
                                  )}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Reject Request?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will reject {request.name}'s beta request. They won't be notified.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleReject(request.id)}>
                                        Reject
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                            {request.status === "approved" && (
                              <span className="text-sm text-muted-foreground">
                                Sent {request.approved_at ? new Date(request.approved_at).toLocaleDateString() : ""}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

export default AdminBeta;
