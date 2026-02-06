import { create } from "zustand";
import type { Session, SessionExercise } from "@/types";

interface SessionState {
  currentSession: Session | null;
  startSession: () => void;
  endSession: () => void;
  addExerciseResult: (result: SessionExercise) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  currentSession: null,

  startSession: () => {
    const newSession: Session = {
      id: crypto.randomUUID(),
      userId: "anonymous",
      startedAt: new Date(),
      exercises: [],
      overallScore: 0,
    };
    set({ currentSession: newSession });
  },

  endSession: () => {
    set((state) => {
      if (!state.currentSession) return state;

      const exercises = state.currentSession.exercises;
      const overallScore = exercises.length > 0
        ? exercises.reduce((sum, ex) => sum + ex.avgScore, 0) / exercises.length
        : 0;

      return {
        currentSession: {
          ...state.currentSession,
          endedAt: new Date(),
          overallScore,
        },
      };
    });
  },

  addExerciseResult: (result) => {
    set((state) => {
      if (!state.currentSession) return state;
      return {
        currentSession: {
          ...state.currentSession,
          exercises: [...state.currentSession.exercises, result],
        },
      };
    });
  },

  reset: () => set({ currentSession: null }),
}));
