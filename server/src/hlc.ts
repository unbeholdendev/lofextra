type HLC = {
  ts: number
  count: number
  deviceId: string
}

export const deserialize = (serialized: string): HLC => {
  const [ts, count, ...deviceId] = serialized.split(':')

  return {
    ts: parseInt(ts),
    count: parseInt(count, 36),
    deviceId: deviceId.join(':'),
  }
}

export const cmp = (one: HLC, two: HLC): number => {
  if (one.ts === two.ts) {
    if (one.count === two.count) {
      if (one.deviceId === two.deviceId) {
        return 0
      }

      return one.deviceId < two.deviceId ? -1 : 1
    }

    return one.count - two.count
  }

  return one.ts - two.ts
}
