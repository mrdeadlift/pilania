import type { Keypoint } from "@/types";

// Singleton detector instance
let detector: any = null;

/**
 * Initialize MoveNet SINGLEPOSE_THUNDER detector
 * - Dynamic import of TensorFlow.js and pose-detection
 * - WebGL backend preferred, fallback to WASM
 * - Singleton: returns existing instance if already initialized
 */
export async function initDetector(): Promise<void> {
  if (detector) {
    return; // Already initialized
  }

  try {
    // Dynamic import TensorFlow.js
    const tf = await import("@tensorflow/tfjs");

    // Try WebGL backend first
    try {
      await tf.setBackend("webgl");
      await tf.ready();
      console.log("TF.js backend: WebGL");
    } catch (webglError) {
      console.warn("WebGL backend failed, falling back to WASM:", webglError);
      await tf.setBackend("wasm");
      await tf.ready();
      console.log("TF.js backend: WASM");
    }

    // Dynamic import pose-detection
    const poseDetection = await import("@tensorflow-models/pose-detection");

    // Create MoveNet detector (SINGLEPOSE_THUNDER)
    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
      }
    );

    console.log("MoveNet detector initialized");
  } catch (error) {
    console.error("Failed to initialize detector:", error);
    throw new Error(
      `Detector initialization failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Detect pose from video element
 * - Auto-initialize detector if not ready
 * - Returns normalized keypoints (x, y: 0-1)
 */
export async function detectPose(
  video: HTMLVideoElement
): Promise<Keypoint[]> {
  try {
    // Auto-initialize if needed
    if (!detector) {
      await initDetector();
    }

    // Estimate poses
    const poses = await detector.estimatePoses(video);

    // Convert to our Keypoint format (normalize coordinates)
    if (poses.length === 0 || !poses[0]?.keypoints) {
      return [];
    }

    const keypoints: Keypoint[] = poses[0].keypoints.map((kp: any) => ({
      name: kp.name || "",
      x: kp.x / video.videoWidth, // Normalize to 0-1
      y: kp.y / video.videoHeight, // Normalize to 0-1
      score: kp.score ?? 0,
    }));

    return keypoints;
  } catch (error) {
    console.error("Pose detection error:", error);
    return [];
  }
}

/**
 * Dispose detector and free resources
 */
export async function disposeDetector(): Promise<void> {
  if (detector) {
    try {
      await detector.dispose();
      detector = null;
      console.log("Detector disposed");
    } catch (error) {
      console.error("Failed to dispose detector:", error);
    }
  }
}
