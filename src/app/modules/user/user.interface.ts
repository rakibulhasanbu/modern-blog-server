import { Schema } from "mongoose";

type SocialLinks = {
  youtube?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  github?: string;
  website?: string;
};

type AccountInfo = {
  totalPosts: number;
  totalReads: number;
};

type PersonalInfo = {
  fullName: string;
  email: string;
  password: string;
  oldPassword?: string;
  moreOldPassword?: string;
  username: string;
  bio?: string;
  profileImg?: string;
};

export type TUser = {
  personalInfo: PersonalInfo;
  socialLinks: SocialLinks;
  accountInfo: AccountInfo;
  googleAuth: boolean;
  blogs: Schema.Types.ObjectId[];
};

export type TAuthUser = {
  accessToken: string;
};

export type TTokenUser = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  profileImg: string;
};

export type TUpdateProfilePayload = {
  profileImg: string;
  bio: string;
  username: string;
  socialLinks: {
    facebook: string;
    github: string;
    instagram: string;
    twitter: string;
    website: string;
    youtube: string;
  };
};
