import { Readability } from "@mozilla/readability";

export type Article = {
  image?: string;
} & ReturnType<Readability["parse"]>;

// const archiveSvcUrl = "http://localhost:3001";
const archiveSvcUrl = 'https://archive.bluepocket.org'

export function fetchArticle(url: URL): Promise<Article> {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.onload = () => {
      // console.log(req);
      // doc.body.innerHTML = req.response.contents;
      const doc = req.response;
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
        title: article?.title,
        content: article?.content,
        byline: article?.byline,
        dir: article?.dir,
        excerpt: article?.excerpt,
        lang: article?.lang,
        length: article?.length,
        publishedTime: article?.publishedTime,
        siteName: article?.siteName,
        textContent: article?.textContent,
        image: el?.content,
      });
    };
    req.onerror = reject;
    let proxyUrl = `/web/${url.href}`;
    proxyUrl = `${archiveSvcUrl}?p=${encodeURIComponent(proxyUrl)}`;
    req.open("GET", proxyUrl);
    req.responseType = "document";
    req.send();
  });
}
