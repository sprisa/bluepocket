import { useSavesQuery } from '../../config/query'
import styles from './Saves.module.css'

export function SavesPage() {
  const saves = useSavesQuery()
  console.log({ saves: saves.data.data })

  return <div>
    <h1 className={styles.title}>Saves</h1>

  </div>
}

function Item() {
  
}