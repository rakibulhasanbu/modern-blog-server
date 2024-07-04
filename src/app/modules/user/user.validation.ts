import { z } from "zod";

const personalInfoSchema = z
  .object({
    fullName: z.string().min(3, "Full name must be 3 letters long"),
    email: z.string().email(),
    password: z.string().min(6),
    bio: z
      .string()
      .max(200, "Bio should not be more than 200")
      .optional()
      .default(""),
    profileImg: z.string().optional(),
  })
  .optional();

const socialLinksSchema = z
  .object({
    youtube: z.string().optional().default(""),
    instagram: z.string().optional().default(""),
    facebook: z.string().optional().default(""),
    twitter: z.string().optional().default(""),
    github: z.string().optional().default(""),
    website: z.string().optional().default(""),
  })
  .optional();

const accountInfoSchema = z
  .object({
    totalPosts: z.number().default(0),
    totalReads: z.number().default(0),
  })
  .optional();

const registerUserValidation = z.object({
  body: z.object({
    personalInfo: personalInfoSchema,
    socialLinks: socialLinksSchema,
    accountInfo: accountInfoSchema,
    googleAuth: z.boolean().default(false),
    blogs: z.array(z.string()).default([]),
  }),
});

const googleAuthValidation = z.object({
  body: z.object({
    personalInfo: personalInfoSchema,
    socialLinks: socialLinksSchema,
    accountInfo: accountInfoSchema,
    googleAuth: z.boolean().default(false),
    blogs: z.array(z.string()).default([]),
  }),
});

export const userValidations = { googleAuthValidation, registerUserValidation };
