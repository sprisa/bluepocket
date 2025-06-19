import styles from "./App.module.css";
import { useViewerQuery } from "./config/query";
import { CommandMenu } from "./components/CommandMenu/CommandMenu";
import { Sidebar } from "./components/Sidebar/Sidebar";

export function App() {
  const viewer = useViewerQuery();
  const avatar = viewer.data.data.avatar;
  console.log(viewer.data.data);

  return (
    <div className={styles.body}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
        <h1>BluePocket</h1>
        <CommandMenu />
        <div
          className={styles.profileBtn}
          style={{ backgroundImage: `url(${avatar})` }}
        ></div>
        </div>
      </header>
      <main className={styles.main}>
        <Sidebar />
        <div>Content Here</div>
      </main>
    </div>
  );
}
