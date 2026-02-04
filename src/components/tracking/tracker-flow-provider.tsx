import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  FormDataConstraint,
  TrackerFlowContextValue,
  TrackerFlowProviderProps,
  ValidationResult,
} from "./types";

/**
 * Context for the tracker flow.
 * Using FormDataConstraint as a placeholder - consumers will cast to their specific type.
 */
const TrackerFlowContext = createContext<TrackerFlowContextValue<FormDataConstraint> | null>(
  null
);

/**
 * Generic provider that normalizes flow state across all trackers.
 *
 * This adapter provides a consistent interface for:
 * - Form data management (get, set, update fields)
 * - Step navigation (next, previous, go to step)
 * - Validation (per-step validation with error state)
 * - Save/cancel actions
 *
 * Usage:
 * ```tsx
 * <TrackerFlowProvider
 *   initialData={getInitialFormData()}
 *   totalSteps={7}
 *   onSave={(data) => store.addLog(data)}
 *   onCancel={() => router.back()}
 * >
 *   <FlowContent />
 * </TrackerFlowProvider>
 * ```
 */
export function TrackerFlowProvider<TFormData extends FormDataConstraint>({
  initialData,
  totalSteps,
  onSave,
  onCancel,
  validator,
  onFormDataChange,
  children,
}: TrackerFlowProviderProps<TFormData>) {
  // Form state
  const [formData, setFormDataInternal] = useState<TFormData>(initialData);
  const [currentStep, setCurrentStep] = useState(0); // 0-based internally
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Form data management
  const updateField = useCallback(
    <K extends keyof TFormData>(key: K, value: TFormData[K]) => {
      setFormDataInternal((prev) => {
        const updated = { ...prev, [key]: value };
        // Allow parent to transform data (e.g., auto-compute derived fields)
        return onFormDataChange ? onFormDataChange(updated) : updated;
      });
    },
    [onFormDataChange]
  );

  const setFormData = useCallback(
    (data: TFormData | ((prev: TFormData) => TFormData)) => {
      setFormDataInternal((prev) => {
        const updated =
          typeof data === "function"
            ? (data as (prev: TFormData) => TFormData)(prev)
            : data;
        return onFormDataChange ? onFormDataChange(updated) : updated;
      });
    },
    [onFormDataChange]
  );

  const resetForm = useCallback(() => {
    setFormDataInternal(initialData);
    setCurrentStep(0);
    setErrors({});
  }, [initialData]);

  // Navigation
  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  // Validation
  const validateStep = useCallback((): ValidationResult => {
    if (!validator) {
      return { isValid: true, errors: {} };
    }
    const result = validator(formData, currentStep);
    setErrors(result.errors);
    return result;
  }, [validator, formData, currentStep]);

  const validateAllSteps = useCallback((): ValidationResult => {
    if (!validator) {
      return { isValid: true, errors: {} };
    }
    for (let stepIndex = 0; stepIndex < totalSteps; stepIndex += 1) {
      const result = validator(formData, stepIndex);
      if (!result.isValid) {
        setErrors(result.errors);
        return { ...result, stepIndex: stepIndex + 1 };
      }
    }
    setErrors({});
    return { isValid: true, errors: {} };
  }, [validator, formData, totalSteps]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const isStepValid = useMemo(() => {
    if (!validator) return true;
    const result = validator(formData, currentStep);
    return result.isValid;
  }, [validator, formData, currentStep]);

  // Actions
  const save = useCallback(async () => {
    if (isSaving) return;

    // Validate before saving
    if (validator) {
      const result = validator(formData, currentStep);
      if (!result.isValid) {
        setErrors(result.errors);
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  }, [formData, currentStep, validator, onSave, isSaving]);

  const cancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  // Computed navigation flags
  const canGoNext = currentStep < totalSteps - 1;
  const canGoBack = currentStep > 0;
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  // Build context value
  // Note: We expose currentStep as 1-based for display compatibility with existing UI
  const contextValue = useMemo(
    (): TrackerFlowContextValue<TFormData> => ({
      // Navigation (expose as 1-based for backward compatibility)
      currentStep: currentStep + 1,
      totalSteps,
      goToNextStep,
      goToPreviousStep,
      goToStep: (step: number) => goToStep(step - 1), // Convert 1-based input to 0-based
      canGoNext,
      canGoBack,
      isLastStep,
      isFirstStep,
      // Form state
      formData,
      updateField,
      setFormData,
      resetForm,
      // Validation
      errors,
      isStepValid,
      validateStep,
      validateAllSteps,
      clearErrors,
      setFieldError,
      // Actions
      save,
      cancel,
      isSaving,
    }),
    [
      currentStep,
      totalSteps,
      goToNextStep,
      goToPreviousStep,
      goToStep,
      canGoNext,
      canGoBack,
      isLastStep,
      isFirstStep,
      formData,
      updateField,
      setFormData,
      resetForm,
      errors,
      isStepValid,
      validateStep,
      validateAllSteps,
      clearErrors,
      setFieldError,
      save,
      cancel,
      isSaving,
    ]
  );

  return (
    <TrackerFlowContext.Provider
      value={contextValue as unknown as TrackerFlowContextValue<FormDataConstraint>}
    >
      {children}
    </TrackerFlowContext.Provider>
  );
}

/**
 * Hook to access the tracker flow context.
 * Must be used within a TrackerFlowProvider.
 *
 * @template TFormData - The type of form data for this flow
 */
export function useTrackerFlow<
  TFormData extends FormDataConstraint
>(): TrackerFlowContextValue<TFormData> {
  const context = useContext(TrackerFlowContext);
  if (!context) {
    throw new Error("useTrackerFlow must be used within a TrackerFlowProvider");
  }
  return context as unknown as TrackerFlowContextValue<TFormData>;
}

/**
 * Hook to access only navigation-related state and methods.
 * Useful for components that don't need form data access.
 */
export function useFlowNavigation() {
  const {
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    canGoNext,
    canGoBack,
    isLastStep,
    isFirstStep,
  } = useTrackerFlow();

  return {
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    canGoNext,
    canGoBack,
    isLastStep,
    isFirstStep,
  };
}

/**
 * Hook to access only validation-related state and methods.
 */
export function useFlowValidation() {
  const {
    errors,
    isStepValid,
    validateStep,
    validateAllSteps,
    clearErrors,
    setFieldError,
  } = useTrackerFlow();

  return {
    errors,
    isStepValid,
    validateStep,
    validateAllSteps,
    clearErrors,
    setFieldError,
  };
}
