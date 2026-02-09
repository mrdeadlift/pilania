"use client";

import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/settingsStore";

interface CameraControlsProps {
  onPause?: () => void;
  onResume?: () => void;
}

export function CameraControls({ onPause, onResume }: CameraControlsProps) {
  const { cameraFacing, toggleCameraFacing } = useSettingsStore((state) => ({
    cameraFacing: state.cameraFacing,
    toggleCameraFacing: state.toggleCameraFacing,
  }));

  return (
    <div className="flex gap-2 items-center justify-center">
      <Button onClick={toggleCameraFacing} variant="outline" size="default">
        {cameraFacing === "user" ? "背面カメラに切替" : "前面カメラに切替"}
      </Button>
      {onPause && (
        <Button onClick={onPause} variant="secondary" size="default">
          一時停止
        </Button>
      )}
      {onResume && (
        <Button onClick={onResume} variant="default" size="default">
          再開
        </Button>
      )}
    </div>
  );
}
