"use client";

import dynamic from "next/dynamic";
import type { RefObject } from "react";
import type { Keypoint } from "@/types";

interface PoseDetectorProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  onKeypointsDetected?: (keypoints: Keypoint[]) => void;
}

// SSR exclude wrapper for TensorFlow.js
const PoseDetectorInner = dynamic(() => import("./PoseDetectorInner"), {
  ssr: false,
  loading: () => (
    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 dark:border-gray-600" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          ポーズ検出を準備中...
        </p>
      </div>
    </div>
  ),
});

export default function PoseDetector(props: PoseDetectorProps) {
  return <PoseDetectorInner {...props} />;
}
