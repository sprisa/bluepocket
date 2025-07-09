import { AtpAgent } from "@atproto/api";
import type { Article } from "./article";
// import { sha256 } from "js-sha256";

export const agent = new AtpAgent({
  service: "https://bsky.social",
  persistSession(ev, session) {
    console.log("persist", { ev, session });
    if (session == null) return;
    localStorage.setItem("session", JSON.stringify(session));
  },
});

// Pull existing session, if any.
const existingSession = localStorage.getItem("session");
if (existingSession != null) {
  try {
    const session = JSON.parse(existingSession);
    console.log("session", session);
    const res = await agent.resumeSession(session);
    if (res.success === false) {
      localStorage.removeItem("session");
    }
  } catch (err) {
    localStorage.removeItem("session");
  }
}

export const Collection = {
  /** Links to read */
  Save: "org.bluepocket.v1.save",
  Favorite: "org.bluepocket.v1.favorite",
  /** Read links */
  Archive: "org.bluepocket.v1.archive",
  /**
   * Canonical Source for links.
   * Data is denormalized since atproto api doesn't support filter queries.
   */
  Link: "org.bluepocket.v1.link",
} as const;

export type LinkRecord = {
  url: string;
  title?: string;
  excerpt?: string;
  publishTime?: string;
  siteName?: string;
  textLength?: number;
  imageHref?: string;
  createdAt: string;
};

export function makeLinkRecord(url: URL, article: Article): LinkRecord {
  return {
    url: url.href,
    title: article?.title ?? undefined,
    excerpt: article?.excerpt ?? undefined,
    publishTime: article?.publishedTime ?? undefined,
    siteName: article?.siteName ?? undefined,
    textLength: article?.length ?? undefined,
    imageHref: article.image,
    createdAt: new Date().toISOString(),
  };
}
