import React from "react";
import clsx from "clsx";
import styles from "./ExternalImage.module.css";

type Props = {
  id: string;
  src?: string;
  children?: React.ReactNode;
  className?: string;
};

const archiveRegex = /https:\/\/web.archive.org\/web\/\w+\//;

export function ExternalImage({ id, src, children, className }: Props) {
  const [render, setRender] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (src == null || src === '') return;

    fetchImage(src)
      .catch((err) => {
        console.error("img", src, err);
        if (archiveRegex.test(src)) {
          const newSrc = src.replace(archiveRegex, "");
          console.log('trying', newSrc)
          return fetchImage(newSrc);
        }
      })
      .then((src) => {
        if (src == null) return
        console.log("got image", src);
        setRender(src);
      });
  }, [src]);

  const background = React.useMemo(() => {
    return generateGradient(id);
  }, [id]);

  return (
    <div
      // style={{ backgroundImage: render == null ? background : `url(${render})` }}
      style={{ backgroundImage: background }}
      className={clsx(styles.wrapper, className)}
    >
      {render !== null ? (
        <img src={render} alt="" className={styles.img} />
      ) : null}
      {children}
    </div>
  );
}

const generateGradient = (hash: string): string => {
  const r = Number.parseInt(hash.slice(0, 2), 16);
  const g = Number.parseInt(hash.slice(2, 4), 16);
  const b = Number.parseInt(hash.slice(4, 6), 16);

  return `linear-gradient(to right, rgba(${r},${g},${b},0.8), rgba(${b},${r},${g},0.5))`;
};

function fetchImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(src);
    img.onerror = reject;
  });
}
