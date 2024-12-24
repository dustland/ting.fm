import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Pod {
  id: string;
  title: string;
  audioUrl?: string;
  status?: string;
  summary?: string;
}

interface PlayerState {
  currentPod: Pod | null;
  isPlaying: boolean;
  isVisible: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setCurrentPod: (pod: Pod | null) => void;
  show: () => void;
  hide: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      currentPod: null,
      isPlaying: false,
      isVisible: false,
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setCurrentPod: (pod) => set({ currentPod: pod, isVisible: true }),
      show: () => set({ isVisible: true }),
      hide: () => set({ isVisible: false }),
    }),
    {
      name: "player-storage",
    }
  )
);
