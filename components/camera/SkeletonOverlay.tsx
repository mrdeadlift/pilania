"use client";

import { useEffect, useRef } from "react";
import { clearCanvas, drawKeypoints, drawSkeleton } from "@/lib/utils/canvas";
import { useSettingsStore } from "@/stores/settingsStore";
import type { Keypoint } from "@/types";

interface SkeletonOverlayProps {
  keypoints: Keypoint[];
  className?: string;
  minConfidence?: number;
  keypointColor?: string;
  connectionColor?: string;
  keypointRadius?: number;
  connectionWidth?: number;
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

export function SkeletonOverlay({
  keypoints,
  className,
  minConfidence = 0.3,
  keypointColor = "#00FF7F",
  connectionColor = "#00FF7F",
  keypointRadius = 4,
  connectionWidth = 2,
}: SkeletonOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const showSkeleton = useSettingsStore((state) => state.showSkeleton);
  const isFrontCamera = useSettingsStore((state) => state.cameraFacing === "user");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = syncCanvasSize(canvas);
    clearCanvas(ctx, width, height);

    if (!showSkeleton || keypoints.length === 0) return;

    const drawingConfig = {
      minConfidence,
      keypointColor,
      connectionColor,
      keypointRadius,
      connectionWidth,
    };

    drawSkeleton(ctx, keypoints, width, height, drawingConfig);
    drawKeypoints(ctx, keypoints, width, height, drawingConfig);
  }, [
    keypoints,
    showSkeleton,
    minConfidence,
    keypointColor,
    connectionColor,
    keypointRadius,
    connectionWidth,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
      style={{ transform: isFrontCamera ? "scaleX(-1)" : "none" }}
      aria-hidden="true"
    />
  );
}
