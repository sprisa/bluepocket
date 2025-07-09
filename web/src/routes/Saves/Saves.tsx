import { Link } from "react-router";
import { useSavesQuery } from "../../config/query";
import styles from "./Saves.module.css";
import { sha256 } from "js-sha256";
import { ExternalImage } from "../../components/ExternalImage/ExternalImage";
import type { LinkRecord } from "../../config/atp";

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

          return <Item key={record.cid} item={record.value} id={sha256(url)} />;
        })}
      </div>
    </div>
  );
}

function Item({ item, id }: { item: LinkRecord; id: string }) {
  const url = URL.parse(item.url);

  return (
    <Link className={styles.item} to={`/read/${id}`}>
      <ExternalImage src={item.imageHref} id={id} className={styles.itemImg}>
        <div className={styles.itemContent}>
          <p>{item.title}</p>
          {/* <p>{item.excerpt}</p> */}
          <div>
            <div>{url?.host}</div>
          </div>
        </div>
      </ExternalImage>
    </Link>
  );
}
