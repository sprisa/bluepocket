import { NavLink } from "react-router";
import styles from "./Sidebar.module.css";
import clsx from "clsx";

export function Sidebar() {
  return (
    <nav className={styles.nav}>
      <Link to="/saves">Saves</Link>
      <Section name="Collections" titleNode={<button>+</button>}></Section>
      <Section name="Filter">
        <Link to="/saves/archive">Archived</Link>
        <Link to="/saves/favorites">Favorites</Link>
      </Section>
    </nav>
  );
}

function Link({ to, children }: { to: string; children: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) => {
        return clsx(styles.link, isActive && styles.activeLink);
      }}
    >
      {children}
    </NavLink>
  );
}

function Section({
  name,
  titleNode,
  children,
}: {
  name: string;
  titleNode?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionName}>{name}</span>
        {titleNode}
      </div>
      <nav className={styles.nav}>{children}</nav>
    </div>
  );
}
