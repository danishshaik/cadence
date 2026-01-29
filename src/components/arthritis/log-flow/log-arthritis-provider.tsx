import React, { ReactNode, useCallback, useMemo } from "react";
import { TrackerFlowProvider, useTrackerFlow } from "@components/tracking/tracker-flow-provider";
import {
  ArthritisFormData,
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

function normalizeFormData(data: ArthritisFormData): ArthritisFormData {
  const stiffnessLabel = getStiffnessLabel(data.stiffness);
  if (stiffnessLabel === data.stiffnessLabel) {
    return data;
  }
  return { ...data, stiffnessLabel };
}

export function LogArthritisProvider({ children }: { children: ReactNode }) {
  return (
    <TrackerFlowProvider
      initialData={initialFormData}
      totalSteps={TOTAL_STEPS}
      onSave={() => {}}
      onCancel={() => {}}
      onFormDataChange={normalizeFormData}
    >
      {children}
    </TrackerFlowProvider>
  );
}

export function useLogArthritis(): LogArthritisContextType {
  const {
    formData,
    setFormData,
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
    isLastStep,
  } = useTrackerFlow<ArthritisFormData>();

  const updateFormData = useCallback(
    (updates: Partial<ArthritisFormData>) => {
      setFormData((prev) => ({ ...prev, ...updates }));
    },
    [setFormData]
  );

  return useMemo(
    () => ({
      formData,
      updateFormData,
      currentStep,
      totalSteps,
      goToNextStep,
      goToPreviousStep,
      canGoBack,
      isLastStep,
    }),
    [
      formData,
      updateFormData,
      currentStep,
      totalSteps,
      goToNextStep,
      goToPreviousStep,
      canGoBack,
      isLastStep,
    ]
  );
}
