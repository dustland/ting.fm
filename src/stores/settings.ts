import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Host {
  gender: 'male' | 'female'
  personality: string
}

export interface PodcastSettings {
  duration: number
  style: 'conversational'
  hosts: {
    host1: Host
    host2: Host
  }
}

interface SettingsState {
  podcastSettings: PodcastSettings
  updatePodcastSettings: (settings: Partial<PodcastSettings>) => void
  resetPodcastSettings: () => void
}

const defaultPodcastSettings: PodcastSettings = {
  duration: 15,
  style: 'conversational',
  hosts: {
    host1: {
      gender: 'male',
      personality: '专业、富有见识'
    },
    host2: {
      gender: 'female',
      personality: '活泼、亲和力强'
    }
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      podcastSettings: defaultPodcastSettings,
      updatePodcastSettings: (settings) =>
        set((state) => ({
          podcastSettings: {
            ...state.podcastSettings,
            ...settings,
            hosts: {
              ...state.podcastSettings.hosts,
              ...(settings.hosts || {})
            }
          }
        })),
      resetPodcastSettings: () =>
        set({ podcastSettings: defaultPodcastSettings })
    }),
    {
      name: 'podcast-settings'
    }
  )
)
