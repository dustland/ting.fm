import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Pod {
  id: string;
  title: string;
  url: string;
  source?: string;
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

interface PodState {
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

export const usePodStore = create<PodState>()(
  persist(
    (set, get) => ({
      pods: {},
      addPod: (pod) =>
        set((state) => ({
          pods: { ...state.pods, [pod.id]: pod },
        })),
      updatePod: (id, updates) =>
        set((state) => {
          const pod = state.pods[id];
          if (!pod) return state;
          return {
            pods: {
              ...state.pods,
              [id]: { ...pod, ...updates, updatedAt: new Date().toISOString() },
            },
          };
        }),
      deletePod: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.pods;
          return { pods: rest };
        }),
      getPod: (id) => get().pods[id],
      updateTopics: (id, topics) =>
        set((state) => {
          const pod = state.pods[id];
          if (!pod) return state;
          return {
            pods: {
              ...state.pods,
              [id]: {
                ...pod,
                topics,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),
      updateDialogue: (id, dialogueId, content, host) =>
        set((state) => {
          const pod = state.pods[id];
          if (!pod) return state;

          const dialogue = pod.dialogue || [];
          const existingDialogueIndex = dialogue.findIndex(
            (d) => d.id === dialogueId
          );

          let newDialogue;
          if (existingDialogueIndex >= 0) {
            // Update existing dialogue
            newDialogue = [...dialogue];
            newDialogue[existingDialogueIndex] = {
              ...newDialogue[existingDialogueIndex],
              content,
              host,
            };
          } else {
            // Add new dialogue
            newDialogue = [
              ...dialogue,
              {
                id: dialogueId,
                content,
                host,
                createdAt: new Date().toISOString(),
              },
            ];
          }

          return {
            pods: {
              ...state.pods,
              [id]: {
                ...pod,
                dialogue: newDialogue,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),
      deleteDialogue: (id, dialogueId) =>
        set((state) => {
          const pod = state.pods[id];
          if (!pod || !pod.dialogue) return state;

          return {
            pods: {
              ...state.pods,
              [id]: {
                ...pod,
                dialogue: pod.dialogue.filter((d) => d.id !== dialogueId),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),
    }),
    {
      name: "tingfm-pods-storage",
    }
  )
);
