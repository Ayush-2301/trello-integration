import { z } from "zod";

export const accessTokenSchema = z.object({
  accesstoken: z.string().min(1, "Please enter your access token"),
});
export type AccessTokenForm = z.infer<typeof accessTokenSchema>;
