import { useCallback } from "react";
import { nanoid } from "nanoid";
import { usePodStore, type Pod } from "@/store/pod";

export function usePods(podId?: string) {
  const { pods, addPod, updatePod, deletePod, getPod } = usePodStore();

  const createPod = useCallback(
    (title: string, source: string) => {
      const newPod: Pod = {
        id: nanoid(10),
        url: "",
        title,
        source,
        createdAt: new Date().toISOString(),
        status: "draft",
      };
      addPod(newPod);
      return newPod.id;
    },
    [addPod]
  );

  const saveSource = useCallback(
    (id: string, source: string) => {
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

        const dialogue = pod.dialogue || [];
        const entryIndex = dialogue.findIndex((m) => m.id === dialogueId);
        const updatedDialogue =
          entryIndex >= 0
            ? dialogue.map((m, i) =>
                i === entryIndex
                  ? { ...m, content, host, createdAt: new Date().toISOString() }
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

        updatePod(id, { dialogue: updatedDialogue });
      },
      [getPod, updatePod]
    ),

    deleteDialogue: useCallback(
      (id: string, dialogueId: string) => {
        const pod = getPod(id);
        if (!pod) return;

        const dialogue = pod.dialogue || [];
        updatePod(id, {
          dialogue: dialogue.filter((m) => m.id !== dialogueId),
        });
      },
      [getPod, updatePod]
    ),
  };
}
