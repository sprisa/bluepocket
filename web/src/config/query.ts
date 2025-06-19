import { QueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { agent } from "./atp";
import { sha256 } from "js-sha256";

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
        collection: "org.bluepocket.v1.save",
        limit: 50,
      });
    },
  });
}

export async function saveUrl(urlStr: string) {
  const url = URL.parse(urlStr);
  if (url == null) return;
  const rkey = sha256(url.href);

  return await agent.com.atproto.repo.putRecord({
    repo: agent.assertDid, // The user
    collection: "org.bluepocket.v1.save", // The collection
    rkey: rkey, // The record key
    record: {
      // TODO: Get title and otag metadate
      url: url.href,
      state: "saved",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
}
