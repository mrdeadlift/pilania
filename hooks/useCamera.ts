import { useEffect, useRef, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraFacing = useSettingsStore((state) => state.cameraFacing);

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 既存のストリームがあれば停止
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      setStream(mediaStream);

      // videoRef に stream を設定
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "カメラの起動に失敗しました";
      setError(errorMessage);
      console.error("Camera error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const retryCamera = () => {
    startCamera();
  };

  useEffect(() => {
    startCamera();

    // cleanup: すべてのトラックを停止
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraFacing]); // cameraFacing が変わったら再起動

  return { videoRef, stream, isLoading, error, retryCamera };
}
