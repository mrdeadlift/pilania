import type { Advice } from "./advice";

export interface SessionExercise {
  exerciseId: string;
  scores: number[];
  avgScore: number;
  duration: number; // seconds
  adviceGiven: Advice[];
}

export interface Session {
  id: string;
  userId: string; // 'anonymous' for Phase 1
  startedAt: Date;
  endedAt?: Date;
  exercises: SessionExercise[];
  overallScore: number;
}
