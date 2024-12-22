import { useCallback } from "react";
import useSWR, { mutate } from "swr";
import { type Pod, type PodSource, usePodStore } from "@/store/pod";

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
    updatePod,
    deletePod: deleteLocalPod,
    startOperation,
    endOperation,
    getOperationStatus,
  } = usePodStore();
  const pod = pods[podId];
  const status = getOperationStatus(podId);

  const handleUpdatePod = useCallback(
    async (updates: Partial<Pod>) => {
      try {
        startOperation(podId, "update");
        const response = await fetch(`${API_ENDPOINT}/${podId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error("Failed to update pod");

        const updatedPod = await response.json();
        updatePod(podId, updatedPod);
        mutate(API_ENDPOINT);
        return updatedPod;
      } catch (error) {
        console.error("[UPDATE_POD_ERROR]", error);
        throw error;
      } finally {
        endOperation(podId);
      }
    },
    [podId, updatePod, startOperation, endOperation]
  );

  const handleDeletePod = useCallback(
    async () => {
      try {
        startOperation(podId, "delete");
        const response = await fetch(`${API_ENDPOINT}/${podId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to delete pod");

        deleteLocalPod(podId);
        mutate(API_ENDPOINT);
      } catch (error) {
        console.error("[DELETE_POD_ERROR]", error);
        throw error;
      } finally {
        endOperation(podId);
      }
    },
    [podId, deleteLocalPod, startOperation, endOperation]
  );

  const handleUpdateSource = useCallback(
    async (source: PodSource) => {
      try {
        startOperation(podId, "updateSource");
        const response = await fetch(`${API_ENDPOINT}/${podId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source, status: "draft" }),
        });

        if (!response.ok) throw new Error("Failed to update pod source");

        const updatedPod = await response.json();
        updatePod(podId, {
          source,
          status: "draft",
          updatedAt: updatedPod.updatedAt,
        });
        mutate(API_ENDPOINT);
      } catch (error) {
        console.error("[SAVE_SOURCE_ERROR]", error);
        throw error;
      } finally {
        endOperation(podId);
      }
    },
    [podId, updatePod, startOperation, endOperation]
  );

  const handlePublishPod = useCallback(
    async () => {
      try {
        startOperation(podId, "publish");
        const response = await fetch(`${API_ENDPOINT}/${podId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "published" }),
        });

        if (!response.ok) throw new Error("Failed to publish pod");

        const updatedPod = await response.json();
        updatePod(podId, {
          status: "published",
          updatedAt: updatedPod.updatedAt,
        });
        mutate(API_ENDPOINT);
      } catch (error) {
        console.error("[PUBLISH_POD_ERROR]", error);
        throw error;
      } finally {
        endOperation(podId);
      }
    },
    [podId, updatePod, startOperation, endOperation]
  );

  return {
    pod,
    status,
    isLoading: status.isLoading,
    currentOperation: status.operation,
    updatePod: handleUpdatePod,
    deletePod: handleDeletePod,
    updateSource: handleUpdateSource,
    publishPod: handlePublishPod,
  };
}

// Hook for managing all pods
export function usePods() {
  const { pods, addPod, startOperation, endOperation } = usePodStore();
  const { data: remotePods, error, isLoading } = useSWR(API_ENDPOINT, fetcher);

  const handleCreatePod = useCallback(
    async (title: string, source: PodSource) => {
      const tempId = "temp-" + Date.now();
      try {
        startOperation(tempId, "create");
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
      } finally {
        endOperation(tempId);
      }
    },
    [addPod, startOperation, endOperation]
  );

  return {
    pods: remotePods || pods,
    error,
    isLoading,
    createPod: handleCreatePod,
  };
}
