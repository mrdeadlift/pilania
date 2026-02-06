import { create } from "zustand";

interface SettingsState {
  cameraFacing: "user" | "environment";
  showSkeleton: boolean;
  language: "ja" | "en";
  toggleCameraFacing: () => void;
  toggleSkeleton: () => void;
  setLanguage: (lang: "ja" | "en") => void;
  reset: () => void;
}

const initialState = {
  cameraFacing: "user" as const,
  showSkeleton: true,
  language: "ja" as const,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  ...initialState,
  toggleCameraFacing: () =>
    set((state) => ({
      cameraFacing: state.cameraFacing === "user" ? "environment" : "user",
    })),
  toggleSkeleton: () => set((state) => ({ showSkeleton: !state.showSkeleton })),
  setLanguage: (lang) => set({ language: lang }),
  reset: () => set(initialState),
}));
