import { useEffect, useRef, useState, type RefObject } from "react";
import { initDetector, detectPose, disposeDetector } from "@/lib/pose/detector";
import type { Keypoint } from "@/types";
import { useExerciseStore } from "@/stores/exerciseStore";

export function usePoseDetection(
  videoRef: RefObject<HTMLVideoElement | null>
) {
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [fps, setFps] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const animationFrameId = useRef<number | null>(null);
  const lastDetectionTime = useRef<number>(0);
  const detectionCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);
  const isDetectingRef = useRef(false);

  const setIsDetecting = useExerciseStore((state) => state.setIsDetecting);

  const detectionLoop = async (now: number): Promise<void> => {
    if (!isDetectingRef.current) return;

    // ~30fps throttle (33ms)
    if (now - lastDetectionTime.current < 33) {
      animationFrameId.current = requestAnimationFrame((timestamp) => {
        void detectionLoop(timestamp);
      });
      return;
    }

    const video = videoRef.current;
    if (video && video.readyState >= 2) {
      try {
        const detected = await detectPose(video);
        setKeypoints(detected);
        lastDetectionTime.current = now;

        // FPS calculation
        detectionCountRef.current++;
        if (lastFpsUpdateRef.current === 0) {
          lastFpsUpdateRef.current = now;
        }

        if (now - lastFpsUpdateRef.current >= 1000) {
          setFps(detectionCountRef.current);
          detectionCountRef.current = 0;
          lastFpsUpdateRef.current = now;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Pose detection failed";
        setError(errorMessage);
        console.error("Detection loop error:", err);
      }
    }

    animationFrameId.current = requestAnimationFrame((timestamp) => {
      void detectionLoop(timestamp);
    });
  };

  const startDetection = async () => {
    if (isDetectingRef.current) return;

    setIsModelLoading(true);
    setError(null);
    setIsDetecting(true);

    try {
      await initDetector();
      isDetectingRef.current = true;
      lastFpsUpdateRef.current = 0;
      detectionCountRef.current = 0;
      setIsModelLoading(false);
      animationFrameId.current = requestAnimationFrame((timestamp) => {
        void detectionLoop(timestamp);
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Model initialization failed";
      setError(errorMessage);
      setIsModelLoading(false);
      setIsDetecting(false);
      console.error("Start detection error:", err);
    }
  };

  const stopDetection = async () => {
    isDetectingRef.current = false;
    setIsDetecting(false);

    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    try {
      await disposeDetector();
    } catch (err) {
      console.error("Stop detection error:", err);
    }

    setKeypoints([]);
    setFps(0);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      isDetectingRef.current = false;
      setIsDetecting(false);

      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }

      void disposeDetector();
    };
  }, [setIsDetecting]);

  return {
    keypoints,
    isModelLoading,
    fps,
    error,
    startDetection,
    stopDetection,
  };
}
