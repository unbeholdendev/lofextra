"use client";

import { CopyIcon } from "@/components/icons/Copy";
import Image from "next/image";
import { useState } from "react";
import styles from "./styles.module.css";

const lnurl =
  "lnurl1dp68gurn8ghj76n0w4axjmnp9e3k7mf09emk2mrv944kummhdchkcmn4wfk8qtms093kzmsrraarj";

const lightningAddress = "pycan@jouzina.com";

const btcAddress = "bc1qe5t98k2w5rlayyy9tu2x7h3r5tqawmauwanw82";

export default function Page() {
  const [type, setType] = useState<"lightning" | "bitcoin">("lightning");

  return (
    <main className={styles.main}>
      <h1>donate</h1>

      <p>
        if you find this app at least a tiny bit helpful and want to support the
        work that i do in my free time, you can do so by the means below. i
        really appreciate it, thank you.
      </p>

      <section>
        <div className={styles.center}>
          <button
            className={`${styles["margin-horizontal"]} ${
              type === "lightning" ? "" : "outline"
            }`}
            onClick={() => setType("lightning")}
          >
            lightning
          </button>

          <button
            className={`${styles["margin-horizontal"]} ${
              type === "bitcoin" ? "" : "outline"
            }`}
            onClick={() => setType("bitcoin")}
          >
            bitcoin (on-chain)
          </button>
        </div>

        <div className={styles.block}>
          {type === "lightning" && (
            <div className={styles.columns}>
              <div className={styles.flex}>
                <h3>lnurl</h3>

                <Image alt="lnurl" src="/lnurl.png" width={200} height={200} />

                <div className={styles["margin-top"]}>
                  <span>
                    {lnurl}{" "}
                    <CopyIcon
                      className={styles.copy}
                      onClick={() => navigator.clipboard.writeText(lnurl)}
                    />
                  </span>
                </div>
              </div>

              <div className={styles.flex}>
                <h3>lightning address</h3>
                <span>
                  {lightningAddress}{" "}
                  <CopyIcon
                    className={styles.copy}
                    onClick={() =>
                      navigator.clipboard.writeText(lightningAddress)
                    }
                  />
                </span>
              </div>
            </div>
          )}

          {type === "bitcoin" && (
            <div className={styles.columns}>
              <div className={styles.center}>
                <h3>bitcoin address</h3>

                <Image alt="bitcoin" src="/btc.png" width={200} height={200} />

                <div className={styles["margin-top"]}>
                  <span>
                    {btcAddress}{" "}
                    <CopyIcon
                      className={styles.copy}
                      onClick={() => navigator.clipboard.writeText(btcAddress)}
                    />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
