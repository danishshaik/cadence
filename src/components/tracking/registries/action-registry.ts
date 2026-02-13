import { ArthritisFormData } from "@/types/arthritis";
import { CongestionFormData } from "@/types/congestion";
import { MigraineFormData } from "@/types/migraine";
import {
  OrthostaticHydrationFactor,
  OrthostaticPosition,
  OrthostaticSedentaryDuration,
  OrthostaticSymptom,
} from "@/types/orthostatic";
import { SkinFormData } from "@/types/skin";

export type ActionKey =
  | "arthritis.save"
  | "migraine.save"
  | "orthostatic.save"
  | "congestion.save"
  | "skin.save";

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

interface OrthostaticSaveContext {
  addLog: (log: {
    severity: number;
    durationSeconds: number;
    durationMinutes: number;
    symptoms: OrthostaticSymptom[];
    positionBeforeStanding: OrthostaticPosition;
    sedentaryDuration: OrthostaticSedentaryDuration;
    hydrationFactors: OrthostaticHydrationFactor[];
  }) => void;
  onComplete: () => void;
}

interface CongestionSaveContext {
  addLog: (log: {
    sleepQuality: number;
    wokeDuringNight: boolean;
    coughCharacters: CongestionFormData["coughCharacters"];
    congestionSource: CongestionFormData["congestionSource"];
    phlegmColor: CongestionFormData["phlegmColor"];
    reliefMeasures: CongestionFormData["reliefMeasures"];
    notes?: string;
  }) => void;
  onComplete: () => void;
}

interface SkinSaveContext {
  addLog: (log: {
    photoUri?: string;
    breakoutTypes: SkinFormData["breakoutTypes"];
    severity: number;
    morningLightness?: boolean;
    triggers: SkinFormData["triggers"];
    routineTime: SkinFormData["routineTime"];
    routineSteps: SkinFormData["routineSteps"];
    treatmentActives: SkinFormData["treatmentActives"];
    spotTreatments: SkinFormData["spotTreatments"];
    notes?: string;
  }) => void;
  onComplete: () => void;
}

const actionRegistry = {
  "arthritis.save": (formData: ArthritisFormData, { addLog, onComplete }: ArthritisSaveContext) => {
    const data = formData;
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
  "migraine.save": (formData: MigraineFormData, { addLog, onComplete }: MigraineSaveContext) => {
    const data = formData;
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
  "orthostatic.save": (
    formData: {
      severity: number;
      durationSeconds: number;
      durationMinutes: number;
      symptoms: OrthostaticSymptom[];
      positionBeforeStanding: OrthostaticPosition;
      sedentaryDuration: OrthostaticSedentaryDuration;
      hydrationFactors: OrthostaticHydrationFactor[];
    },
    { addLog, onComplete }: OrthostaticSaveContext
  ) => {
    addLog({
      severity: formData.severity,
      durationSeconds: formData.durationSeconds,
      durationMinutes: formData.durationMinutes,
      symptoms: formData.symptoms,
      positionBeforeStanding: formData.positionBeforeStanding,
      sedentaryDuration: formData.sedentaryDuration,
      hydrationFactors: formData.hydrationFactors,
    });
    onComplete();
  },
  "congestion.save": (
    formData: CongestionFormData,
    { addLog, onComplete }: CongestionSaveContext
  ) => {
    addLog({
      sleepQuality: formData.sleepQuality,
      wokeDuringNight: formData.wokeDuringNight,
      coughCharacters: formData.coughCharacters,
      congestionSource: formData.congestionSource,
      phlegmColor: formData.phlegmColor,
      reliefMeasures: formData.reliefMeasures,
      notes: formData.notes || undefined,
    });
    onComplete();
  },
  "skin.save": (formData: SkinFormData, { addLog, onComplete }: SkinSaveContext) => {
    addLog({
      photoUri: formData.photoUri,
      breakoutTypes: formData.breakoutTypes,
      severity: formData.severity,
      morningLightness: formData.morningLightness,
      triggers: formData.triggers,
      routineTime: formData.routineTime,
      routineSteps: formData.routineSteps,
      treatmentActives: formData.treatmentActives,
      spotTreatments: formData.spotTreatments,
      notes: formData.notes || undefined,
    });
    onComplete();
  },
} as const;

export function getAction<TPayload, TContext>(
  key: ActionKey
): ActionHandler<TPayload, TContext> {
  return actionRegistry[key] as unknown as ActionHandler<TPayload, TContext>;
}
