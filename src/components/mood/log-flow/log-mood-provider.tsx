import React, { createContext, useContext, useState, ReactNode } from "react";
import { EmotionId, SomaticSymptomId, MoodTriggerId, SelfCareId, getMoodLabel } from "@/types/mood";

interface MoodFormData {
  energy: number;
  positivity: number;
  dominantMood: string;
  emotions: EmotionId[];
  somaticSymptoms: SomaticSymptomId[];
  triggers: MoodTriggerId[];
  selfCare: SelfCareId[];
  loggedAt: Date;
}

interface LogMoodContextType {
  formData: MoodFormData;
  updateFormData: (updates: Partial<MoodFormData>) => void;
  currentStep: number;
  totalSteps: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

const LogMoodContext = createContext<LogMoodContextType | null>(null);

const TOTAL_STEPS = 4;

const initialFormData: MoodFormData = {
  energy: 0,
  positivity: 0,
  dominantMood: "Neutral",
  emotions: [],
  somaticSymptoms: [],
  triggers: [],
  selfCare: [],
  loggedAt: new Date(),
};

export function LogMoodProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<MoodFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (updates: Partial<MoodFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...updates };
      // Auto-update mood label when energy/positivity changes
      if ("energy" in updates || "positivity" in updates) {
        updated.dominantMood = getMoodLabel(updated.energy, updated.positivity);
      }
      return updated;
    });
  };

  const goToNextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <LogMoodContext.Provider
      value={{
        formData,
        updateFormData,
        currentStep,
        totalSteps: TOTAL_STEPS,
        goToNextStep,
        goToPreviousStep,
        canGoBack: currentStep > 1,
        isLastStep: currentStep === TOTAL_STEPS,
      }}
    >
      {children}
    </LogMoodContext.Provider>
  );
}

export function useLogMood() {
  const context = useContext(LogMoodContext);
  if (!context) {
    throw new Error("useLogMood must be used within a LogMoodProvider");
  }
  return context;
}
