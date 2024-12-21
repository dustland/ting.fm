import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Pod {
  id: string;
  title: string;
  url: string;
  source?: string;
  topics?: string[];
  dialogue?: Array<{
    id: string;
    content: string;
    createdAt: string;
    host: string;
  }>;
  createdAt: string;
  updatedAt?: string;
  status: "draft" | "ready" | "published";
}

interface PodsState {
  pods: Record<string, Pod>;
  addPod: (pod: Pod) => void;
  updatePod: (id: string, updates: Partial<Pod>) => void;
  deletePod: (id: string) => void;
  getPod: (id: string) => Pod | undefined;
  updateTopics: (id: string, topics: string[]) => void;
  updateDialogue: (
    id: string,
    dialogueId: string,
    content: string,
    host: string
  ) => void;
  deleteDialogue: (id: string, dialogueId: string) => void;
}

export const usePodsStore = create<PodsState>()(
  persist(
    (set, get) => ({
      pods: {},
      addPod: (pod) =>
        set((state) => ({
          pods: { ...state.pods, [pod.id]: pod },
        })),
      updatePod: (id, updates) =>
        set((state) => ({
          pods: {
            ...state.pods,
            [id]: {
              ...state.pods[id],
              ...updates,
              updatedAt: new Date().toISOString(),
            },
          },
        })),
      deletePod: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.pods;
          return { pods: rest };
        }),
      getPod: (id) => get().pods[id],
      updateTopics: (id, topics) =>
        set((state) => ({
          pods: {
            ...state.pods,
            [id]: {
              ...state.pods[id],
              topics,
              updatedAt: new Date().toISOString(),
            },
          },
        })),
      updateDialogue: (id, dialogueId, content, host) =>
        set((state) => {
          const pod = state.pods[id];
          const dialogue = pod.dialogue || [];
          const entryIndex = dialogue.findIndex((m) => m.id === dialogueId);
          const updatedDialogue =
            entryIndex >= 0
              ? dialogue.map((m, i) =>
                  i === entryIndex
                    ? {
                        ...m,
                        content,
                        host,
                        createdAt: new Date().toISOString(),
                      }
                    : m
                )
              : [
                  ...dialogue,
                  {
                    id: dialogueId,
                    content,
                    host,
                    createdAt: new Date().toISOString(),
                  },
                ];

          return {
            pods: {
              ...state.pods,
              [id]: {
                ...pod,
                dialogue: updatedDialogue,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),
      deleteDialogue: (id, dialogueId) =>
        set((state) => {
          const pod = state.pods[id];
          const dialogue = pod.dialogue || [];
          return {
            pods: {
              ...state.pods,
              [id]: {
                ...pod,
                dialogue: dialogue.filter((m) => m.id !== dialogueId),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),
    }),
    {
      name: "pods-storage",
    }
  )
);
