import {
  QueryClient,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { agent, Collection, makeLinkRecord, type LinkRecord } from "./atp";
import { sha256 } from "js-sha256";
import { fetchArticle } from "./article";

export const queryClient = new QueryClient();

export function useProfileQuery(id: string) {
  return useSuspenseQuery({
    queryKey: ["profileQuery", id],
    queryFn: () => {
      return agent.getProfile({
        actor: id,
      });
    },
  });
}

export function useViewerQuery() {
  return useProfileQuery(agent.assertDid);
}

type SaveQueryResponse = Array<{
  uri: string;
  cid: string;
  value: LinkRecord;
}>;

export function useSavesQuery(collectionName: string): SaveQueryResponse {
  return useSuspenseQuery({
    queryKey: ["savesQuery", collectionName],
    queryFn: () => {
      let collection: string;
      switch (collectionName) {
        case "saves":
          collection = Collection.Save;
          break;
        case "favorites":
          collection = Collection.Favorite;
          break;
        case "archive":
          collection = Collection.Archive;
          break;
        // default:
        //   collection = Collection.Group(collectionName);
        default:
          throw new Error(`invalid collection: ${collectionName}`);
      }

      return agent.com.atproto.repo.listRecords({
        repo: agent.assertDid,
        collection: collection,
        limit: 21,
      });
    },
  }).data.data.records.sort((a, b) => {
    const av = a.value as LinkRecord;
    const bv = b.value as LinkRecord;

    return new Date(bv.createdAt).getTime() - new Date(av.createdAt).getTime();
  }) as SaveQueryResponse;
}

export function useLinkQuery(id: string): LinkRecord {
  return useSuspenseQuery({
    queryKey: ["linkQuery", id],
    queryFn: () => {
      return agent.com.atproto.repo.getRecord({
        repo: agent.assertDid,
        collection: Collection.Link,
        rkey: id,
      });
    },
  }).data.data.value as LinkRecord;
}

export function useSaveUrlMutation() {
  return useMutation({
    async mutationFn(urlStr: string) {
      const url = URL.parse(urlStr);
      if (url == null) return;
      url.searchParams.delete("utm_source");
      const rkey = sha256(url.href);
      const article = await fetchArticle(url);
      if (article?.title === "tmp") {
        delete article.title;
      }

      const record = makeLinkRecord(url, article);
      await Promise.all([
        agent.com.atproto.repo.putRecord({
          repo: agent.assertDid,
          collection: Collection.Save,
          rkey,
          record,
        }),
        agent.com.atproto.repo.putRecord({
          repo: agent.assertDid,
          collection: Collection.Link,
          rkey,
          record,
        }),
      ]).catch((err) => {
        agent.com.atproto.repo.deleteRecord({
          repo: agent.assertDid,
          collection: Collection.Save,
          rkey,
        });
        agent.com.atproto.repo.deleteRecord({
          repo: agent.assertDid,
          collection: Collection.Link,
          rkey,
        });

        throw err;
      });
    },
    onSuccess: (_data) => {
      // const favorited = "cid" in data.data;
      // queryClient.setQueryData(["favQuery", id], favorited);
    },
  });
}

export function useArticleQuery(url: URL) {
  return useSuspenseQuery({
    queryKey: ["articleQuery", url],
    queryFn: () => {
      return fetchArticle(url);
    },
  });
}

export function favQuery(id: string) {
  return {
    queryKey: ["favQuery", id],
    queryFn() {
      return agent.com.atproto.repo
        .getRecord({
          repo: agent.assertDid,
          collection: Collection.Favorite,
          rkey: id,
        })
        .then(() => {
          return true;
        })
        .catch(() => {
          return false;
        });
    },
    retry: false,
  } as const
}

export function useFavArticleMutation(id: string, link: LinkRecord) {
  return useMutation({
    mutationFn: (isFavorite: boolean) => {
      link = {...link}
      // @ts-expect-error
      delete link.$type
      if (isFavorite) {
        return agent.com.atproto.repo.deleteRecord({
          repo: agent.assertDid,
          collection: Collection.Favorite,
          rkey: id,
        });
      }
      return agent.com.atproto.repo.putRecord({
        repo: agent.assertDid,
        collection: Collection.Favorite,
        rkey: id,
        record: link,
      });
    },
    onSuccess: (data) => {
      const favorited = "cid" in data.data;
      queryClient.setQueryData(["favQuery", id], favorited);
    },
  });
}


export function isArchivedQuery(id: string) {
  return {
        queryKey: ["isArchived", id],
    queryFn() {
      return agent.com.atproto.repo
        .getRecord({
          repo: agent.assertDid,
          collection: Collection.Archive,
          rkey: id,
        })
        .then(() => {
          return true;
        })
        .catch(() => {
          return false;
        });
    },
    retry: false,
  } as const
}

export function useArchiveMutation(id: string, link: LinkRecord) {
  return useMutation({
    async mutationFn(archive: boolean) {
      link = {...link}
      // @ts-expect-error
      delete link.$type

      if (archive === false) {
        await agent.com.atproto.repo.putRecord({
          repo: agent.assertDid,
          collection: Collection.Save,
          rkey: id,
          record: link,
        });
        await agent.com.atproto.repo.deleteRecord({
          repo: agent.assertDid,
          collection: Collection.Archive,
          rkey: id,
        });

        return archive;
      }

      await agent.com.atproto.repo.putRecord({
        repo: agent.assertDid,
        collection: Collection.Archive,
        rkey: id,
        record: link,
      });

      await agent.com.atproto.repo.deleteRecord({
        repo: agent.assertDid,
        collection: Collection.Save,
        rkey: id,
      });

      return archive;
    },
    onSuccess: (archived: boolean) => {
      queryClient.setQueryData(["isArchived", id], archived);
    },
  });
}
