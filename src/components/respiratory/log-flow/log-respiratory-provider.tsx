import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  RespiratoryFormData,
  RespiratorySymptomId,
  RespiratoryTriggerId,
  RespiratoryMedicationId,
  ImpactLevelId,
  getBreathingLabel,
} from "@/types/respiratory";

interface LogRespiratoryContextType {
  formData: RespiratoryFormData;
  updateFormData: (updates: Partial<RespiratoryFormData>) => void;
  currentStep: number;
  totalSteps: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

const LogRespiratoryContext = createContext<LogRespiratoryContextType | null>(null);

const TOTAL_STEPS = 5;

const initialFormData: RespiratoryFormData = {
  constriction: 3,
  constrictionLabel: "Slightly Tight",
  symptoms: [],
  triggers: [],
  impact: "none",
  rescueInhalerPuffs: 0,
  medications: [],
  notes: "",
  loggedAt: new Date(),
};

export function LogRespiratoryProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<RespiratoryFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (updates: Partial<RespiratoryFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...updates };
      // Auto-update constriction label when constriction changes
      if ("constriction" in updates) {
        updated.constrictionLabel = getBreathingLabel(updated.constriction);
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
    <LogRespiratoryContext.Provider
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
    </LogRespiratoryContext.Provider>
  );
}

export function useLogRespiratory() {
  const context = useContext(LogRespiratoryContext);
  if (!context) {
    throw new Error("useLogRespiratory must be used within a LogRespiratoryProvider");
  }
  return context;
}
