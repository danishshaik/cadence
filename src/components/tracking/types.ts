/**
 * Shared type definitions for the tracking flow system.
 */

/**
 * Base constraint for form data objects.
 * Using `object` instead of `Record<string, unknown>` to allow complex types like Date, arrays, etc.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type FormDataConstraint = {};

/**
 * Base props that all field components receive.
 * Fields are the atomic UI elements within steps (inputs, selectors, scales, etc.)
 */
export interface FieldProps<T> {
  /** Current value of the field */
  value: T;
  /** Callback when value changes */
  onChange: (value: T) => void;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Field label */
  label?: string;
  /** Additional description/hint text */
  description?: string;
}

/**
 * Extended field props with variant support for fields that have multiple visual styles.
 */
export interface FieldPropsWithVariant<T, V extends string = string>
  extends FieldProps<T> {
  /** Visual variant of the field */
  variant?: V;
}

/**
 * Validation result for a step or field.
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Error messages keyed by field name */
  errors: Record<string, string>;
  /** Optional 1-based step index for the first failing step */
  stepIndex?: number;
}

/**
 * Step validation function type.
 * Receives form data and returns validation result.
 */
export type StepValidator<TFormData> = (
  formData: TFormData,
  stepIndex: number
) => ValidationResult;

/**
 * Configuration for a single step in a flow.
 */
export interface StepConfig {
  /** Unique identifier for the step */
  id: string;
  /** Display title for the step */
  title?: string;
  /** Whether this step can be skipped */
  optional?: boolean;
}

/**
 * Navigation state and methods provided by TrackerFlowProvider.
 */
export interface FlowNavigation {
  /** Current step index (0-based internally, but displayed as 1-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Go to next step */
  goToNextStep: () => void;
  /** Go to previous step */
  goToPreviousStep: () => void;
  /** Go to a specific step (0-based index) */
  goToStep: (step: number) => void;
  /** Whether can navigate forward */
  canGoNext: boolean;
  /** Whether can navigate backward */
  canGoBack: boolean;
  /** Whether currently on the last step */
  isLastStep: boolean;
  /** Whether currently on the first step */
  isFirstStep: boolean;
}

/**
 * Form state and methods provided by TrackerFlowProvider.
 */
export interface FlowFormState<TFormData extends FormDataConstraint> {
  /** Current form data */
  formData: TFormData;
  /** Update a single field */
  updateField: <K extends keyof TFormData>(key: K, value: TFormData[K]) => void;
  /** Replace entire form data */
  setFormData: (data: TFormData | ((prev: TFormData) => TFormData)) => void;
  /** Reset form to initial values */
  resetForm: () => void;
}

/**
 * Validation state provided by TrackerFlowProvider.
 */
export interface FlowValidation {
  /** Current validation errors keyed by field name */
  errors: Record<string, string>;
  /** Whether current step is valid */
  isStepValid: boolean;
  /** Validate current step and return result */
  validateStep: () => ValidationResult;
  /** Validate all steps and return the first failure */
  validateAllSteps: () => ValidationResult;
  /** Clear all validation errors */
  clearErrors: () => void;
  /** Set error for a specific field */
  setFieldError: (field: string, error: string) => void;
}

/**
 * Complete flow context combining navigation, form state, and validation.
 */
export interface TrackerFlowContextValue<TFormData extends FormDataConstraint>
  extends FlowNavigation,
    FlowFormState<TFormData>,
    FlowValidation {
  /** Trigger save action */
  save: () => void;
  /** Cancel the flow */
  cancel: () => void;
  /** Whether the flow is currently saving */
  isSaving: boolean;
}

/**
 * Props for TrackerFlowProvider.
 */
export interface TrackerFlowProviderProps<TFormData extends FormDataConstraint> {
  /** Initial form data */
  initialData: TFormData;
  /** Total number of steps */
  totalSteps: number;
  /** Called when save is triggered */
  onSave: (data: TFormData) => void | Promise<void>;
  /** Called when cancel is triggered */
  onCancel: () => void;
  /** Optional step validator */
  validator?: StepValidator<TFormData>;
  /** Optional callback when form data changes */
  onFormDataChange?: (data: TFormData) => TFormData;
  /** Children */
  children: React.ReactNode;
}
