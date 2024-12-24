import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PodcastHost {
  id: string;
  name: string;
  gender: "male" | "female";
  personality: string;
}

export interface PodcastSettings {
  duration: number;
  style: "conversational";
  hosts: PodcastHost[];
  outputLanguage: string;
  hostStyle: string;
  llmModel: "gpt-4o" | "gpt-4" | "gpt-3.5-turbo";
  ttsModel: "doubao" | "tongyi" | "openai" | "elevenlabs";
}

interface SettingState {
  podcastSettings: PodcastSettings;
  updatePodcastSettings: (settings: Partial<PodcastSettings>) => void;
  resetPodcastSettings: () => void;
}

const defaultPodcastSettings: PodcastSettings = {
  duration: 15,
  style: "conversational",
  outputLanguage: "zh-CN",
  hostStyle: "轻松对话",
  llmModel: "gpt-4o",
  ttsModel: "openai",
  hosts: [
    {
      id: "host1",
      name: "奥德彪",
      gender: "male",
      personality: "专业、富有见识",
    },
    {
      id: "host2",
      name: "小美",
      gender: "female",
      personality: "活泼、亲和力强",
    },
  ],
};

export const useSettingStore = create<SettingState>()(
  persist(
    (set) => ({
      podcastSettings: defaultPodcastSettings,
      updatePodcastSettings: (settings) =>
        set((state) => ({
          podcastSettings: {
            ...state.podcastSettings,
            ...settings,
          },
        })),
      resetPodcastSettings: () =>
        set({ podcastSettings: defaultPodcastSettings }),
    }),
    {
      name: "tingfm-settings-storage",
    }
  )
);
