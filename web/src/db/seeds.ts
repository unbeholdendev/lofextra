import { generateNewAccountKeyPair } from "@/utils/account";
import { SelectRow, utils } from "./db";

export const getCurrentAccountPubKey = async (
  promiser: (..._args: unknown[]) => Promise<unknown>
): Promise<string | undefined> => {
  const result: { pubKey: string }[] = [];

  await promiser("exec", {
    sql: "select * from accounts order by id desc limit 1",
    callback: (res: SelectRow) => utils.mergeSelect(res, result),
  });

  return result[0]?.pubKey;
};

const seedAccount = async (
  promiser: (..._args: unknown[]) => Promise<unknown>
) => {
  const currentPubKey = await getCurrentAccountPubKey(promiser);

  if (currentPubKey) {
    return;
  }

  const { privKey, pubKey } = generateNewAccountKeyPair();

  await promiser("exec", {
    sql: `insert into accounts (privKey, pubKey, createdAt, updatedAt) values ('${privKey}', '${pubKey}', strftime('%s', 'now')*1000, strftime('%s', 'now')*1000)`,
  });
};

const seedDevice = async (
  promiser: (..._args: unknown[]) => Promise<unknown>
) => {
  const result: { id: number }[] = [];

  await promiser("exec", {
    sql: "select * from device",
    callback: (res: SelectRow) => utils.mergeSelect(res, result),
  });

  if (!result[0]) {
    await promiser("exec", {
      sql: `insert into device (id, createdAt) values ('${crypto.randomUUID()}', strftime('%s', 'now')*1000)`,
    });
  }
};

export const seed = async (
  promiser: (..._args: unknown[]) => Promise<unknown>
) => {
  await seedDevice(promiser);
  await seedAccount(promiser);
};
