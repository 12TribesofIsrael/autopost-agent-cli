import React, { createContext, useContext, useState, ReactNode } from 'react';

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

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(defaultData);
  const totalSteps = 5; // Welcome (0) + 4 main steps

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  return (
    <OnboardingContext.Provider value={{ currentStep, setCurrentStep, data, updateData, totalSteps }}>
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
