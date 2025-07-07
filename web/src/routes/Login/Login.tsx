import React from "react";
import styles from "./Login.module.css";
import { agent } from "../../config/atp";

type FormState = { state: "pending" } | { state: "error"; msg: Error };

type Props = {
  onLogin: () => unknown;
};

export function LoginPage({ onLogin }: Props) {
  const usernameId = React.useId();
  const [state, setState] = React.useState<FormState | null>(null);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1>BluePocket</h1>
        <h2>Sign In</h2>
        <h3>Enter your Bluesky username and password</h3>
      </div>
      <div className={styles.divider} />
      <div className={styles.formWrapper}>
        <form
          className={styles.form}
          onSubmit={(ev) => {
            ev.preventDefault();
            const data = new FormData(ev.currentTarget);
            const username = data.get("username");
            const password = data.get("password");
            if (typeof username !== "string" || typeof password !== "string")
              return;

            setState({ state: "pending" });
            agent
              .login({
                identifier: username,
                password: password,
              })
              .then(() => {
                onLogin();
              })
              .catch((err: Error) => {
                setState({ state: "error", msg: err });
              });
          }}
        >
          <label htmlFor={usernameId}>Bluesky Account</label>
          <Input
            id={usernameId}
            name="username"
            placeholder="Username or email address"
            aria-label="Username or email address"
          />
          <Input
            name="password"
            placeholder="Password"
            type="password"
            aria-label="Password"
          />
          <button disabled={state?.state === "pending"}>Sign In</button>
          {state?.state === "error" ? (
            <div className={styles.errorMsg}>{state.msg.message}</div>
          ) : null}
        </form>
        <div className={styles.createAccount}>
          <div className={styles.createAccountDivider}>
            <div />
            <span>No Bluesky account?</span>
          </div>
          <a href="https://bsky.app/settings/account" target="_blank">
            Create account on Bluesky
          </a>
        </div>
      </div>
    </main>
  );
}

function Input(props: React.HTMLProps<HTMLInputElement>) {
  return (
    <div className={styles.inputWrapper}>
      <input
        {...props}
        className={styles.input}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
      />
    </div>
  );
}
