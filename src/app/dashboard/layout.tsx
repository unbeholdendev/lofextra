"use client";

import { create } from "@/db/create";
import { migrate } from "@/db/migrations";
import { LofikProvider } from "@lofik/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <>
      <header>
        <nav>
          <ul>
            <li>
              <h1>lofextra (beta)</h1>
            </li>
          </ul>

          <ul>
            {pathname !== "/dashboard" && (
              <li>
                <Link href="/dashboard">dashboard</Link>
              </li>
            )}

            {!pathname.includes("statistics") && (
              <li>
                <Link href="/dashboard/statistics">statistics</Link>
              </li>
            )}

            {!pathname.includes("categories") && (
              <li>
                <Link href="/dashboard/categories">categories</Link>
              </li>
            )}

            {!pathname.includes("account") && (
              <li>
                <Link href="/dashboard/account">account</Link>
              </li>
            )}
          </ul>
        </nav>
      </header>

      <LofikProvider
        create={create}
        seed={[]}
        migrate={migrate}
        loader={<div aria-busy="true" />}
        websocketServerUrl={process.env.NEXT_PUBLIC_WS_URL}
      >
        {children}
      </LofikProvider>
    </>
  );
}
