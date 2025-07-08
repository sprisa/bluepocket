import { useParams } from "react-router";
import { useArticleQuery, useSaveQuery } from "../../config/query";
import DOMPurify from "dompurify";
import React from "react";
import styles from "./Read.module.css";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

const docBuffer = document.implementation.createHTMLDocument("test");

export function ReadPage() {
  const params = useParams();
  console.log({ params });
  const data = useSaveQuery(params.id as string);
  console.log({ data });
  const article = useArticleQuery(docBuffer, new URL(data.url));
  const content = article.data.article?.content;
  console.log({ article });
  const html = React.useMemo(() => {
    if (content == null) return;
    return DOMPurify.sanitize(content);
  }, [content]);

  return (
    <div className={styles.page}>
      <h1>{article.data.article?.title}</h1>
      <a target="_blank" href={data.url}>
        View Original
      </a>
      {html != null ? (
        <article
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{ __html: html }}
          className={styles.article}
          ref={(ref) => {
            if (ref == null) return;
            // Highlight code
            const nodes = ref.querySelectorAll("pre code");
            for (const node of nodes) {
              // @ts-expect-error
              hljs.highlightBlock(node);
            }

            const waybackPrefixRe = /\/web\/\w+\//;
            const aTags = ref.querySelectorAll("a");
            for (const node of aTags) {
              const a = node as HTMLAnchorElement;
              if (a.host === window.location.host) {
                // Sometime html will include malformed links
                if (waybackPrefixRe.test(a.pathname)) {
                  a.href = a.pathname.replace(waybackPrefixRe, "");
                }
                // Fix plain anchor links.
                // Typically Wikipedia
                else if (a.hash !== "") {
                  a.href = `${data.url}${a.hash}`;
                }
                // console.dir(node);
              }
              // Remove Wayback links
              else if (a.host === "web.archive.org") {
                a.href = a.href.replace(
                  /https:\/\/web.archive.org\/web\/\w+\//,
                  ""
                );
              }
              a.target = "_blank";
            }

            const imgTags = ref.querySelectorAll("img");
            for (const node of imgTags) {
              const img = node as HTMLImageElement;
              if (img.src.startsWith(window.location.origin)) {
                let src = img.src.replace(window.location.origin, "");
                src = src.replace(waybackPrefixRe, "");
                img.src = src;
              }
            }
          }}
        />
      ) : null}
    </div>
  );
}
