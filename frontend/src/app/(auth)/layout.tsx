import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-8 px-[var(--screen-x)] py-10">
      <p className="brand text-[1.5rem]">
        smile<span className="dot">.</span>
      </p>
      {children}
    </main>
  );
}
