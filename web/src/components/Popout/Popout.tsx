import { createPortal } from "react-dom"
import styles from './Popout.module.css'

type Props = {
  children: React.ReactNode
}

export function Popout({ children}: Props) {
  const el = <div className={styles.wrapper}>
    HELLO
    {children}
  </div>

  return createPortal(el, document.body)
}