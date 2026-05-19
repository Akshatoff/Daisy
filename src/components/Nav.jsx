"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

const Nav = () => {
  const path = usePathname();

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">Daisy</Link>
      <ul className="nav-links">
        <li><Link href="/about" className={path === "/about" ? "active" : ""}>About</Link></li>
        <li><Link href="/todo" className={path === "/todo" ? "active" : ""}>To-Do</Link></li>
        <li><Link href="/pomo" className={path === "/pomo" ? "active" : ""}>Pomodoro</Link></li>
        <li><Link href="/note" className={path === "/note" ? "active" : ""}>Notes</Link></li>
      </ul>
    </nav>
  );
};

export default Nav;
