import { Command } from "cmdk";
import React from "react";
import styles from "./styles.module.css";
import { Root, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { saveUrl } from "../../config/query";

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

  const [value, setValue] = React.useState("");
  const maybeLink = isLink(value);

  return (
    <Root
      onOpenChange={() => {
        // Reset data
        setValue("");
      }}
    >
      <PopoverTrigger asChild>
        <button className={styles.cmdBtn}>Links</button>
      </PopoverTrigger>
      <PopoverContent>
        <Command label="Global Command Menu" className={styles.cmdk}>
          <Command.Input
            value={value}
            onValueChange={(value) => {
              console.log(value, maybeLink);
              setValue(value);
            }}
          />
          <Command.List>
            {maybeLink === false && (
              <Command.Empty>No results found.</Command.Empty>
            )}

            <Command.Group heading="Letters">
              <Command.Item>a</Command.Item>
              <Command.Item>b</Command.Item>
              <Command.Separator />
              <Command.Item>c</Command.Item>
            </Command.Group>

            <Command.Item>Apple</Command.Item>
          </Command.List>

          <div className={styles.footer}>
            <button
              disabled={!maybeLink}
              onClick={async () => {
                const res = await saveUrl(value);

                console.log(res);
                setValue("");
              }}
            >
              Add Link
            </button>
          </div>
        </Command>
      </PopoverContent>
    </Root>
  );
}

function isLink(str: string) {
  try {
    const url = new URL(str);
    // console.log(url)
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}
