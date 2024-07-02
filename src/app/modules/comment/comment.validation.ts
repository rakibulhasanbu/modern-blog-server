import { z } from "zod";

// Define the comment validation schema
const commentValidationSchema = z.object({
  blog_author: z.string().min(1, "Blog author ID is required"),
  comment: z.string().trim().min(1, "Comment is required"),
  children: z.array(z.string()).optional(),
  commented_by: z.string().min(1, "Commented by user ID is required"),
  isReply: z.boolean().optional(),
  parent: z.string().optional(),
});

export const commentValidation = { commentValidationSchema };
