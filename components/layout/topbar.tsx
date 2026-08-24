"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    label: "Navegar",
    href: "/",
  },
  {
    label: "Relações",
    href: "/relations",
  },
  {
    label: "Grafo",
    href: "/graph",
  },
];

export default function Topbar() {
  const pathname = usePathname();

  return (
    <header className="flex h-14 items-center border-b border-slate-800 bg-slate-950 px-6">
      <div className="mr-10">
        <span className="text-sm font-semibold tracking-wide text-white">
          Map Lab
        </span>
      </div>

      <nav className="flex h-full items-center gap-6">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex h-full items-center text-sm font-medium transition-colors
                ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                }
              `}
            >
              {item.label}

              {isActive && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-500" />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}