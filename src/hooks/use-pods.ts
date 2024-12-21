import { useCallback } from "react";
import { nanoid } from "nanoid";
import { Dialogue, PodSource, usePodStore, type Pod } from "@/store/pod";
import useSWR, { mutate } from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch pods');
  return res.json();
};

export function usePods(podId?: string) {
  const { pods, addPod, updatePod, deletePod, getPod } = usePodStore();
  const { data: remotePods, error, isLoading } = useSWR('/api/pods', fetcher);

  const createPod = useCallback(
    async (title: string, source: PodSource) => {
      const id = nanoid(6);
      console.log(`[Pods] Creating new pod with id: ${id}, title: ${title}`);
      const newPod: Pod = {
        id,
        url: "",
        title,
        source,
        dialogues: [],
        status: "draft",
      };

      try {
        const response = await fetch('/api/pods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPod),
        });

        if (!response.ok) throw new Error('Failed to create pod');
        
        const savedPod = await response.json();
        addPod(savedPod);
        mutate('/api/pods');
        return savedPod.id;
      } catch (error) {
        console.error('[CREATE_POD_ERROR]', error);
        throw error;
      }
    },
    [addPod]
  );

  const saveSource = useCallback(
    async (id: string, source: PodSource) => {
      try {
        const response = await fetch('/api/pods', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, source, status: 'draft' }),
        });

        if (!response.ok) throw new Error('Failed to update pod source');

        const updatedPod = await response.json();
        updatePod(id, {
          source,
          updatedAt: updatedPod.updatedAt,
        });
        mutate('/api/pods');
      } catch (error) {
        console.error('[SAVE_SOURCE_ERROR]', error);
        throw error;
      }
    },
    [updatePod]
  );

  const publishPod = useCallback(
    async (id: string) => {
      try {
        const response = await fetch('/api/pods', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: 'published' }),
        });

        if (!response.ok) throw new Error('Failed to publish pod');

        const updatedPod = await response.json();
        updatePod(id, {
          status: "published",
          updatedAt: updatedPod.updatedAt,
        });
        mutate('/api/pods');
      } catch (error) {
        console.error('[PUBLISH_POD_ERROR]', error);
        throw error;
      }
    },
    [updatePod]
  );

  return {
    pods: remotePods || pods,
    pod: podId ? getPod(podId) : undefined,
    createPod,
    saveSource,
    publishPod,
    isLoading,
    error,
  };
}
