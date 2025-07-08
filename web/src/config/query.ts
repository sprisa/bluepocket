import {
  QueryClient,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { agent } from "./atp";
import { sha256 } from "js-sha256";
import { Readability } from "@mozilla/readability";

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

export type SaveRecord = {
  url: string;
  title?: string;
  excerpt?: string;
  publishTime?: string;
  siteName?: string;
  textLength?: number;
  imageHref?: string;
  createdAt: string;
};

type SaveQueryResponse = Array<{
  uri: string;
  cid: string;
  value: SaveRecord;
}>;

export function useSavesQuery(): SaveQueryResponse {
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
  }).data.data.records.sort((a, b) => {
    const av = a.value as SaveRecord;
    const bv = b.value as SaveRecord;

    return new Date(bv.createdAt).getTime() - new Date(av.createdAt).getTime();
  }) as SaveQueryResponse;
}

export function useSaveQuery(id: string): SaveRecord {
  return useSuspenseQuery({
    queryKey: ["saveQuery", id],
    queryFn: () => {
      return agent.com.atproto.repo.getRecord({
        repo: agent.assertDid,
        collection: "org.bluepocket.v1.save",
        rkey: id,
      });
    },
  }).data.data.value as SaveRecord;
}

export async function saveUrlMutation(urlStr: string) {
  const url = URL.parse(urlStr);
  if (url == null) return;
  url.searchParams.delete("utm_source");
  const rkey = sha256(url.href);
  const { article, image } = await fetchArticle(
    document.implementation.createHTMLDocument("tmp"),
    url
  );

  return await agent.com.atproto.repo.putRecord({
    repo: agent.assertDid, // The user
    collection: "org.bluepocket.v1.save", // The collection
    rkey: rkey, // The record key
    record: {
      // TODO: Get title and otag metadate
      url: url.href,
      // state: 'saved',
      title: article?.title ?? undefined,
      excerpt: article?.excerpt ?? undefined,
      publishTime: article?.publishedTime ?? undefined,
      siteName: article?.siteName ?? undefined,
      textLength: article?.length ?? undefined,
      imageHref: image,
      createdAt: new Date().toISOString(),
    } satisfies SaveRecord,
  });
}

export type Article = ReturnType<Readability["parse"]>;

export function fetchArticle(doc: Document, url: URL) {
  return new Promise<{
    article: Article;
    image?: string;
  }>((resolve) => {
    const req = new XMLHttpRequest();
    req.onload = () => {
      // console.log(req);
      doc.body.innerHTML = req.response.contents;
      const reader = new Readability(doc, {
        keepClasses: true,
      });
      // console.log("reader", reader);
      const article = reader.parse();
      // console.log("article", article);
      const el = doc.querySelector('meta[property="og:image"]') as
        | HTMLMetaElement
        | undefined;
      // console.dir(el);
      resolve({
        article,
        image: el?.content,
      });
    };
    let proxyUrl = `https://web.archive.org/web/${url.href}`;
    // TODO: Use custom CORS proxy
    // https://github.com/reynaldichernando/Whatever-Origin?tab=readme-ov-file#self-hosting
    proxyUrl = `https://whateverorigin.org/get?url=${encodeURIComponent(
      proxyUrl
    )}`;
    req.open("GET", proxyUrl);
    // req.responseType = 'document'
    // req.responseType = 'text'
    req.responseType = "json";
    req.send();
  });
}

export function useArticleQuery(docBuffer: Document, url: URL) {
  return useSuspenseQuery({
    queryKey: ["saveQuery", url],
    queryFn: () => {
      return fetchArticle(docBuffer, url);
    },
  });
}

export function useIsFavQuery(id: string) {
  return useSuspenseQuery({
    queryKey: ["favQuery", id],
    queryFn: () => {
      return agent.com.atproto.repo
        .getRecord({
          repo: agent.assertDid,
          collection: "org.bluepocket.v1.favorite",
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
  });
}

export function useFavArticleMutation(id: string) {
  return useMutation({
    mutationFn: (isFavorite: boolean) => {
      if (isFavorite) {
        return agent.com.atproto.repo.deleteRecord({
          repo: agent.assertDid,
          collection: "org.bluepocket.v1.favorite",
          rkey: id,
        });
      }
      return agent.com.atproto.repo.putRecord({
        repo: agent.assertDid,
        collection: "org.bluepocket.v1.favorite",
        rkey: id,
        record: {},
      });
    },
    onSuccess: (data) => {
      const favorited = "cid" in data.data;
      queryClient.setQueryData(["favQuery", id], favorited);
    },
  });
}