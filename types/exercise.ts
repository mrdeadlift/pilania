import type { PoseFrame } from "./pose";

export type ExerciseCategory = "basic" | "intermediate" | "advanced";

export interface Exercise {
  id: string;
  name: string;
  nameJa: string;
  category: ExerciseCategory;
  targetMuscles: string[];
  duration: number; // seconds
  description: string;
  descriptionJa: string;
  tips: string[];
  tipsJa: string[];
  referenceVideo?: string;
  referencePoses: PoseFrame[];
  thumbnail?: string;
}
