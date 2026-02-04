import {
  EmotionId,
  MoodTriggerId,
  SelfCareId,
  SomaticSymptomId,
  getMoodLabel,
} from "@/types/mood";

export interface MoodFormData {
  energy: number;
  positivity: number;
  dominantMood: string;
  emotions: EmotionId[];
  somaticSymptoms: SomaticSymptomId[];
  triggers: MoodTriggerId[];
  selfCare: SelfCareId[];
  loggedAt: Date;
}

export const getInitialMoodFormData = (): MoodFormData => ({
  energy: 0,
  positivity: 0,
  dominantMood: "Neutral",
  emotions: [],
  somaticSymptoms: [],
  triggers: [],
  selfCare: [],
  loggedAt: new Date(),
});

export const normalizeMoodFormData = (data: MoodFormData): MoodFormData => ({
  ...data,
  dominantMood: getMoodLabel(data.energy, data.positivity),
});
