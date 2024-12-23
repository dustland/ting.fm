import useSWR from "swr";
import { Pod } from "@/store/pod";

export function useDiscoverPods() {
  const {
    data: pods,
    error,
    isLoading,
    mutate,
  } = useSWR<Pod[]>("/api/pods/discover", async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch discover pods");
    }
    return response.json();
  });

  return {
    pods: pods || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
