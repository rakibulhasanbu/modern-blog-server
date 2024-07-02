import { z } from "zod";

// Define the activity validation schema
const activitySchema = z.object({
  total_likes: z.number().default(0),
  total_comments: z.number().default(0),
  total_reads: z.number().default(0),
  total_parent_comments: z.number().default(0),
});

// Define the blog validation schema
const blogValidationSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  banner: z.string().optional(),
  des: z
    .string()
    .max(200, "Description must be 200 characters or less")
    .optional(),
  content: z.array(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().trim().min(1, "Author ID is required"),
  activity: activitySchema,
  comments: z.array(z.string()).optional(),
  draft: z.boolean().default(false),
});

export const blogValidation = { blogValidationSchema };
