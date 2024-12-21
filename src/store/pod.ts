import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

export interface Dialogue {
  id: string;
  host: string;
  content: string;
  audioUrl?: string;
}

export interface PodSource {
  type: "url" | "file" | "text" | "channel";
  content: string;
  metadata?: {
    title: string;
    description?: string;
    author?: string;
    publishDate?: string;
    url?: string;
    siteName?: string;
    favicon?: string;
    image?: string;
    readingTime?: number;
    wordCount?: number;
  };
}

export interface Pod {
  id: string;
  title: string;
  url: string;
  source?: PodSource;
  dialogues: Dialogue[];
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
          if (!pod) {
            console.warn(
              "[PodStore] Attempted to update non-existent pod:",
              id
            );
            return state;
          }

          console.log("[PodStore] Updating pod:", { id, updates });
          const updatedPod = {
            ...pod,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          console.log("[PodStore] Updated pod:", updatedPod);

          return {
            pods: {
              ...state.pods,
              [id]: updatedPod,
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

          const dialogues = pod.dialogues || [];
          const existingDialogueIndex = dialogues.findIndex(
            (d) => d.id === dialogueId
          );

          let newDialogues;
          if (existingDialogueIndex >= 0) {
            newDialogues = [...dialogues];
            newDialogues[existingDialogueIndex] = {
              ...newDialogues[existingDialogueIndex],
              content,
              host,
            };
          } else {
            newDialogues = [
              ...dialogues,
              {
                id: dialogueId,
                content,
                host,
              },
            ];
          }

          return {
            pods: {
              ...state.pods,
              [id]: {
                ...pod,
                dialogues: newDialogues,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),
      deleteDialogue: (id, dialogueId) =>
        set((state) => {
          const pod = state.pods[id];
          if (!pod || !pod.dialogues) return state;

          return {
            pods: {
              ...state.pods,
              [id]: {
                ...pod,
                dialogues: pod.dialogues.filter((d) => d.id !== dialogueId),
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
