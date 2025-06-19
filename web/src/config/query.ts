import { QueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { agent } from "./atp";

export const queryClient = new QueryClient();

export function useViewerQuery() {
  return useSuspenseQuery({
    queryKey: ["profileQuery"],
    queryFn: () => {
      return agent.getProfile({
        actor: agent.assertDid,
      });
    },
  });
}

export function useSavesQuery() {
  return useSuspenseQuery({
    queryKey: ["savesQuery", 1],
    queryFn: () => {
      return agent.com.atproto.repo.listRecords({
        repo: agent.assertDid,
        // TODO: Need to save open graph info such as title, image, author, and subtitle.
        // collection: "org.bluepocket.v1.save",
        collection: "org.bluepocket.v1.saves",
        limit: 50,
      });
    },
  });
}
