import { socket } from "@/io";
import { useCallback } from "react";
import { z } from "zod";
import { useDatabaseContext } from "./contexts";

export const usePushPendingUpdates = () => {
  const { exec } = useDatabaseContext();

  return useCallback(async () => {
    const pendingUpdates = await exec(
      "select * from pendingUpdates order by id"
    );

    if (!pendingUpdates.length) {
      return;
    }

    try {
      await socket.timeout(3000).emitWithAck(
        "messages",
        pendingUpdates.map((update) =>
          JSON.parse(z.string().parse(update.message))
        )
      );

      for (const update of pendingUpdates) {
        await exec(`delete from pendingUpdates where id = ${update.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  }, [exec]);
};
