import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

export type PodOperation = "create" | "update" | "delete" | "publish" | "updateSource";

export interface PodOperationStatus {
  operation: PodOperation | null;
  isLoading: boolean;
}

export interface Dialogue {
  id: string;
  host: string;
  content: string;
  audioUrl?: string;
}

export interface SourceMetadata {
  title: string;
  description?: string;
  wordCount?: number;
  image?: string;
  url?: string;
  siteName?: string;
  favicon?: string;
  readingTime?: number;
  authors?: string[];
  createdAt?: string;
  updatedAt?: string;
  link?: string;
  pdfLink?: string;
  doi?: string;
  journal?: string;
  categories?: string[];
  summary?: string;
  // File-related metadata
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

export interface PodSource {
  type: "url" | "file" | "text" | "paper";
  content: string;
  metadata: SourceMetadata;
  file?: {
    name: string;
    type: string;
    size: number;
    lastModified?: number;
  };
}

export interface Pod {
  id: string;
  title: string;
  source?: PodSource;
  dialogues: Dialogue[];
  audioUrl?: string;
  createdAt: string;
  updatedAt?: string;
  status: "draft" | "ready" | "published";
}

interface PodState {
  pods: Record<string, Pod>;
  operationStatus: Record<string, PodOperationStatus>;
  setPods: (pods: Pod[]) => void;
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
  startOperation: (podId: string, operation: PodOperation) => void;
  endOperation: (podId: string) => void;
  getOperationStatus: (podId: string) => PodOperationStatus;
  publishPod: (id: string, published: boolean) => Promise<void>;
}

const DEFAULT_STATUS: PodOperationStatus = {
  operation: null,
  isLoading: false,
};

export const usePodStore = create<PodState>()(
  persist(
    (set, get) => ({
      pods: {},
      operationStatus: {},

      setPods: (pods) =>
        set(() => ({
          pods: pods.reduce((acc, pod) => ({ ...acc, [pod.id]: pod }), {}),
        })),

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
          const newPods = { ...state.pods };
          delete newPods[id];
          return { pods: newPods };
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

      startOperation: (podId, operation) =>
        set((state) => ({
          operationStatus: {
            ...state.operationStatus,
            [podId]: {
              operation,
              isLoading: true,
            },
          },
        })),

      endOperation: (podId) =>
        set((state) => {
          const { [podId]: _, ...rest } = state.operationStatus;
          return { operationStatus: rest };
        }),

      getOperationStatus: (podId) => get().operationStatus[podId] || DEFAULT_STATUS,

      publishPod: async (id, published) => {
        try {
          const response = await fetch(`/api/pods/${id}/publish`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ published }),
          });

          if (!response.ok) {
            throw new Error("Failed to publish pod");
          }

          const updatedPod = await response.json();
          set((state) => ({
            pods: {
              ...state.pods,
              [id]: { ...state.pods[id], ...updatedPod },
            },
          }));
        } catch (error) {
          console.error("[PUBLISH_POD]", error);
          throw error;
        }
      },
    }),
    {
      name: "tingfm-pods-storage",
      partialize: (state) => ({ pods: state.pods }), // Only persist pods, not operation status
    }
  )
);
