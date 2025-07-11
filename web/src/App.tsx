import styles from "./App.module.css";
import { useSaveUrlMutation, useViewerQuery } from "./config/query";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Link, Route, Routes, useLocation } from "react-router";
import { SaveItem, SavesPage } from "./routes/Saves/Saves";
import { Suspense, useEffect } from "react";
import { agent, resumeExistingSession } from "./config/atp";
import { LoginPage } from "./routes/Login/Login";
import React from "react";
import { LinkIcon } from "./icon/Link";
import { isLink } from "./config/util";
import { Toaster, toast } from "sonner";
import { ReadPage } from "./routes/Read/Read";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Modal } from "./components/Modal/Modal";
import { fetchArticle } from "./config/article";

export function App() {
  useSuspenseQuery({
    queryKey: ["resumeClient"],
    async queryFn() {
      await resumeExistingSession();
      return null;
    },
  });
  const [isAuthenticated, setIsAuthenticated] = React.useReducer(
    () => true,
    agent.did != null
  );

  const location = useLocation();
  // Scroll to top on path change
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  }, [location.key]);

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
      {isAddLinkOpen && (
        <AddLinkInput
          onClose={() => {
            setAddLinkOpen(false);
          }}
        />
      )}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/saves">
            <h1>BluePocket</h1>
          </Link>
          {/* <CommandMenu /> */}
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
        </div>
      </header>
      <div className={styles.main}>
        <Suspense>
          <Routes>
            <Route path="read/:id" element={<ReadPage />} />
            <Route
              path="*"
              element={
                <div className={styles.sidebarContent}>
                  <div className={styles.sidebar}>
                    <Sidebar />
                  </div>
                  <main className={styles.content}>
                    <Suspense>
                      <Routes>
                        <Route
                          path="saves/:collection?"
                          element={<SavesPage />}
                        />
                      </Routes>
                    </Suspense>
                  </main>
                </div>
              }
            />
          </Routes>
        </Suspense>
        <Toaster />
      </div>
    </>
  );
}

function AddLinkInput({ onClose }: { onClose: () => unknown }) {
  const [val, setVal] = React.useState("");
  const maybeLink = isLink(val);
  const saveMutation = useSaveUrlMutation();
  const isPending = saveMutation.isPending;
  const supportClipboard = navigator?.clipboard?.readText != null;
  const preview = useQuery({
    queryKey: ["AddLinkInputQuery", val],
    queryFn: () => {
      const url = URL.parse(val);
      if (url == null) return null;
      return fetchArticle(url);
    },
    enabled: maybeLink,
  });

  return (
    <Modal title="Add Link" onClose={onClose}>
      <form
        className={styles.addLinkInput}
        onSubmit={(ev) => {
          ev.preventDefault();
          const promise = saveMutation.mutateAsync(val).then(() => {
            onClose();
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
          {val === "" && supportClipboard && (
            <button
              type="button"
              onClick={async () => {
                navigator.clipboard
                  .readText()
                  .then((text) => {
                    console.log(text);
                    setVal(text);
                  })
                  .catch(() => {});
              }}
            >
              Paste from Clipboard
            </button>
          )}
        </div>
        <button
          disabled={!maybeLink || isPending}
          className={styles.addLinkInputSaveBtn}
        >
          Add
        </button>

        {preview.data != null && (
          <SaveItem
            id="884324325"
            title={preview.data.title ?? "Article"}
            imageHref={preview.data.image}
          />
        )}
      </form>
    </Modal>
  );
}
