import type { Metadata } from "next";
import "./pico.pumpkin.min.css";
import styles from "./styles.module.css";

export const metadata: Metadata = {
  title: "expense tracker",
  description: "local-first expense tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={styles.body}>{children}</body>
    </html>
  );
}
