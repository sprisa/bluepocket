import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

type Props = {
  children: React.ReactNode;
  title: string;
  onClose: () => unknown;
};

export function Modal({ children, title, onClose }: Props) {
  const el = (
    <div className={styles.modal}>
      <div className={styles.header}>
        <p>{title}</p>
        <button
          onClick={() => {
            onClose();
          }}
        >
          x
        </button>
      </div>
      {children}
    </div>
  );

  return createPortal(el, document.body);
}
