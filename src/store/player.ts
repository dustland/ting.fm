import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerState {
  isPlaying: boolean;
  currentPod: {
    id: string;
    title: string;
    audioUrl: string;
  } | null;
  setCurrentPod: (pod: { id: string; title: string; audioUrl: string } | null) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      isPlaying: false,
      currentPod: null,
      setCurrentPod: (pod) => set({ currentPod: pod, isPlaying: !!pod }),
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
    }),
    {
      name: "tingfm-player",
    }
  )
);
