import styles from "./App.module.css";
import { saveUrlMutation, useViewerQuery } from "./config/query";
import { CommandMenu } from "./components/CommandMenu/CommandMenu";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Route, Routes } from "react-router";
import { SavesPage } from "./routes/Saves/Saves";
import { Suspense } from "react";
import { agent } from "./config/atp";
import { LoginPage } from "./routes/Login/Login";
import React from "react";
import { LinkIcon } from "./icon/Link";
import { isLink } from "./config/util";
import { Toaster, toast } from "sonner";
import { ReadPage } from "./routes/Read/Read";

export function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useReducer(
    () => true,
    agent.did != null
  );

  return (
    <div className={styles.body}>
      {isAuthenticated ? (
        <AuthenticatedApp />
      ) : (
        <LoginPage onLogin={setIsAuthenticated} />
      )}
    </div>
  );
}

function AuthenticatedApp() {
  const viewer = useViewerQuery();
  const avatar = viewer.data.data.avatar;
  console.log(viewer.data.data);
  const [isAddLinkOpen, setAddLinkOpen] = React.useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>BluePocket</h1>
          {/* <CommandMenu /> */}
          {isAddLinkOpen ? (
            <AddLinkInput
              onClose={() => {
                setAddLinkOpen(false);
              }}
            />
          ) : (
            <div className={styles.headerRight}>
              <button
                className={styles.linkBtn}
                onClick={() => setAddLinkOpen(true)}
              >
                <LinkIcon height={24} />
              </button>
              <div
                className={styles.profileBtn}
                style={{ backgroundImage: `url(${avatar})` }}
              ></div>
            </div>
          )}
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
              <Route path="read/:id" element={<ReadPage />} />
            </Routes>
          </Suspense>
        </main>
        <Toaster />
      </div>
    </>
  );
}

function AddLinkInput({ onClose }: { onClose: () => unknown }) {
  const [val, setVal] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const maybeLink = isLink(val);

  return (
    <form
      className={styles.addLinkInput}
      onSubmit={(ev) => {
        ev.preventDefault();
        setIsPending(true);
        const promise = saveUrlMutation(val)
          .then(() => {
            onClose();
          })
          .finally(() => {
            setIsPending(false);
          });

        toast.promise(promise, {
          loading: "Saving Link...",
          success: "Saved Link",
          error: (err: Error) => {
            return (
              <>
                <p>Error Saving Link</p>
                <p>{err.message}</p>
              </>
            );
          },
        });
      }}
    >
      <div className={styles.addLinkInputField}>
        <LinkIcon className={styles.addLinkInputIcon} />
        <input
          // biome-ignore lint/a11y/noAutofocus: fine
          autoFocus
          value={val}
          onChange={(ev) => {
            setVal(ev.target.value);
          }}
          placeholder="Save a URL https://..."
        />
      </div>
      <button disabled={!maybeLink || isPending}>Add</button>
      <button type="button" onClick={onClose}>
        X
      </button>
    </form>
  );
}
