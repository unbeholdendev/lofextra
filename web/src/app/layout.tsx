import type { Metadata } from "next";
import Script from "next/script";
import "./pico.pumpkin.min.css";
import styles from "./styles.module.css";

const APP_NAME = "lofextra";
const APP_DESCRIPTION = "local-first expense tracker";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: APP_NAME,
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
};

// export const viewport: Viewport = {
//   themeColor: "#FFFFFF",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script
        defer
        data-domain="lofextra.com"
        src="https://plausible.lofextra.com/js/script.js"
      />

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
