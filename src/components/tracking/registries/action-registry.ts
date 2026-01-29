import { ArthritisFormData } from "@/types/arthritis";

export type ActionKey = "arthritis.save";

type ActionHandler<TPayload, TContext> = (payload: TPayload, context: TContext) => void;

interface ArthritisSaveContext {
  addLog: (log: {
    stiffness: number;
    morningStiffness: boolean;
    affectedJoints: ArthritisFormData["affectedJoints"];
    bilateralSymmetry: boolean;
    barometricPressure?: ArthritisFormData["barometricPressure"];
    temperature?: number;
    humidity?: number;
    weatherConfirmation?: ArthritisFormData["weatherConfirmation"];
    activities: ArthritisFormData["activities"];
    managementMethods: ArthritisFormData["managementMethods"];
    notes: string;
  }) => void;
  onComplete: () => void;
}

const actionRegistry: Record<ActionKey, ActionHandler<ArthritisFormData, ArthritisSaveContext>> =
  {
    "arthritis.save": (formData, { addLog, onComplete }) => {
      addLog({
        stiffness: formData.stiffness,
        morningStiffness: formData.morningStiffness,
        affectedJoints: formData.affectedJoints,
        bilateralSymmetry: formData.bilateralSymmetry,
        barometricPressure: formData.barometricPressure ?? undefined,
        temperature: formData.temperature ?? undefined,
        humidity: formData.humidity ?? undefined,
        weatherConfirmation: formData.weatherConfirmation ?? undefined,
        activities: formData.activities,
        managementMethods: formData.managementMethods,
        notes: formData.notes,
      });
      onComplete();
    },
  };

export function getAction<TPayload, TContext>(
  key: ActionKey
): ActionHandler<TPayload, TContext> {
  return actionRegistry[key] as unknown as ActionHandler<TPayload, TContext>;
}
