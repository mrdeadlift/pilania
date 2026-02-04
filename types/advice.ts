export type AdviceType = "correction" | "encouragement" | "tip";
export type AdvicePriority = "high" | "medium" | "low";

export interface Advice {
  type: AdviceType;
  priority: AdvicePriority;
  bodyPart: string;
  message: string;
  messageJa: string;
  detailedExplanation?: string;
  detailedExplanationJa?: string;
}
