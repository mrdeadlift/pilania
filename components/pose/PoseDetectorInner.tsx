"use client";

import { useEffect, type RefObject } from "react";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { Button } from "@/components/ui/button";
import type { Keypoint } from "@/types";

interface PoseDetectorInnerProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  onKeypointsDetected?: (keypoints: Keypoint[]) => void;
}

export default function PoseDetectorInner({
  videoRef,
  onKeypointsDetected,
}: PoseDetectorInnerProps) {
  const {
    keypoints,
    isModelLoading,
    fps,
    error,
    startDetection,
    stopDetection,
  } = usePoseDetection(videoRef);

  // Notify parent when keypoints update
  useEffect(() => {
    if (onKeypointsDetected && keypoints.length > 0) {
      onKeypointsDetected(keypoints);
    }
  }, [keypoints, onKeypointsDetected]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
          ポーズ検出エラー
        </p>
        <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
        <Button
          onClick={startDetection}
          variant="outline"
          size="sm"
          className="mt-3"
        >
          再試行
        </Button>
      </div>
    );
  }

  if (isModelLoading) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400" />
          <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
            モデル読み込み中...
          </p>
        </div>
      </div>
    );
  }

  const isDetecting = fps > 0 || keypoints.length > 0;

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {isDetecting && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  検出中
                </span>
              </div>
              <div className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-xs font-mono text-gray-700 dark:text-gray-300">
                {fps} FPS
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {keypoints.length} keypoints
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {!isDetecting ? (
          <Button
            onClick={startDetection}
            variant="default"
            size="default"
            disabled={isModelLoading}
          >
            ポーズ検出開始
          </Button>
        ) : (
          <Button onClick={stopDetection} variant="destructive" size="default">
            ポーズ検出停止
          </Button>
        )}
      </div>
    </div>
  );
}
