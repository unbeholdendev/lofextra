import { HLC } from "@/contexts/HlcContext";

export const inc = (local: HLC, now: number): HLC => {
  if (now > local.ts) {
    return { ...local, ts: now, count: 0 };
  }

  return { ...local, count: local.count + 1 };
};

export const recv = (local: HLC, remote: HLC, now: number): HLC => {
  if (now > local.ts && now > remote.ts) {
    return { ...local, ts: now, count: 0 };
  }

  if (local.ts === remote.ts) {
    return { ...local, count: Math.max(local.count, remote.count) + 1 };
  } else if (local.ts > remote.ts) {
    return { ...local, count: local.count + 1 };
  } else {
    return { ...local, ts: remote.ts, count: remote.count + 1 };
  }
};

export const serialize = ({ ts, count, deviceId }: HLC) => {
  return (
    ts.toString().padStart(15, "0") +
    ":" +
    count.toString(36).padStart(5, "0") +
    ":" +
    deviceId
  );
};

export const deserialize = (serialized: string) => {
  const [ts, count, ...deviceId] = serialized.split(":");

  return {
    ts: parseInt(ts),
    count: parseInt(count, 36),
    deviceId: deviceId.join(":"),
  };
};
