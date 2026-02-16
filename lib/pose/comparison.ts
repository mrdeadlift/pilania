import type { BodyPartScores, ComparisonResult, Keypoint } from "@/types";
import { KEYPOINT_NAMES } from "@/types";
import {
  clamp,
  cosineSimilarity,
  distance,
  keypointsToVector,
  normalizeKeypoints,
} from "@/lib/utils/math";
import {
  angleDifferenceToScore,
  computeJointAngles,
  JOINT_ANGLE_DEFINITIONS,
  type BodyPartKey,
} from "@/lib/pose/angles";

interface ComparePosesOptions {
  minConfidence?: number;
  angleWeight?: number;
  similarityWeight?: number;
}

interface BodyPartAccumulator {
  weightedScore: number;
  totalWeight: number;
}

const DEFAULT_BODY_PART_SCORES: BodyPartScores = {
  upperBody: 0,
  core: 0,
  lowerBody: 0,
  arms: 0,
  legs: 0,
};

function toKeypointMap(keypoints: Keypoint[]) {
  return new Map(keypoints.map((keypoint) => [keypoint.name, keypoint]));
}

function toOrderedKeypoints(keypoints: Keypoint[]): Keypoint[] {
  const keypointMap = toKeypointMap(keypoints);
  return KEYPOINT_NAMES.map((name) =>
    keypointMap.get(name) ?? { name, x: 0, y: 0, score: 0 }
  );
}

function resolveWeights(angleWeight: number, similarityWeight: number) {
  const safeAngleWeight = Math.max(0, angleWeight);
  const safeSimilarityWeight = Math.max(0, similarityWeight);
  const total = safeAngleWeight + safeSimilarityWeight;

  if (total === 0) {
    return { normalizedAngleWeight: 0.6, normalizedSimilarityWeight: 0.4 };
  }

  return {
    normalizedAngleWeight: safeAngleWeight / total,
    normalizedSimilarityWeight: safeSimilarityWeight / total,
  };
}

function calculateBodyPartScores(
  angleDifferences: { joint: string; difference: number }[]
): BodyPartScores {
  const accumulators: Record<BodyPartKey, BodyPartAccumulator> = {
    upperBody: { weightedScore: 0, totalWeight: 0 },
    core: { weightedScore: 0, totalWeight: 0 },
    lowerBody: { weightedScore: 0, totalWeight: 0 },
    arms: { weightedScore: 0, totalWeight: 0 },
    legs: { weightedScore: 0, totalWeight: 0 },
  };

  for (const joint of angleDifferences) {
    const definition = JOINT_ANGLE_DEFINITIONS.find(
      (item) => item.joint === joint.joint
    );
    if (!definition) continue;

    const jointScore = angleDifferenceToScore(joint.difference);
    for (const bodyPart of definition.bodyParts) {
      accumulators[bodyPart].weightedScore += jointScore * definition.weight;
      accumulators[bodyPart].totalWeight += definition.weight;
    }
  }

  return {
    upperBody:
      accumulators.upperBody.totalWeight > 0
        ? accumulators.upperBody.weightedScore /
          accumulators.upperBody.totalWeight
        : 0,
    core:
      accumulators.core.totalWeight > 0
        ? accumulators.core.weightedScore / accumulators.core.totalWeight
        : 0,
    lowerBody:
      accumulators.lowerBody.totalWeight > 0
        ? accumulators.lowerBody.weightedScore / accumulators.lowerBody.totalWeight
        : 0,
    arms:
      accumulators.arms.totalWeight > 0
        ? accumulators.arms.weightedScore / accumulators.arms.totalWeight
        : 0,
    legs:
      accumulators.legs.totalWeight > 0
        ? accumulators.legs.weightedScore / accumulators.legs.totalWeight
        : 0,
  };
}

export function comparePoses(
  userKeypoints: Keypoint[],
  targetKeypoints: Keypoint[],
  options: ComparePosesOptions = {}
): ComparisonResult {
  const minConfidence = options.minConfidence ?? 0.3;
  const angleWeight = options.angleWeight ?? 0.6;
  const similarityWeight = options.similarityWeight ?? 0.4;

  if (userKeypoints.length === 0 || targetKeypoints.length === 0) {
    return {
      overallScore: 0,
      bodyPartScores: { ...DEFAULT_BODY_PART_SCORES },
      jointAngles: [],
      positionDifferences: [],
    };
  }

  const normalizedUser = normalizeKeypoints(userKeypoints);
  const normalizedTarget = normalizeKeypoints(targetKeypoints);
  const jointAngles = computeJointAngles(
    normalizedUser,
    normalizedTarget,
    minConfidence
  );

  let weightedAngleSum = 0;
  let angleTotalWeight = 0;

  for (const joint of jointAngles) {
    const definition = JOINT_ANGLE_DEFINITIONS.find(
      (item) => item.joint === joint.joint
    );
    if (!definition) continue;

    weightedAngleSum += angleDifferenceToScore(joint.difference) * definition.weight;
    angleTotalWeight += definition.weight;
  }

  const angleScore = angleTotalWeight > 0 ? weightedAngleSum / angleTotalWeight : 0;
  const bodyPartScores = calculateBodyPartScores(jointAngles);

  const orderedUser = toOrderedKeypoints(normalizedUser);
  const orderedTarget = toOrderedKeypoints(normalizedTarget);
  const cosineValue = cosineSimilarity(
    keypointsToVector(orderedUser, minConfidence),
    keypointsToVector(orderedTarget, minConfidence)
  );
  const cosineScore = clamp(((cosineValue + 1) / 2) * 100, 0, 100);

  const { normalizedAngleWeight, normalizedSimilarityWeight } = resolveWeights(
    angleWeight,
    similarityWeight
  );

  const overallScore = clamp(
    angleScore * normalizedAngleWeight + cosineScore * normalizedSimilarityWeight,
    0,
    100
  );

  const userMap = toKeypointMap(normalizedUser);
  const targetMap = toKeypointMap(normalizedTarget);
  const positionDifferences = KEYPOINT_NAMES.flatMap((name) => {
    const userPoint = userMap.get(name);
    const targetPoint = targetMap.get(name);

    if (
      !userPoint ||
      !targetPoint ||
      userPoint.score < minConfidence ||
      targetPoint.score < minConfidence
    ) {
      return [];
    }

    return [
      {
        keypoint: name,
        distance: distance(userPoint, targetPoint),
      },
    ];
  });

  return {
    overallScore,
    bodyPartScores,
    jointAngles,
    positionDifferences,
  };
}
