import type { ReactNode } from "react";
import Link from "next/link";

type HeaderProps = {
  eyebrow?: string;
  title?: string;
  action?: ReactNode;
};

export function Header({ eyebrow = "Mesa QR", title, action }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 py-4">
      <Link href="/" className="group flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-lg font-black text-accent shadow-[0_0_28px_rgba(245,197,66,0.12)] transition group-hover:border-accent/60">
          M
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
            {eyebrow}
          </p>
          <p className="mt-0.5 text-sm font-medium text-white/85">
            {title ?? "Bar moderno, servicio ágil"}
          </p>
        </div>
      </Link>
      {action}
    </header>
  );
}
