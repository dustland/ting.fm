import { useCallback, useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { Dialogue, type Pod, type PodSource, usePodStore } from "@/store/pod";

const API_ENDPOINT = "/api/pods";

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch pods");
  return res.json();
};

// Hook for managing a single pod
export function usePod(podId: string) {
  const {
    pods,
    updatePod: handleUpdatePod,
    updateSource: handleUpdateSource,
    deletePod: handleDeletePod,
    publishPod: handlePublishPod,
  } = usePods();
  const pod = pods[podId];

  const [status, setStatus] = useState<{
    isLoading: boolean;
    operation: "delete" | "update" | "publish" | null;
  }>({
    isLoading: false,
    operation: null,
  });

  const startOperation = useCallback((op: typeof status.operation) => {
    setStatus({ isLoading: true, operation: op });
  }, []);

  const endOperation = useCallback(() => {
    setStatus({ isLoading: false, operation: null });
  }, []);

  const wrappedDeletePod = useCallback(async () => {
    try {
      startOperation("delete");
      await handleDeletePod(podId);
    } finally {
      endOperation();
    }
  }, [handleDeletePod, podId, startOperation, endOperation]);

  const wrappedUpdatePod = useCallback(
    async (data: Pod) => {
      try {
        startOperation("update");
        await handleUpdatePod(podId, data);
      } finally {
        endOperation();
      }
    },
    [handleUpdatePod, podId, startOperation, endOperation]
  );

  const wrappedPublishPod = useCallback(async () => {
    try {
      startOperation("publish");
      await handlePublishPod(podId);
    } finally {
      endOperation();
    }
  }, [handlePublishPod, podId, startOperation, endOperation]);

  const wrappedUpdateSource = useCallback(
    async (data: PodSource) => {
      try {
        startOperation("update");
        await handleUpdateSource(podId, data);
      } finally {
        endOperation();
      }
    },
    [handleUpdateSource, podId, startOperation, endOperation]
  );

  const handleUpdateDialogue = useCallback(
    async (dialogue: Dialogue) => {
      await wrappedUpdatePod({
        ...pod,
        dialogues: pod.dialogues.map((d) =>
          d.id === dialogue.id ? dialogue : d
        ),
      });
    },
    [pod, wrappedUpdatePod]
  );

  const handleUpdateDialogues = useCallback(
    async (dialogues: Dialogue[]) => {
      await wrappedUpdatePod({
        ...pod,
        dialogues,
      });
    },
    [pod, wrappedUpdatePod]
  );

  return {
    pod,
    isLoading: status.isLoading,
    isDeleting: status.isLoading && status.operation === "delete",
    isPublishing: status.isLoading && status.operation === "publish",
    isUpdating: status.isLoading && status.operation === "update",
    updatePod: wrappedUpdatePod,
    updateDialogue: handleUpdateDialogue,
    updateSource: wrappedUpdateSource,
    deletePod: wrappedDeletePod,
    publishPod: wrappedPublishPod,
    updateDialogues: handleUpdateDialogues,
  };
}

// Hook for managing all pods
export function usePods() {
  const { pods, setPods, addPod, updatePod, deletePod } = usePodStore();
  const {
    data: remotePods,
    error,
    isLoading: isLoadingRemote,
  } = useSWR(API_ENDPOINT, fetcher);

  useEffect(() => {
    if (remotePods && Array.isArray(remotePods)) {
      setPods(remotePods);
    }
  }, [remotePods, setPods]);

  const handleCreatePod = useCallback(
    async (title: string, source?: PodSource) => {
      try {
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, source }),
        });

        if (!response.ok) throw new Error("Failed to create pod");

        const pod = await response.json();
        addPod(pod);
        mutate(API_ENDPOINT);
        return pod;
      } catch (error) {
        console.error("[CREATE_POD_ERROR]", error);
        throw error;
      }
    },
    [addPod]
  );

  const handleUpdatePod = useCallback(
    async (podId: string, updates: Partial<Pod>) => {
      try {
        const response = await fetch(`${API_ENDPOINT}/${podId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error("Failed to update pod");

        const updatedPod = await response.json();
        updatePod(updatedPod.id, updatedPod);
        mutate(API_ENDPOINT);
        return updatedPod;
      } catch (error) {
        console.error("[UPDATE_POD_ERROR]", error);
        throw error;
      }
    },
    [addPod]
  );

  const handleUpdateSource = useCallback(
    async (podId: string, source: PodSource) => {
      try {
        const response = await fetch(`${API_ENDPOINT}/${podId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source, status: "draft" }),
        });

        if (!response.ok) throw new Error("Failed to update pod source");

        const updatedPod = await response.json();
        addPod({
          ...updatedPod,
          source,
          status: "draft",
          updatedAt: updatedPod.updatedAt,
        });
        mutate(API_ENDPOINT);
      } catch (error) {
        console.error("[SAVE_SOURCE_ERROR]", error);
        throw error;
      }
    },
    [addPod]
  );

  const handleDeletePod = useCallback(
    async (podId: string) => {
      try {
        const response = await fetch(`${API_ENDPOINT}/${podId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to delete pod");

        deletePod(podId);
        mutate(API_ENDPOINT);
      } catch (error) {
        console.error("[DELETE_POD_ERROR]", error);
        throw error;
      }
    },
    [deletePod]
  );

  const handlePublishPod = useCallback(
    async (podId: string) => {
      try {
        const response = await fetch(`${API_ENDPOINT}/${podId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "published" }),
        });

        if (!response.ok) throw new Error("Failed to publish pod");

        const updatedPod = await response.json();
        addPod({
          ...updatedPod,
          status: "published",
          updatedAt: updatedPod.updatedAt,
        });
        mutate(API_ENDPOINT);
      } catch (error) {
        console.error("[PUBLISH_POD_ERROR]", error);
        throw error;
      }
    },
    [addPod]
  );

  const handleUpdateDialogues = useCallback(
    async (podId: string, dialogues: Dialogue[]) => {
      await handleUpdatePod(podId, {
        dialogues,
        updatedAt: new Date().toISOString(),
      });
    },
    [handleUpdatePod]
  );

  return {
    pods: pods,
    error,
    isLoading: isLoadingRemote,
    createPod: handleCreatePod,
    updatePod: handleUpdatePod,
    updateSource: handleUpdateSource,
    deletePod: handleDeletePod,
    publishPod: handlePublishPod,
    updateDialogues: handleUpdateDialogues,
  };
}
