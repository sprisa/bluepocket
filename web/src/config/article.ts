import { Readability } from "@mozilla/readability";

export type Article = ReturnType<Readability["parse"]>;

export function fetchArticle(doc: Document, url: URL) {
  return new Promise<{
    article: Article;
    image?: string;
  }>((resolve, reject) => {
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
    req.onerror = reject;
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
