import type { BodyPartScores, JointAngleComparison, Keypoint } from "@/types";
import { calculateAngle, clamp } from "@/lib/utils/math";

export type BodyPartKey = keyof BodyPartScores;

interface JointAngleDefinition {
  joint: string;
  a: string;
  b: string;
  c: string;
  weight: number;
  bodyParts: BodyPartKey[];
}

export const JOINT_ANGLE_DEFINITIONS: JointAngleDefinition[] = [
  {
    joint: "left_shoulder",
    a: "left_hip",
    b: "left_shoulder",
    c: "left_elbow",
    weight: 1.2,
    bodyParts: ["upperBody"],
  },
  {
    joint: "right_shoulder",
    a: "right_hip",
    b: "right_shoulder",
    c: "right_elbow",
    weight: 1.2,
    bodyParts: ["upperBody"],
  },
  {
    joint: "left_elbow",
    a: "left_shoulder",
    b: "left_elbow",
    c: "left_wrist",
    weight: 1,
    bodyParts: ["arms"],
  },
  {
    joint: "right_elbow",
    a: "right_shoulder",
    b: "right_elbow",
    c: "right_wrist",
    weight: 1,
    bodyParts: ["arms"],
  },
  {
    joint: "left_hip",
    a: "left_shoulder",
    b: "left_hip",
    c: "left_knee",
    weight: 1.4,
    bodyParts: ["core", "lowerBody"],
  },
  {
    joint: "right_hip",
    a: "right_shoulder",
    b: "right_hip",
    c: "right_knee",
    weight: 1.4,
    bodyParts: ["core", "lowerBody"],
  },
  {
    joint: "left_knee",
    a: "left_hip",
    b: "left_knee",
    c: "left_ankle",
    weight: 1.1,
    bodyParts: ["legs", "lowerBody"],
  },
  {
    joint: "right_knee",
    a: "right_hip",
    b: "right_knee",
    c: "right_ankle",
    weight: 1.1,
    bodyParts: ["legs", "lowerBody"],
  },
];

function toKeypointMap(keypoints: Keypoint[]) {
  return new Map(keypoints.map((keypoint) => [keypoint.name, keypoint]));
}

function hasMinimumConfidence(
  keypoint: Keypoint | undefined,
  minConfidence: number
) {
  return Boolean(keypoint && keypoint.score >= minConfidence);
}

export function computeJointAngles(
  userKeypoints: Keypoint[],
  targetKeypoints: Keypoint[],
  minConfidence = 0.3
): JointAngleComparison[] {
  const userMap = toKeypointMap(userKeypoints);
  const targetMap = toKeypointMap(targetKeypoints);
  const comparisons: JointAngleComparison[] = [];

  for (const definition of JOINT_ANGLE_DEFINITIONS) {
    const userA = userMap.get(definition.a);
    const userB = userMap.get(definition.b);
    const userC = userMap.get(definition.c);

    const targetA = targetMap.get(definition.a);
    const targetB = targetMap.get(definition.b);
    const targetC = targetMap.get(definition.c);

    const hasUserConfidence =
      hasMinimumConfidence(userA, minConfidence) &&
      hasMinimumConfidence(userB, minConfidence) &&
      hasMinimumConfidence(userC, minConfidence);

    const hasTargetConfidence =
      hasMinimumConfidence(targetA, minConfidence) &&
      hasMinimumConfidence(targetB, minConfidence) &&
      hasMinimumConfidence(targetC, minConfidence);

    if (!hasUserConfidence || !hasTargetConfidence) {
      continue;
    }

    const userAngle = calculateAngle(userA!, userB!, userC!);
    const targetAngle = calculateAngle(targetA!, targetB!, targetC!);
    const difference = Math.abs(userAngle - targetAngle);

    comparisons.push({
      joint: definition.joint,
      userAngle,
      targetAngle,
      difference,
    });
  }

  return comparisons;
}

export function angleDifferenceToScore(difference: number): number {
  // 0deg diff = 100, 90deg+ diff = 0
  return clamp(100 - (difference / 90) * 100, 0, 100);
}
