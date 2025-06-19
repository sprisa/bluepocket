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
