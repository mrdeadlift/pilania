"use client";

import { useCamera } from "@/hooks/useCamera";
import { useSettingsStore } from "@/stores/settingsStore";

interface CameraViewProps {
  className?: string;
}

export function CameraView({ className }: CameraViewProps) {
  const { videoRef, isLoading, error } = useCamera();
  const cameraFacing = useSettingsStore((state) => state.cameraFacing);
  const isFrontCamera = cameraFacing === "user";

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-900 text-white ${className}`}
      >
        <div className="text-center p-4">
          <p className="font-semibold text-red-400 mb-2">カメラエラー</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-900 text-white ${className}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2" />
          <p className="text-sm">カメラを起動中...</p>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={className}
      style={{
        transform: isFrontCamera ? "scaleX(-1)" : "none",
      }}
    />
  );
}
