import { useNavigate, useParams } from "react-router";
import {
  useArticleQuery,
  useFavArticleMutation,
  useIsFavQuery,
  useSaveQuery,
  type Article,
} from "../../config/query";
import DOMPurify from "dompurify";
import React from "react";
import styles from "./Read.module.css";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import { StarIcon } from "../../icon/Star";
import { ArchiveIcon } from "../../icon/Archive";
import { TrashIcon } from "../../icon/Trash";
import { ShareIcon } from "../../icon/Share";
import { BackIcon } from "../../icon/Back";
import { toast } from "sonner";
import { ExternalImage } from "../../components/ExternalImage/ExternalImage";
import { OutlinkIcon } from "../../icon/Outlink";

const docBuffer = document.implementation.createHTMLDocument("test");

export function ReadPage() {
  const params = useParams();
  console.log({ params });
  const id = params.id!;
  const data = useSaveQuery(id);
  console.log({ data });
  const url = new URL(data.url);
  const article = useArticleQuery(docBuffer, url);
  const content = article.data.article?.content;
  const siteName = article.data.article?.siteName ?? url.hostname;
  const textLength = article.data.article?.length ?? data.textLength;
  console.log({ article });
  const html = React.useMemo(() => {
    if (content == null) return;
    return DOMPurify.sanitize(content);
  }, [content]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <ExternalImage
          id={id}
          src={data.imageHref}
          className={styles.headerImg}
        />
        <h1>{article.data.article?.title}</h1>
        <div className={styles.headerTags}>
          {textLength != null && <p>{calcReadingTime(textLength)}</p>}
          {siteName != null && <p>{siteName}</p>}
          <a target="_blank" href={data.url}>
            View Original <OutlinkIcon height={18} />
          </a>
        </div>
      </header>
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
              hljs.highlightElement(node);
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
      <Toolbar id={id} article={article.data.article} url={data.url} />
    </main>
  );
}

function Toolbar({
  id,
  article,
  url,
}: {
  id: string;
  article: Article;
  url: string;
}) {
  const baseFrequency = 0.005;
  const scale = 10;
  const isFavorite = useIsFavQuery(id).data;
  const navi = useNavigate();
  const canShare = navigator.canShare({
    url: url,
  });

  const favMutation = useFavArticleMutation(id);

  const handleFavorite = () => {
    const type = isFavorite ? "Removed" : "Added";
    favMutation.mutate(isFavorite, {
      onSuccess() {
        toast.success(`${type} Favorite`);
      },
    });
  };

  const handleShare = () => {
    navigator.share({
      title: article?.title ?? undefined,
      url: url,
    });
  };

  return (
    <header className={styles.toolbar}>
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", overflow: "hidden" }}
      >
        <defs>
          <filter
            id="glass-distortion"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`${baseFrequency} ${baseFrequency}`}
              numOctaves="2"
              seed="92"
              result="noise"
            ></feTurbulence>
            <feGaussianBlur
              in="noise"
              stdDeviation="2"
              result="blurred"
            ></feGaussianBlur>
            <feDisplacementMap
              in="SourceGraphic"
              in2="blurred"
              scale={scale}
              xChannelSelector="R"
              yChannelSelector="G"
            ></feDisplacementMap>
          </filter>
        </defs>
      </svg>

      <button onClick={() => navi(-1)}>
        <BackIcon height={24} />
      </button>
      <button onClick={handleFavorite} disabled={favMutation.isPending}>
        <StarIcon height={24} fill={isFavorite ? "var(--gold)" : "none"} />
      </button>
      <button>
        <ArchiveIcon height={24} />
      </button>
      <button>
        <TrashIcon height={24} />
      </button>
      {canShare && (
        <button onClick={handleShare}>
          <ShareIcon height={24} />
        </button>
      )}
    </header>
  );
}

function calcReadingTime(charLength: number, wpm = 200) {
  const charPerMinute = wpm * 5; // Average 5 chars per word
  // Calculate reading time in minutes
  const minutes = charLength / charPerMinute;

  if (minutes < 1) {
    return "Less than 1 min read";
  }
  if (minutes < 60) {
    return `${Math.ceil(minutes)} min read`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.ceil(minutes % 60);
  return `${hours}h ${remainingMinutes}m read`;
}
