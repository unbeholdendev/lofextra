import { generateNewAccountKeyPair } from "../utils/account";
import { sqlocal } from "./sqlocal";

export const getCurrentAccountPubKey = async () => {
  const data = await sqlocal.sql(
    "SELECT * FROM accounts ORDER BY id DESC LIMIT 1"
  );

  return data[0]?.pubKey;
};

const seedAccount = async () => {
  const currentPubKey = await getCurrentAccountPubKey();

  if (currentPubKey) {
    return;
  }

  const { privKey, pubKey } = generateNewAccountKeyPair();

  await sqlocal.sql(
    `INSERT INTO accounts (privKey, pubKey, createdAt, updatedAt) VALUES ('${privKey}', '${pubKey}', strftime('%s', 'now')*1000, strftime('%s', 'now')*1000)`
  );
};

const seedDevice = async () => {
  const data = await sqlocal.sql("SELECT * FROM device");

  if (!data[0]) {
    await sqlocal.sql(
      `INSERT INTO device (id, createdAt) VALUES ('${crypto.randomUUID()}', strftime('%s', 'now')*1000)`
    );
  }
};

export const baseSeed = async () => {
  await seedDevice();
  await seedAccount();
};
