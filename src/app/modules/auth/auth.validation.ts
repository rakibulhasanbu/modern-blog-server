import { z } from "zod";

const logInValidation = z.object({
  body: z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6),
  }),
});

const changePasswordValidation = z.object({
  body: z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  }),
});

export const authValidations = { logInValidation, changePasswordValidation };
