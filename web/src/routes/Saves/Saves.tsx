import { useSavesQuery, type SaveRecord } from "../../config/query";
import styles from "./Saves.module.css";
import { Readability } from "@mozilla/readability";
import DOMPurify from "dompurify";

const doc = document.implementation.createHTMLDocument("test");
doc.body.innerHTML = DOMPurify.sanitize(`

`);

const article = new Readability(doc).parse();
console.log(article);

export function SavesPage() {
  const saves = useSavesQuery();
  console.log({ saves: saves });

  return (
    <div>
      <h1 className={styles.title}>Saves</h1>
      <div className={styles.items}>
        {saves.map((record) => {
          const url = record?.value?.url;
          if (typeof url !== "string") return;

          return <Item key={record.cid} item={record.value} />;
        })}
      </div>
    </div>
  );
}

function Item({ item }: { item: SaveRecord }) {
  const url = URL.parse(item.url);

  return (
    <a className={styles.item} href={url?.href}>
      <div
        className={styles.itemImg}
        style={{ backgroundImage: `url(${item.imageHref})` }}
      />
      <div className={styles.itemContent}>
        <p>{item.title}</p>
        {/* <p>{item.excerpt}</p> */}
        <div>
          <div>{url?.host}</div>
        </div>
      </div>
    </a>
  );
}
