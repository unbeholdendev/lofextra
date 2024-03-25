import styles from "./styles.module.css";

export default function Page() {
  return (
    <main className={styles.main}>
      <h1>frequently asked questions</h1>

      <section>
        <div className={styles.question}>what is this app about?</div>
        <div className={styles.answer}>
          lofextra allows you to track your and your family expenses in a secure
          and private way
        </div>

        <div className={styles.question}>how is the privacy achieved?</div>
        <div className={styles.answer}>
          all data is stored on your device and it is not accessible to anyone.
          the app leverages{" "}
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system"
            target="_blank"
            referrerPolicy="no-referrer"
          >
            opfs
          </a>{" "}
          to store data
        </div>

        <div className={styles.question}>
          what if i want to use lofextra on multiple devices?
        </div>
        <div className={styles.answer}>
          just type the mnemonic (12 words) on another device. all your data
          will sync automatically
        </div>

        <div className={styles.question}>how does the sync work?</div>
        <div className={styles.answer}>
          lofextra is using a server to sync updates. however, all your data is
          e2e encrypted using your private key (derived from mnemonic). only
          your other device with the same mnemonic set can decrypt the data
        </div>

        <div className={styles.question}>
          what happens if i lose the mnemonic?
        </div>
        <div className={styles.answer}>
          you will lose* access to your account. you should back it up carefully
        </div>
        <div className={styles.small}>
          *the data is stored on your device therefore it is possible to recover
          it, however advanced knowledge is required. lofextra aims to improve
          the UX in this regard by allowing you to export/import
        </div>

        <div className={styles.question}>can i use the app offline</div>
        <div className={styles.answer}>
          you certainly can. install the app as{" "}
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps"
            target="_blank"
            referrerPolicy="no-referrer"
          >
            PWA
          </a>
          , use it offline and your data will automatically sync with other
          devices when you are back online
        </div>

        <div className={styles.question}>why isn&apos;t this a mobile app?</div>
        <div className={styles.answer}>
          there are currently no benefits native mobile app would bring. you can
          install web version on your phone and use it like a native app
        </div>

        <div className={styles.question}>is something not working?</div>
        <div className={styles.answer}>
          please create an{" "}
          <a
            href="https://github.com/pycan-jouza/lofextra/issues"
            target="_blank"
            referrerPolicy="no-referrer"
          >
            issue
          </a>
        </div>
      </section>
    </main>
  );
}
