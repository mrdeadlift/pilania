import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import type { ComparisonResult, Keypoint, PoseFrame } from "@/types";
import { comparePoses } from "@/lib/pose/comparison";
import {
  applyExponentialMovingAverage,
  getScoreLabelText,
} from "@/lib/pose/scoring";
import { useExerciseStore } from "@/stores/exerciseStore";
import { useSettingsStore } from "@/stores/settingsStore";

interface UsePoseComparisonOptions {
  referencePoses?: PoseFrame[];
  enabled?: boolean;
  minConfidence?: number;
  angleWeight?: number;
  similarityWeight?: number;
  smoothingFactor?: number;
}

interface UsePoseComparisonResult {
  comparisonResult: ComparisonResult | null;
  smoothedScore: number;
  scoreLabel: string;
  currentReferencePose: PoseFrame | null;
}

function findFrameIndexByTimestamp(frames: PoseFrame[], currentTimestamp: number) {
  for (let i = frames.length - 1; i >= 0; i--) {
    if (currentTimestamp >= frames[i].timestamp) {
      return i;
    }
  }

  return 0;
}

function resolveReferencePose(
  sortedReferencePoses: PoseFrame[],
  startedAtRef: MutableRefObject<number | null>
): PoseFrame | null {
  if (sortedReferencePoses.length === 0) {
    return null;
  }

  if (sortedReferencePoses.length === 1) {
    return sortedReferencePoses[0];
  }

  const now = Date.now();
  if (startedAtRef.current === null) {
    startedAtRef.current = now;
  }

  const firstTimestamp = sortedReferencePoses[0].timestamp;
  const lastTimestamp = sortedReferencePoses[sortedReferencePoses.length - 1].timestamp;
  const duration = Math.max(1, lastTimestamp - firstTimestamp);
  const elapsed = now - startedAtRef.current;
  const loopTimestamp = firstTimestamp + (elapsed % duration);
  const frameIndex = findFrameIndexByTimestamp(sortedReferencePoses, loopTimestamp);
  return sortedReferencePoses[frameIndex];
}

export function usePoseComparison(
  keypoints: Keypoint[],
  options: UsePoseComparisonOptions = {}
): UsePoseComparisonResult {
  const selectedExercise = useExerciseStore((state) => state.selectedExercise);
  const setCurrentScore = useExerciseStore((state) => state.setCurrentScore);
  const setLatestComparison = useExerciseStore(
    (state) => state.setLatestComparison
  );
  const language = useSettingsStore((state) => state.language);

  const referencePoses = useMemo(
    () => options.referencePoses ?? selectedExercise?.referencePoses ?? [],
    [options.referencePoses, selectedExercise?.referencePoses]
  );
  const enabled = options.enabled ?? true;
  const minConfidence = options.minConfidence ?? 0.3;
  const angleWeight = options.angleWeight ?? 0.6;
  const similarityWeight = options.similarityWeight ?? 0.4;
  const smoothingFactor = options.smoothingFactor ?? 0.25;

  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(
    null
  );
  const [currentReferencePose, setCurrentReferencePose] = useState<PoseFrame | null>(
    null
  );
  const [smoothedScore, setSmoothedScore] = useState(0);

  const startedAtRef = useRef<number | null>(null);
  const previousSmoothedScoreRef = useRef<number | null>(null);

  const sortedReferencePoses = useMemo(
    () => [...referencePoses].sort((a, b) => a.timestamp - b.timestamp),
    [referencePoses]
  );

  const hasComparableInput =
    enabled && keypoints.length > 0 && sortedReferencePoses.length > 0;

  useEffect(() => {
    startedAtRef.current = null;
    previousSmoothedScoreRef.current = null;
  }, [selectedExercise?.id, referencePoses]);

  useEffect(() => {
    if (!hasComparableInput) {
      setLatestComparison(null);
      setCurrentScore(0);
      return;
    }

    const referencePose = resolveReferencePose(sortedReferencePoses, startedAtRef);
    if (!referencePose) {
      return;
    }

    setCurrentReferencePose(referencePose);

    const result = comparePoses(keypoints, referencePose.keypoints, {
      minConfidence,
      angleWeight,
      similarityWeight,
    });

    setComparisonResult(result);
    setLatestComparison(result);

    const nextSmoothedScore = applyExponentialMovingAverage(
      previousSmoothedScoreRef.current,
      result.overallScore,
      smoothingFactor
    );

    previousSmoothedScoreRef.current = nextSmoothedScore;
    setSmoothedScore(nextSmoothedScore);
    setCurrentScore(nextSmoothedScore);
  }, [
    keypoints,
    sortedReferencePoses,
    hasComparableInput,
    minConfidence,
    angleWeight,
    similarityWeight,
    smoothingFactor,
    setCurrentScore,
    setLatestComparison,
  ]);

  const visibleScore = hasComparableInput ? smoothedScore : 0;
  const scoreLabel = useMemo(
    () => getScoreLabelText(visibleScore, language),
    [visibleScore, language]
  );

  return {
    comparisonResult: hasComparableInput ? comparisonResult : null,
    smoothedScore: visibleScore,
    scoreLabel,
    currentReferencePose: hasComparableInput ? currentReferencePose : null,
  };
}
