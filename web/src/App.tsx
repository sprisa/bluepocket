import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { AtpAgent } from "@atproto/api";
import { sha256 } from "js-sha256";

const agent = new AtpAgent({
  service: "https://bsky.social",
  persistSession(ev, session) {
    console.log("persist", { ev, session });
    if (session == null) return;
    localStorage.setItem("session", JSON.stringify(session));
  },
});

const existingSession = localStorage.getItem("session");
if (existingSession != null) {
  try {
    const session = JSON.parse(existingSession);
    console.log("session", session);
    const res = await agent.resumeSession(session);
    if (res.success === false) {
      localStorage.removeItem("session");
    }
  } catch (err) {
    localStorage.removeItem("session");
  }
}

function App() {
  const [count, setCount] = useState(0);
  console.log("did", agent.did);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>BluePocket</h1>
      <div className="card">
        <form
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
          action={async (ev) => {
            const username = ev.get("username");
            const password = ev.get("password");
            console.log({ username, password });
            if (typeof username !== "string" || typeof password !== "string")
              return;

            const res = await agent
              .login({
                identifier: username,
                password: password,
              })
              .catch((err) => {
                console.log("error login", err);
              });
            console.log({ res });
          }}
        >
          <label htmlFor="username">Username</label>
          <input id="username" name="username" />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" />
          <button type="submit">Login</button>
        </form>

        <button
          onClick={async () => {
            const url =
              "https://www.atproto-browser.dev/at/did:plc:saeh7cmd5rq2ikufc2zw5pap";
            const rkey = sha256(url);

            const saveRes = await agent.com.atproto.repo.putRecord({
              repo: agent.assertDid, // The user
              collection: "org.bluepocket.v1.save", // The collection
              rkey: rkey, // The record key
              record: {
                url: url,
                state: "saved",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            });
            console.log("put", saveRes);

            const favRes = await agent.com.atproto.repo.putRecord({
              repo: agent.assertDid,
              collection: "org.bluepocket.v1.favorite",
              rkey: rkey, // Collection name
              record: {
                subject: {
                  cid: saveRes.data.cid,
                  uri: saveRes.data.uri,
                }
              },
            });
            console.log("favRes", favRes);

            const collectionName = "test"
            const collectionRes = await agent.com.atproto.repo.putRecord({
              repo: agent.assertDid,
              collection: "org.bluepocket.v1.collection",
              rkey: collectionName, // Collection name
              record: {
                description: "My fun collection of links",
              },
            });

            console.log("collection", collectionRes);

            // agent.com.atproto.repo.listRecords({

            // })

            const addCollectionRes = await agent.com.atproto.repo.putRecord({
              repo: agent.assertDid,
              collection: `org.bluepocket.v1.collection.${collectionName}`,
              rkey: rkey, // Collection name
              record: {
                note: "Interesting read.",
                subject: {
                  cid: saveRes.data.cid,
                  uri: saveRes.data.uri,
                },
              },
            });

            console.log("collection save", addCollectionRes);
          }}
        >
          Put Record
        </button>
      </div>
    </>
  );
}

export default App;
