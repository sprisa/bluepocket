import { Command } from "cmdk";
import React from "react";
import styles from './styles.module.css'

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: any) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        className={styles.cmdBtn}
        onClick={() => {
          setOpen((open) => !open);
        }}
      >
        Links
      </button>
      <div className={styles.cmdk}>
        <Command.Dialog
          open={open}
          onOpenChange={setOpen}
          label="Global Command Menu"
        >
          <Command.Input />
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>

            <Command.Group heading="Letters">
              <Command.Item>a</Command.Item>
              <Command.Item>b</Command.Item>
              <Command.Separator />
              <Command.Item>c</Command.Item>
            </Command.Group>

            <Command.Item>Apple</Command.Item>
          </Command.List>
        </Command.Dialog>
      </div>
    </>
  );
};
