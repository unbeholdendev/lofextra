"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./styles.module.css";

export default function Page() {
  const { replace } = useRouter();

  useEffect(() => {
    replace("/dashboard");
  }, [replace]);

  return <main className={styles.main}>redirecting to dashboard..</main>;
}
