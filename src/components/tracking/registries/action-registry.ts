import { ArthritisFormData } from "@/types/arthritis";
import { MigraineFormData } from "@/types/migraine";

export type ActionKey = "arthritis.save" | "migraine.save";

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

interface MigraineSaveContext {
  addLog: (log: {
    severity: number;
    severityLabel: MigraineFormData["severityLabel"];
    startedAt: string;
    timeOfDay: MigraineFormData["timeOfDay"];
    isOngoing: boolean;
    durationMinutes: number | null;
    painLocations: MigraineFormData["painLocations"];
    triggers: MigraineFormData["triggers"];
    medicationTaken: boolean;
    medications: MigraineFormData["medications"];
    notes: string | null;
  }) => void;
  onComplete: () => void;
}

const actionRegistry: Record<
  ActionKey,
  ActionHandler<ArthritisFormData | MigraineFormData, ArthritisSaveContext | MigraineSaveContext>
> = {
  "arthritis.save": (formData, { addLog, onComplete }) => {
    const data = formData as ArthritisFormData;
    addLog({
      stiffness: data.stiffness,
      morningStiffness: data.morningStiffness,
      affectedJoints: data.affectedJoints,
      bilateralSymmetry: data.bilateralSymmetry,
      barometricPressure: data.barometricPressure ?? undefined,
      temperature: data.temperature ?? undefined,
      humidity: data.humidity ?? undefined,
      weatherConfirmation: data.weatherConfirmation ?? undefined,
      activities: data.activities,
      managementMethods: data.managementMethods,
      notes: data.notes,
    });
    onComplete();
  },
  "migraine.save": (formData, { addLog, onComplete }) => {
    const data = formData as MigraineFormData;
    addLog({
      severity: data.severity,
      severityLabel: data.severityLabel,
      startedAt: data.startedAt.toISOString(),
      timeOfDay: data.timeOfDay,
      isOngoing: data.isOngoing,
      durationMinutes: data.durationMinutes,
      painLocations: data.painLocations,
      triggers: data.triggers,
      medicationTaken: data.medications.length > 0,
      medications: data.medications,
      notes: data.notes,
    });
    onComplete();
  },
};

export function getAction<TPayload, TContext>(
  key: ActionKey
): ActionHandler<TPayload, TContext> {
  return actionRegistry[key] as unknown as ActionHandler<TPayload, TContext>;
}
