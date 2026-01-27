import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  OrthostaticHydrationFactor,
  OrthostaticPosition,
  OrthostaticSedentaryDuration,
  OrthostaticSymptom,
} from "@/types/orthostatic";

interface OrthostaticFormData {
  severity: number;
  durationSeconds: number;
  durationMinutes: number;
  symptoms: OrthostaticSymptom[];
  positionBeforeStanding: OrthostaticPosition;
  sedentaryDuration: OrthostaticSedentaryDuration;
  hydrationFactors: OrthostaticHydrationFactor[];
}

interface LogOrthostaticContextType {
  formData: OrthostaticFormData;
  updateFormData: (updates: Partial<OrthostaticFormData>) => void;
  currentStep: number;
  totalSteps: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

const LogOrthostaticContext = createContext<LogOrthostaticContextType | null>(null);

const TOTAL_STEPS = 5;

const initialFormData: OrthostaticFormData = {
  severity: 4,
  durationSeconds: 12,
  durationMinutes: 0,
  symptoms: [],
  positionBeforeStanding: "supine",
  sedentaryDuration: "under_10_min",
  hydrationFactors: [],
};

export function LogOrthostaticProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<OrthostaticFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (updates: Partial<OrthostaticFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
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
    <LogOrthostaticContext.Provider
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
    </LogOrthostaticContext.Provider>
  );
}

export function useLogOrthostatic() {
  const context = useContext(LogOrthostaticContext);
  if (!context) {
    throw new Error("useLogOrthostatic must be used within a LogOrthostaticProvider");
  }
  return context;
}
