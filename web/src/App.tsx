import styles from "./App.module.css";
import { useViewerQuery } from "./config/query";
import { CommandMenu } from "./components/CommandMenu/CommandMenu";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Route, Routes } from "react-router";
import { SavesPage } from "./routes/Saves/Saves";
import { Suspense } from "react";

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
      <div className={styles.main}>
        <div className={styles.sidebar}>
          <Sidebar />
        </div>
        <main className={styles.content}>
          <Suspense>
            <Routes>
              <Route path="saves" element={<SavesPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
