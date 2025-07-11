import { Link, useParams } from "react-router";
import { useSavesQuery } from "../../config/query";
import styles from "./Saves.module.css";
import { sha256 } from "js-sha256";
import { ExternalImage } from "../../components/ExternalImage/ExternalImage";
import type { LinkRecord } from "../../config/atp";

export function SavesPage() {
  const { collection } = useParams();
  const saves = useSavesQuery(collection ?? "saves");
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
    <Link to={`/read/${id}`}>
      <SaveItem
        id={id}
        imageHref={item.imageHref}
        title={item.title ?? "Article"}
        host={url?.host}
      />
    </Link>
  );
}

export function SaveItem({
  id,
  imageHref,
  title,
  host,
}: {
  id: string;
  imageHref?: string;
  title: string;
  host?: string;
}) {
  return (
    <div className={styles.itemWrapper}>
      <div className={styles.item}>
        <ExternalImage src={imageHref} id={id} className={styles.itemImg}>
          <div className={styles.itemContent}>
            <p>{title}</p>
            {/* <p>{item.excerpt}</p> */}
            <div>
              <div>{host}</div>
            </div>
          </div>
        </ExternalImage>
      </div>
    </div>
  );
}
