import { z } from "zod";

export const deviceSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
});

export const devicesSchema = z.array(deviceSchema);
