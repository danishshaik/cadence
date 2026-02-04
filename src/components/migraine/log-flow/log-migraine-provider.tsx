import React, { createContext, useContext, useState, ReactNode } from "react";
import { MigraineLog, TimeOfDay } from "@/types/migraine";

export interface LogMigraineFormData {
  severity: number;
  severityLabel: "mild" | "moderate" | "severe";
  startedAt: Date;
  timeOfDay: TimeOfDay;
  isOngoing: boolean;
  durationMinutes: number | null;
  painLocations: string[];
  triggers: string[];
  medicationTaken: boolean;
  medications: { name: string; takenAt: string }[];
  medicationNoneSelected: boolean;
  notes: string | null;
}

interface LogMigraineContextType {
  formData: LogMigraineFormData;
  currentStep: number;
  totalSteps: number;
  updateFormData: <K extends keyof LogMigraineFormData>(
    key: K,
    value: LogMigraineFormData[K]
  ) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
  isLastStep: boolean;
}

const LogMigraineContext = createContext<LogMigraineContextType | null>(null);

const TOTAL_STEPS = 5;

const getInitialTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) return "night";
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
};

const getSeverityLabel = (severity: number): "mild" | "moderate" | "severe" => {
  if (severity <= 3) return "mild";
  if (severity <= 6) return "moderate";
  return "severe";
};

const getInitialFormData = (): LogMigraineFormData => ({
  severity: 5,
  severityLabel: "moderate",
  startedAt: new Date(),
  timeOfDay: getInitialTimeOfDay(),
  isOngoing: true,
  durationMinutes: null,
  painLocations: [],
  triggers: [],
  medicationTaken: false,
  medications: [],
  medicationNoneSelected: false,
  notes: null,
});

interface LogMigraineProviderProps {
  children: ReactNode;
}

export function LogMigraineProvider({ children }: LogMigraineProviderProps) {
  const [formData, setFormData] = useState<LogMigraineFormData>(getInitialFormData);
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = <K extends keyof LogMigraineFormData>(
    key: K,
    value: LogMigraineFormData[K]
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [key]: value };
      // Auto-update severityLabel when severity changes
      if (key === "severity" && typeof value === "number") {
        updated.severityLabel = getSeverityLabel(value);
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

  const canGoNext = currentStep < TOTAL_STEPS;
  const canGoBack = currentStep > 1;
  const isLastStep = currentStep === TOTAL_STEPS;

  return (
    <LogMigraineContext.Provider
      value={{
        formData,
        currentStep,
        totalSteps: TOTAL_STEPS,
        updateFormData,
        goToNextStep,
        goToPreviousStep,
        canGoNext,
        canGoBack,
        isLastStep,
      }}
    >
      {children}
    </LogMigraineContext.Provider>
  );
}

export function useLogMigraine() {
  const context = useContext(LogMigraineContext);
  if (!context) {
    throw new Error("useLogMigraine must be used within LogMigraineProvider");
  }
  return context;
}

export { getSeverityLabel };
