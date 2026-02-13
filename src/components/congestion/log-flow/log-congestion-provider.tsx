import React, { createContext, useContext, useState, ReactNode } from "react";
import { CongestionFormData, getSleepLabel } from "@/types/congestion";

interface LogCongestionContextType {
  formData: CongestionFormData;
  updateFormData: (updates: Partial<CongestionFormData>) => void;
  currentStep: number;
  totalSteps: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

const LogCongestionContext = createContext<LogCongestionContextType | null>(null);

const TOTAL_STEPS = 5;

const initialFormData: CongestionFormData = {
  sleepQuality: 0,
  sleepLabel: getSleepLabel(0),
  wokeDuringNight: false,
  coughCharacters: [],
  congestionSource: ["throat"],
  phlegmColor: null,
  reliefMeasures: [],
  notes: "",
  loggedAt: new Date(),
};

export function LogCongestionProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<CongestionFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (updates: Partial<CongestionFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...updates };
      if ("sleepQuality" in updates) {
        updated.sleepLabel = getSleepLabel(updated.sleepQuality);
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
    <LogCongestionContext.Provider
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
    </LogCongestionContext.Provider>
  );
}

export function useLogCongestion() {
  const context = useContext(LogCongestionContext);
  if (!context) {
    throw new Error("useLogCongestion must be used within a LogCongestionProvider");
  }
  return context;
}
