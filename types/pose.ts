/** Single keypoint detected by MoveNet */
export interface Keypoint {
  name: string;
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  z?: number; // Optional 3D (future)
  score: number; // Confidence 0-1
}

/** A single frame of pose data */
export interface PoseFrame {
  timestamp: number; // ms from exercise start
  keypoints: Keypoint[];
}

/** Result of comparing user pose to reference */
export interface ComparisonResult {
  overallScore: number; // 0-100
  bodyPartScores: BodyPartScores;
  jointAngles: JointAngleComparison[];
  positionDifferences: PositionDifference[];
}

export interface BodyPartScores {
  upperBody: number;
  core: number;
  lowerBody: number;
  arms: number;
  legs: number;
}

export interface JointAngleComparison {
  joint: string;
  userAngle: number;
  targetAngle: number;
  difference: number; // Absolute diff in degrees
}

export interface PositionDifference {
  keypoint: string;
  distance: number; // Normalized distance
}

/** MoveNet keypoint names (17 points, COCO format) */
export const KEYPOINT_NAMES = [
  "nose",
  "left_eye",
  "right_eye",
  "left_ear",
  "right_ear",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
] as const;

export type KeypointName = (typeof KEYPOINT_NAMES)[number];

/** Skeleton connection pairs for drawing (index-based) */
export const SKELETON_CONNECTIONS: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4], // Head
  [5, 6], // Shoulders
  [5, 7],
  [7, 9], // Left arm
  [6, 8],
  [8, 10], // Right arm
  [5, 11],
  [6, 12], // Torso
  [11, 12], // Hips
  [11, 13],
  [13, 15], // Left leg
  [12, 14],
  [14, 16], // Right leg
];
