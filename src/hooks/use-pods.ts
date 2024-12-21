import { useCallback } from "react";
import { nanoid } from "nanoid";
import { Dialogue, PodSource, usePodStore, type Pod } from "@/store/pod";

export function usePods(podId?: string) {
  const { pods, addPod, updatePod, deletePod, getPod } = usePodStore();

  const createPod = useCallback(
    (title: string, source: PodSource) => {
      const id = nanoid(6);
      console.log(`[Pods] Creating new pod with id: ${id}, title: ${title}`);
      const newPod: Pod = {
        id,
        url: "",
        title,
        source,
        dialogues: [],
        createdAt: new Date().toISOString(),
        status: "draft",
      };
      addPod(newPod);
      return newPod.id;
    },
    [addPod]
  );

  const saveSource = useCallback(
    (id: string, source: PodSource) => {
      updatePod(id, {
        source,
        updatedAt: new Date().toISOString(),
      });
    },
    [updatePod]
  );

  const publishPod = useCallback(
    (id: string) => {
      updatePod(id, {
        status: "published",
        updatedAt: new Date().toISOString(),
      });
    },
    [updatePod]
  );

  return {
    // Basic CRUD operations
    pods,
    pod: podId ? getPod(podId) : undefined,
    createPod,
    updatePod,
    deletePod,

    // Specialized operations
    saveSource,
    publishPod,

    updateDialogue: useCallback(
      (id: string, dialogueId: string, content: string, host: string) => {
        const pod = getPod(id);
        if (!pod) return;

        const dialogues = pod.dialogues || [];
        const entryIndex = dialogues.findIndex((m) => m.id === dialogueId);
        const updatedDialogues: Dialogue[] =
          entryIndex >= 0
            ? dialogues.map((m, i) =>
                i === entryIndex
                  ? { ...m, content, host, createdAt: new Date().toISOString() }
                  : m
              )
            : [
                ...dialogues,
                {
                  id: dialogueId,
                  content,
                  host,
                  createdAt: new Date().toISOString(),
                },
              ];

        updatePod(id, { dialogues: updatedDialogues });
      },
      [getPod, updatePod]
    ),

    deleteDialogue: useCallback(
      (id: string, dialogueId: string) => {
        const pod = getPod(id);
        if (!pod) return;

        const dialogues = pod.dialogues || [];
        updatePod(id, {
          dialogues: dialogues.filter((m) => m.id !== dialogueId),
        });
      },
      [getPod, updatePod]
    ),
  };
}
