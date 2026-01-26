import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  SkinFormData,
  BreakoutTypeId,
  SkinTriggerId,
  RoutineStepId,
  TreatmentActiveId,
  SpotTreatmentId,
  RoutineTime,
  getSeverityLabel,
} from "@/types/skin";

interface LogSkinContextType {
  formData: SkinFormData;
  updateFormData: (updates: Partial<SkinFormData>) => void;
  currentStep: number;
  totalSteps: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

const LogSkinContext = createContext<LogSkinContextType | null>(null);

const TOTAL_STEPS = 5;

const initialFormData: SkinFormData = {
  photoUri: undefined,
  breakoutTypes: [],
  severity: 3,
  severityLabel: "Mild",
  triggers: [],
  routineTime: new Date().getHours() < 14 ? "am" : "pm",
  routineSteps: [],
  treatmentActives: [],
  spotTreatments: [],
  notes: "",
  loggedAt: new Date(),
};

export function LogSkinProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<SkinFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (updates: Partial<SkinFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...updates };
      // Auto-update severity label when severity changes
      if ("severity" in updates) {
        updated.severityLabel = getSeverityLabel(updated.severity);
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
    <LogSkinContext.Provider
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
    </LogSkinContext.Provider>
  );
}

export function useLogSkin() {
  const context = useContext(LogSkinContext);
  if (!context) {
    throw new Error("useLogSkin must be used within a LogSkinProvider");
  }
  return context;
}
