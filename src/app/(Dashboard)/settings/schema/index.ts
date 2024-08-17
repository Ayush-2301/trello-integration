import { z } from "zod";

export const accessTokenSchema = z.object({
  accesstoken: z.string().min(1, "Please enter your access token"),
  boardTitle: z.string().optional(),
});
export type AccessTokenForm = z.infer<typeof accessTokenSchema>;

export const updateSchema = z.object({
  accesstoken: z.string().min(1, "Please enter your access token"),
  boardTitle: z.string(),
});
export type UpdateSchemaForm = z.infer<typeof updateSchema>;
