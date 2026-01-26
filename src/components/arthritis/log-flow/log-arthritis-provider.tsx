import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  ArthritisFormData,
  JointLocationId,
  ActivityTypeId,
  ManagementMethodId,
  WeatherConfirmationId,
  getStiffnessLabel,
} from "@/types/arthritis";

interface LogArthritisContextType {
  formData: ArthritisFormData;
  updateFormData: (updates: Partial<ArthritisFormData>) => void;
  currentStep: number;
  totalSteps: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

const LogArthritisContext = createContext<LogArthritisContextType | null>(null);

const TOTAL_STEPS = 5;

const initialFormData: ArthritisFormData = {
  stiffness: 3,
  stiffnessLabel: "Slightly Stiff",
  morningStiffness: false,
  affectedJoints: [],
  bilateralSymmetry: false,
  barometricPressure: null,
  temperature: null,
  humidity: null,
  weatherConfirmation: null,
  activities: [],
  managementMethods: [],
  notes: "",
  loggedAt: new Date(),
};

export function LogArthritisProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<ArthritisFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (updates: Partial<ArthritisFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...updates };
      // Auto-update stiffness label when stiffness changes
      if ("stiffness" in updates) {
        updated.stiffnessLabel = getStiffnessLabel(updated.stiffness);
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
    <LogArthritisContext.Provider
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
    </LogArthritisContext.Provider>
  );
}

export function useLogArthritis() {
  const context = useContext(LogArthritisContext);
  if (!context) {
    throw new Error("useLogArthritis must be used within a LogArthritisProvider");
  }
  return context;
}
