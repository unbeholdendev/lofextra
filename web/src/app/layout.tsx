import type { Metadata } from "next";
import "./pico.pumpkin.min.css";
import styles from "./styles.module.css";

export const metadata: Metadata = {
  title: "lofextra",
  description: "local-first expense tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={styles.body}>
        {children}
        <footer className={styles.footer}>
          <a
            href="https://github.com/pycan-jouza/lofextra"
            target="_blank"
            referrerPolicy="no-referrer"
          >
            source code
          </a>
        </footer>
      </body>
    </html>
  );
}
