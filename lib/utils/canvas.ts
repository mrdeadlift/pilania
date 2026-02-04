import type { Keypoint } from "@/types";
import { SKELETON_CONNECTIONS } from "@/types";

export interface DrawingConfig {
  keypointRadius: number;
  keypointColor: string;
  connectionColor: string;
  connectionWidth: number;
  minConfidence: number;
}

export const DEFAULT_DRAWING_CONFIG: DrawingConfig = {
  keypointRadius: 4,
  keypointColor: "#00FF00",
  connectionColor: "#00FF00",
  connectionWidth: 2,
  minConfidence: 0.3,
};

/**
 * Draw keypoints as circles on a canvas context.
 */
export function drawKeypoints(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  width: number,
  height: number,
  config: Partial<DrawingConfig> = {}
): void {
  const cfg = { ...DEFAULT_DRAWING_CONFIG, ...config };

  for (const kp of keypoints) {
    if (kp.score < cfg.minConfidence) continue;

    ctx.beginPath();
    ctx.arc(
      kp.x * width,
      kp.y * height,
      cfg.keypointRadius,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = cfg.keypointColor;
    ctx.fill();
  }
}

/**
 * Draw skeleton connections as lines between keypoints.
 */
export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  width: number,
  height: number,
  config: Partial<DrawingConfig> = {}
): void {
  const cfg = { ...DEFAULT_DRAWING_CONFIG, ...config };

  for (const [i, j] of SKELETON_CONNECTIONS) {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];

    if (!kp1 || !kp2) continue;
    if (kp1.score < cfg.minConfidence || kp2.score < cfg.minConfidence)
      continue;

    ctx.beginPath();
    ctx.moveTo(kp1.x * width, kp1.y * height);
    ctx.lineTo(kp2.x * width, kp2.y * height);
    ctx.strokeStyle = cfg.connectionColor;
    ctx.lineWidth = cfg.connectionWidth;
    ctx.stroke();
  }
}

/**
 * Clear the entire canvas.
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
}
