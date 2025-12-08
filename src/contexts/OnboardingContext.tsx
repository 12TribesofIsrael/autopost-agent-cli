import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface OnboardingData {
  // Welcome
  businessType: string;
  brandName: string;
  websiteOrSocial: string;
  
  // Brand Basics
  industry: string;
  brandVoice: string;
  postingGoals: string[];
  
  // Connected Accounts
  connectedAccounts: {
    instagram: { connected: boolean; handle: string };
    tiktok: { connected: boolean; handle: string };
    facebook: { connected: boolean; handle: string };
    youtube: { connected: boolean; handle: string };
    twitter: { connected: boolean; handle: string };
  };
  
  // Workflows
  mainSourcePlatform: string;
  destinations: string[];
  frequency: string;
  
  // Auto-Publish
  autoPublishEnabled: boolean;
  testOption: 'watch' | 'provided';
}

interface OnboardingContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  totalSteps: number;
  saving: boolean;
  saveProgress: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  loading: boolean;
}

const defaultData: OnboardingData = {
  businessType: '',
  brandName: '',
  websiteOrSocial: '',
  industry: '',
  brandVoice: '',
  postingGoals: [],
  connectedAccounts: {
    instagram: { connected: false, handle: '' },
    tiktok: { connected: false, handle: '' },
    facebook: { connected: false, handle: '' },
    youtube: { connected: false, handle: '' },
    twitter: { connected: false, handle: '' },
  },
  mainSourcePlatform: '',
  destinations: [],
  frequency: '',
  autoPublishEnabled: false,
  testOption: 'watch',
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Map frontend types to database enums
const userTypeMap: Record<string, string> = {
  'boxer_fighter': 'boxer_fighter',
  'gym_studio': 'gym_studio',
  'restaurant_food': 'restaurant_food',
  'other_local_business': 'other_local_business',
};

const industryMap: Record<string, string> = {
  'boxing_combat_sports': 'boxing_combat_sports',
  'fitness_gym': 'fitness_gym',
  'food_restaurant': 'food_restaurant',
  'retail_storefront': 'retail_storefront',
  'beauty_salon': 'beauty_salon',
  'other_local_business': 'other_local_business',
};

const frequencyMap: Record<string, string> = {
  'few_times_week': 'few_times_week',
  'daily': 'daily',
  'multiple_per_day': 'multiple_per_day',
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const totalSteps = 5;
  const { user } = useAuth();
  const { toast } = useToast();

  // Load existing data on mount
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Load profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setCurrentStep(profile.onboarding_step || 0);
          setData(prev => ({
            ...prev,
            businessType: profile.user_type || '',
            brandName: profile.business_name || '',
            websiteOrSocial: profile.website_url || '',
            industry: profile.industry || '',
            brandVoice: profile.brand_voice || '',
            postingGoals: profile.posting_goals || [],
          }));
        }

        // Load social connections
        const { data: connections } = await supabase
          .from('social_connections')
          .select('*')
          .eq('user_id', user.id);

        if (connections) {
          const connectedAccounts = { ...defaultData.connectedAccounts };
          connections.forEach(conn => {
            const platform = conn.platform as keyof typeof connectedAccounts;
            if (connectedAccounts[platform]) {
              connectedAccounts[platform] = {
                connected: conn.connected || false,
                handle: conn.handle || '',
              };
            }
          });
          setData(prev => ({ ...prev, connectedAccounts }));
        }

        // Load workflows
        const { data: workflows } = await supabase
          .from('workflows')
          .select('*')
          .eq('user_id', user.id);

        if (workflows && workflows.length > 0) {
          const sources = [...new Set(workflows.map(w => w.source_platform))];
          const destinations = workflows.filter(w => w.enabled).map(w => w.destination_platform);
          setData(prev => ({
            ...prev,
            mainSourcePlatform: sources[0] || '',
            destinations,
          }));
        }

        // Load settings
        const { data: settings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (settings) {
          setData(prev => ({
            ...prev,
            autoPublishEnabled: settings.auto_publish || false,
            frequency: settings.posting_frequency || 'few_times_week',
          }));
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const saveProgress = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Save profile
      const profileUpdate: Record<string, any> = {
        onboarding_step: currentStep,
        business_name: data.brandName || null,
        website_url: data.websiteOrSocial || null,
        brand_voice: data.brandVoice || null,
        posting_goals: data.postingGoals.length > 0 ? data.postingGoals : null,
      };

      if (data.businessType && userTypeMap[data.businessType]) {
        profileUpdate.user_type = data.businessType;
      }
      if (data.industry && industryMap[data.industry]) {
        profileUpdate.industry = data.industry;
      }

      await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);

      // Save social connections
      const platforms = Object.entries(data.connectedAccounts);
      for (const [platform, info] of platforms) {
        await supabase
          .from('social_connections')
          .upsert({
            user_id: user.id,
            platform,
            connected: info.connected,
            handle: info.handle || null,
            connected_at: info.connected ? new Date().toISOString() : null,
          }, { onConflict: 'user_id,platform' });
      }

      // Save workflows
      if (data.mainSourcePlatform && data.destinations.length > 0) {
        // Delete existing workflows for this user
        await supabase
          .from('workflows')
          .delete()
          .eq('user_id', user.id);

        // Insert new workflows
        const workflowInserts = data.destinations.map(dest => ({
          user_id: user.id,
          source_platform: data.mainSourcePlatform,
          destination_platform: dest,
          enabled: true,
        }));
        
        await supabase.from('workflows').insert(workflowInserts);
      }

      // Save settings
      const settingsUpdate: Record<string, any> = {
        auto_publish: data.autoPublishEnabled,
      };
      
      if (data.frequency && frequencyMap[data.frequency]) {
        settingsUpdate.posting_frequency = data.frequency;
      }

      await supabase
        .from('user_settings')
        .update(settingsUpdate)
        .eq('user_id', user.id);

    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: 'Error saving',
        description: 'Could not save your progress. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await saveProgress();
      
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
        
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error',
        description: 'Could not complete setup. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingContext.Provider value={{ 
      currentStep, 
      setCurrentStep, 
      data, 
      updateData, 
      totalSteps,
      saving,
      saveProgress,
      completeOnboarding,
      loading,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
