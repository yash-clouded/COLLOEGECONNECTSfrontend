import { useQuery } from "@tanstack/react-query";
import type { Advisor } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllAdvisors() {
  const { actor, isFetching } = useActor();
  return useQuery<Advisor[]>({
    queryKey: ["advisors"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAdvisors();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchAdvisors(keyword: string, type: "college" | "branch") {
  const { actor, isFetching } = useActor();
  return useQuery<Advisor[]>({
    queryKey: ["advisors", "search", type, keyword],
    queryFn: async () => {
      if (!actor || !keyword.trim()) return [];
      if (type === "college") return actor.searchByCollege(keyword);
      return actor.searchByBranch(keyword);
    },
    enabled: !!actor && !isFetching && keyword.trim().length > 0,
  });
}
