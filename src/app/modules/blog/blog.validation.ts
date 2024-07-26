import { z } from "zod";

// Define the activity validation schema
const activitySchema = z.object({
  total_likes: z.number().default(0).optional(),
  total_comments: z.number().default(0).optional(),
  total_reads: z.number().default(0).optional(),
  total_parent_comments: z.number().default(0).optional(),
});

const blogValidationSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(1, "Title is required"),
      banner: z.string(),
      description: z.string().optional(),
      content: z.array(z.any()).optional(),
      tags: z.array(z.string()).max(10).optional(),
      author: z.string().trim().min(1, "Author ID is required"),
      activity: activitySchema.optional(),
      comments: z.array(z.string()).optional(),
      draft: z.boolean().default(false).optional(),
    })
    .refine(
      (data) =>
        data.draft || (data.description && data.description.trim().length > 0),
      {
        message: "Description is required when draft is false",
        path: ["description"],
      },
    )
    .refine((data) => data.draft || (data.content && data.content.length > 0), {
      message: "Content is required when draft is false",
      path: ["content"],
    })
    .refine(
      (data) => data.draft || (data.tags && Object.keys(data.tags).length > 0),
      {
        message: "Tags is required when draft is false",
        path: ["tags"],
      },
    ),
});

export const blogValidation = { blogValidationSchema };
