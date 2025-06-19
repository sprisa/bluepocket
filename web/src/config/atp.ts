import { AtpAgent } from "@atproto/api";
// import { sha256 } from "js-sha256";

export const agent = new AtpAgent({
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
