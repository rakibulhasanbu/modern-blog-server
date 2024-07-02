import { z } from "zod";

const notificationValidationSchema = z.object({
  body: z.object({
    type: z.enum(["like", "comment", "reply"]),
    blog: z.string().regex(/^[0-9a-fA-F]{24}$/),
    notification_for: z.string().regex(/^[0-9a-fA-F]{24}$/),
    user: z.string().regex(/^[0-9a-fA-F]{24}$/),
    comment: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    reply: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    replied_on_comment: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    seen: z.boolean().optional(),
  }),
});

export const notificationValidation = { notificationValidationSchema };
