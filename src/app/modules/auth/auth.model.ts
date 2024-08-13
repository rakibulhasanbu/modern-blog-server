import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { TUser } from "./auth.interface";
import config from "../../../config";

const profile_imgs_name_list = [
  "Garfield",
  "Tinkerbell",
  "Annie",
  "Loki",
  "Cleo",
  "Angel",
  "Bob",
  "Mia",
  "Coco",
  "Gracie",
  "Bear",
  "Bella",
  "Abby",
  "Harley",
  "Cali",
  "Leo",
  "Luna",
  "Jack",
  "Felix",
  "Kiki",
];

const profile_imgs_collections_list = [
  "notionists-neutral",
  "adventurer-neutral",
  "fun-emoji",
];

const userSchema = new Schema<TUser>(
  {
    personalInfo: {
      fullName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
      },
      password: {
        type: String,
        required: false,
        select: false,
      },
      oldPassword: {
        type: String,
        select: false,
      },
      moreOldPassword: {
        type: String,
        select: false,
      },
      username: {
        type: String,
        required: true,
        minlength: [3, "Username must be 3 letters long"],
        unique: true,
      },
      bio: {
        type: String,
        maxLength: [200, "Bio should not be more than 200"],
        default: "",
      },
      profileImg: {
        type: String,
        default: () => {
          return `https://api.dicebear.com/6.x/${
            profile_imgs_collections_list[
              Math.floor(Math.random() * profile_imgs_collections_list.length)
            ]
          }/svg?seed=${
            profile_imgs_name_list[
              Math.floor(Math.random() * profile_imgs_name_list.length)
            ]
          }`;
        },
      },
    },
    socialLinks: {
      youtube: {
        type: String,
        default: "",
      },
      instagram: {
        type: String,
        default: "",
      },
      facebook: {
        type: String,
        default: "",
      },
      twitter: {
        type: String,
        default: "",
      },
      github: {
        type: String,
        default: "",
      },
      website: {
        type: String,
        default: "",
      },
    },
    accountInfo: {
      totalPosts: {
        type: Number,
        default: 0,
      },
      totalReads: {
        type: Number,
        default: 0,
      },
    },
    googleAuth: {
      type: Boolean,
      default: false,
    },
    blogs: {
      type: [Schema.Types.ObjectId],
      ref: "Blog",
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: "joinedAt",
    },
    versionKey: false,
  },
);

//using document pre middleware
userSchema.pre("save", async function () {
  this.personalInfo.password = await bcrypt.hash(
    this.personalInfo.password,
    Number(config.bcrypt_salt),
  );
  this.personalInfo.oldPassword = this.personalInfo.password;
  this.personalInfo.moreOldPassword = this.personalInfo.password;
});

const User = model("User", userSchema);

export default User;
