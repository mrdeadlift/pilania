"use client";

import { useEffect, useMemo, useRef } from "react";
import { clearCanvas, drawKeypoints, drawSkeleton } from "@/lib/utils/canvas";
import type { PoseFrame } from "@/types";

interface ReferencePosePlayerProps {
  referencePoses: PoseFrame[];
  className?: string;
  isPlaying?: boolean;
  loop?: boolean;
  mirrored?: boolean;
  minConfidence?: number;
}

function syncCanvasSize(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  return { width, height };
}

function findFrameIndexByTime(frames: PoseFrame[], currentTimestamp: number) {
  for (let i = frames.length - 1; i >= 0; i--) {
    if (currentTimestamp >= frames[i].timestamp) {
      return i;
    }
  }

  return 0;
}

export function ReferencePosePlayer({
  referencePoses,
  className,
  isPlaying = true,
  loop = true,
  mirrored = false,
  minConfidence = 0.3,
}: ReferencePosePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sortedPoses = useMemo(
    () => [...referencePoses].sort((a, b) => a.timestamp - b.timestamp),
    [referencePoses]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawFrame = (frameIndex: number) => {
      const { width, height } = syncCanvasSize(canvas);
      clearCanvas(ctx, width, height);

      const frame = sortedPoses[frameIndex];
      if (!frame?.keypoints?.length) return;

      const drawingConfig = {
        minConfidence,
        keypointColor: "#FFD166",
        connectionColor: "#F4A300",
        keypointRadius: 4,
        connectionWidth: 2,
      };

      drawSkeleton(ctx, frame.keypoints, width, height, drawingConfig);
      drawKeypoints(ctx, frame.keypoints, width, height, drawingConfig);
    };

    if (!sortedPoses.length) {
      const { width, height } = syncCanvasSize(canvas);
      clearCanvas(ctx, width, height);
      return;
    }

    if (!isPlaying || sortedPoses.length === 1) {
      drawFrame(0);
      return;
    }

    const firstTimestamp = sortedPoses[0].timestamp;
    const lastTimestamp = sortedPoses[sortedPoses.length - 1].timestamp;
    const duration = Math.max(1, lastTimestamp - firstTimestamp);
    const startedAt = performance.now();
    let rafId = 0;

    const updateFrame = (now: number) => {
      const elapsed = now - startedAt;
      const normalizedElapsed = loop ? elapsed % duration : Math.min(elapsed, duration);
      const currentTimestamp = firstTimestamp + normalizedElapsed;
      drawFrame(findFrameIndexByTime(sortedPoses, currentTimestamp));

      if (loop || elapsed < duration) {
        rafId = requestAnimationFrame(updateFrame);
      }
    };

    rafId = requestAnimationFrame(updateFrame);

    return () => cancelAnimationFrame(rafId);
  }, [sortedPoses, isPlaying, loop, minConfidence]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
      style={{ transform: mirrored ? "scaleX(-1)" : "none" }}
      aria-hidden="true"
    />
  );
}
