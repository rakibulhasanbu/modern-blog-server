import { z } from "zod";

// Define the comment validation schema
const commentValidationSchema = z.object({
  body: z.object({
    blogId: z.string().min(1),
    blogAuthor: z.string().min(1, "Blog author ID is required"),
    comment: z.string().trim().min(1, "Comment is required"),
    children: z.array(z.string()).optional(),
    isReply: z.boolean().optional(),
    parent: z.string().optional(),
  }),
});

export const commentValidation = { commentValidationSchema };
