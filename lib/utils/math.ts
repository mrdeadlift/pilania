import type { Keypoint } from "@/types";

/**
 * Calculate the angle (in degrees) formed by three keypoints.
 * Point B is the vertex of the angle.
 */
export function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * (180 / Math.PI));
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/**
 * Cosine similarity between two vectors.
 * Returns value between -1 and 1 (1 = identical).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length);
  if (length === 0) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  if (magnitude === 0) return 0;

  return dot / magnitude;
}

/**
 * Normalize keypoints relative to hip-shoulder midpoint
 * to remove position/scale dependence.
 */
export function normalizeKeypoints(keypoints: Keypoint[]): Keypoint[] {
  const kpMap = new Map(keypoints.map((kp) => [kp.name, kp]));

  const leftShoulder = kpMap.get("left_shoulder");
  const rightShoulder = kpMap.get("right_shoulder");
  const leftHip = kpMap.get("left_hip");
  const rightHip = kpMap.get("right_hip");

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return keypoints;
  }

  // Center: midpoint of shoulders and hips
  const centerX =
    (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4;
  const centerY =
    (leftShoulder.y + rightShoulder.y + leftHip.y + rightHip.y) / 4;

  // Scale: distance between shoulder midpoint and hip midpoint (torso height)
  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
  const hipMidX = (leftHip.x + rightHip.x) / 2;
  const hipMidY = (leftHip.y + rightHip.y) / 2;
  const scale = distance(
    { x: shoulderMidX, y: shoulderMidY },
    { x: hipMidX, y: hipMidY }
  );

  if (scale === 0) return keypoints;

  return keypoints.map((kp) => ({
    ...kp,
    x: (kp.x - centerX) / scale,
    y: (kp.y - centerY) / scale,
  }));
}

/**
 * Convert keypoints to a flat vector [x1, y1, x2, y2, ...].
 * Filters by minimum confidence score.
 */
export function keypointsToVector(
  keypoints: Keypoint[],
  minConfidence: number = 0.3
): number[] {
  const vector: number[] = [];
  for (const kp of keypoints) {
    if (kp.score >= minConfidence) {
      vector.push(kp.x, kp.y);
    } else {
      vector.push(0, 0);
    }
  }
  return vector;
}

/**
 * Euclidean distance between two points.
 */
export function distance(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
