import { z } from "zod/v4";

export const CredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
