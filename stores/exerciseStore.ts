import { create } from "zustand";
import type { Exercise, ComparisonResult, Advice } from "@/types";

interface ExerciseState {
  selectedExercise: Exercise | null;
  currentScore: number;
  latestComparison: ComparisonResult | null;
  currentAdvice: Advice[];
  isDetecting: boolean;
  setSelectedExercise: (exercise: Exercise | null) => void;
  setCurrentScore: (score: number) => void;
  setLatestComparison: (comparison: ComparisonResult | null) => void;
  setCurrentAdvice: (advice: Advice[]) => void;
  setIsDetecting: (detecting: boolean) => void;
  reset: () => void;
}

const initialState = {
  selectedExercise: null,
  currentScore: 0,
  latestComparison: null,
  currentAdvice: [],
  isDetecting: false,
};

export const useExerciseStore = create<ExerciseState>((set) => ({
  ...initialState,
  setSelectedExercise: (exercise) => set({ selectedExercise: exercise }),
  setCurrentScore: (score) => set({ currentScore: score }),
  setLatestComparison: (comparison) => set({ latestComparison: comparison }),
  setCurrentAdvice: (advice) => set({ currentAdvice: advice }),
  setIsDetecting: (detecting) => set({ isDetecting: detecting }),
  reset: () => set(initialState),
}));
