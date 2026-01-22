export interface ComponentProps<T = unknown> {
  id: string;
  prompt: string;
  value: T | undefined;
  onChange: (value: T) => void;
  disabled?: boolean;
  showPrevious?: boolean;
  previousValue?: T;
}

export type { CheckinScreen, CheckinSection, CheckinComponent } from "@/types/api";
