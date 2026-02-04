import { ValidationResult } from "../types";
import { ArthritisFormData } from "@/types/arthritis";

export type ValidationKey = "arthritis.location";

type ValidationHandler = (data: ArthritisFormData) => ValidationResult;

const validationRegistry: Record<ValidationKey, ValidationHandler> = {
  "arthritis.location": (data) => {
    if (data.affectedJoints.length === 0) {
      return {
        isValid: false,
        errors: { affectedJoints: "Select at least one joint." },
      };
    }
    return { isValid: true, errors: {} };
  },
};

export function getValidation(key: ValidationKey): ValidationHandler {
  return validationRegistry[key];
}
