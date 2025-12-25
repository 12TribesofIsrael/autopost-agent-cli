import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [intakeToken, setIntakeToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // User came from intake form with token
      validateIntakeToken(token);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Check if user has completed onboarding
        setTimeout(async () => {
          // If we have an intake token, link the account
          if (intakeToken) {
            await linkIntakeToUser(session.user.id, intakeToken);
          }
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profile?.onboarding_completed) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding');
          }
        }, 0);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            if (profile?.onboarding_completed) {
              navigate('/dashboard');
            } else {
              navigate('/onboarding');
            }
          });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, intakeToken]);

  const validateIntakeToken = async (token: string) => {
    setValidatingToken(true);
    try {
      const { data, error } = await supabase
        .from('video_requests')
        .select('id, email, intake_completed, status')
        .eq('intake_token', token)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setTokenError('Invalid token. Please complete your intake form first.');
        return;
      }

      if (data.status !== 'approved') {
        setTokenError('Your beta request has not been approved yet.');
        return;
      }

      if (!data.intake_completed) {
        // Redirect back to intake form
        navigate(`/intake?token=${token}`);
        return;
      }

      // Token is valid and intake is completed
      setIntakeToken(token);
      setEmail(data.email);
      setIsLogin(false); // Default to signup for new users
    } catch (error) {
      console.error('Error validating token:', error);
      setTokenError('Something went wrong. Please try again.');
    } finally {
      setValidatingToken(false);
    }
  };

  const linkIntakeToUser = async (userId: string, token: string) => {
    try {
      // Update video_request with user_id
      const { error } = await supabase
        .from('video_requests')
        .update({ user_id: userId })
        .eq('intake_token', token);

      if (error) {
        console.error('Error linking intake to user:', error);
      }
    } catch (error) {
      console.error('Error linking intake to user:', error);
    }
  };

  const validateForm = () => {
    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'email') fieldErrors.email = err.message;
          if (err.path[0] === 'password') fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (error) throw error;
        toast({
          title: 'Account created!',
          description: 'Welcome to Autopost Agent.',
        });
      }
    } catch (error: any) {
      let message = error.message;
      if (error.message.includes('User already registered')) {
        message = 'This email is already registered. Try signing in instead.';
        setIsLogin(true);
      } else if (error.message.includes('Invalid login credentials')) {
        message = 'Invalid email or password. Please try again.';
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating token
  if (validatingToken) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Validating your access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Token error state
  if (tokenError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mx-auto">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">Access Issue</h1>
            <p className="text-muted-foreground">{tokenError}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">
              Autopost<span className="text-primary">Agent</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              {intakeToken 
                ? 'Create your account to get started' 
                : isLogin 
                  ? 'Sign in to your account' 
                  : 'Create your account'}
            </p>
            {intakeToken && (
              <p className="text-sm text-primary mt-1">
                ✓ Intake form completed
              </p>
            )}
          </div>

        {/* Auth Card */}
        <div className="p-8 rounded-2xl border border-border/50 bg-card shadow-soft">
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading || !!intakeToken}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
              {intakeToken && (
                <p className="text-xs text-muted-foreground">Email is locked to your intake submission</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary glow-primary gap-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <span className="text-primary font-medium">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <span className="text-primary font-medium">Sign in</span>
                </>
              )}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
