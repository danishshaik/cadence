import React, { createContext, useContext, useState, ReactNode } from "react";
import { ContextType, PainLocationId, SymptomId, BristolType, TriggerId } from "@/types/gi";

interface GIFormData {
  severity: number;
  severityLabel: "mild" | "moderate" | "severe";
  startedAt: Date;
  context: ContextType;
  painLocations: PainLocationId[];
  symptoms: SymptomId[];
  bowelMovement: BristolType | null;
  triggers: TriggerId[];
  notes: string | null;
}

interface LogGIContextType {
  formData: GIFormData;
  updateFormData: (updates: Partial<GIFormData>) => void;
  currentStep: number;
  totalSteps: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

const LogGIContext = createContext<LogGIContextType | null>(null);

const TOTAL_STEPS = 6;

const initialFormData: GIFormData = {
  severity: 5,
  severityLabel: "moderate",
  startedAt: new Date(),
  context: "randomly",
  painLocations: [],
  symptoms: [],
  bowelMovement: null,
  triggers: [],
  notes: null,
};

export function LogGIProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<GIFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (updates: Partial<GIFormData>) => {
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
    <LogGIContext.Provider
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
    </LogGIContext.Provider>
  );
}

export function useLogGI() {
  const context = useContext(LogGIContext);
  if (!context) {
    throw new Error("useLogGI must be used within a LogGIProvider");
  }
  return context;
}
