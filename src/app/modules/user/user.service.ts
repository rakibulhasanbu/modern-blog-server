import config from "../../config";
import {
  TAuthUser,
  TTokenUser,
  TUpdateProfilePayload,
  TUser,
} from "./user.interface";
import User from "./user.model";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getAuth } from "firebase-admin/auth";
import AppError from "../../error/AppError";
import { QueryOptions } from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import cloudinary from "cloudinary";

const registerUserIntoDB = async (user: TUser) => {
  const createdUser = await User.create({
    personalInfo: { ...user },
  });

  const jwtPayload = {
    id: createdUser?._id,
    fullName: createdUser?.personalInfo.fullName,
    email: createdUser?.personalInfo.email,
    username: createdUser?.personalInfo.username,
    profileImg: createdUser?.personalInfo.profileImg,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: "1d",
  });

  const result = {
    accessToken,
    user: {
      id: createdUser?._id,
      fullName: createdUser?.personalInfo.fullName,
      email: createdUser?.personalInfo.email,
      username: createdUser?.personalInfo.username,
      profileImg: createdUser?.personalInfo.profileImg,
    },
  };

  return result;
};

const registerAuthUserIntoDB = async ({ accessToken }: TAuthUser) => {
  return await getAuth()
    .verifyIdToken(accessToken)
    .then(async (decodedUser) => {
      const picture = decodedUser?.picture?.replace("s96-c", "s384-c");

      let user = await User.findOne({
        "personalInfo.email": decodedUser?.email,
      })
        .select(
          "personalInfo.fullName personalInfo.email personalInfo.profileImg personalInfo.username googleAuth",
        )
        .then((usr) => {
          return usr || null;
        });

      if (user) {
        if (!user?.googleAuth) {
          throw new AppError(
            403,
            `This email was already signed up without google. Please log in with password to access this account.`,
          );
        }
      } else {
        const username = decodedUser?.email?.split("@")[0];
        user = new User({
          personalInfo: {
            fullName: decodedUser?.name,
            email: decodedUser?.email,
            profileImg: picture,
            username,
            password: "googleAuth",
          },
          googleAuth: true,
        });

        await user.save().then((u) => {
          user = u;
        });
      }
      const tokenCreateUserData = {
        id: user?._id,
        fullName: user?.personalInfo.fullName,
        email: user?.personalInfo.email,
        username: user?.personalInfo.username,
        profileImg: user?.personalInfo.profileImg,
      };
      const createAccessToken = jwt.sign(
        tokenCreateUserData,
        config.jwt_access_secret as string,
        {
          expiresIn: "1d",
        },
      );

      const result = {
        accessToken: createAccessToken,
        user: tokenCreateUserData,
      };

      return result;
    });
};

const getUsersFromDB = async (query: QueryOptions) => {
  const userQuery = new QueryBuilder(
    User.find().select(
      "personalInfo.fullName personalInfo.username personalInfo.profileImg -_id",
    ),
    query,
  )
    .search(["personalInfo.username", "personalInfo.fullName"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getUserByUsernameFromDB = async (username: string) => {
  return await User.findOne({ "personalInfo.username": username }).select(
    "-personalInfo.password -personalInfo.moreOldPassword -personalInfo.oldPassword -googleAuth -updatedAt -blogs",
  );
};

const updateUserProfile = async (
  user: TTokenUser | JwtPayload,
  payload: TUpdateProfilePayload,
) => {
  const { profileImg, bio, username, socialLinks } = payload;
  const isUserExist = await User.findById(user?.id);
  if (!isUserExist) {
    throw new AppError(404, "User not Exist!");
  }

  if (profileImg) {
    const myCloud = await cloudinary.v2.uploader.upload(profileImg, {
      folder: "profile_img",
    });
    if (!myCloud.secure_url) {
      throw new AppError(400, "Failed to update profile!");
    }
    const updateProfileImage = await User.findByIdAndUpdate(
      user?.id,
      { "personalInfo.profileImg": myCloud.secure_url },
      { new: true, runValidators: true },
    );
    if (!updateProfileImage) {
      throw new AppError(400, "Failed to update profile!");
    }
  }
  if (username) {
    const updateProfileUsername = await User.findByIdAndUpdate(
      user?.id,
      { "personalInfo.username": username },
      { new: true, runValidators: true },
    );
    if (!updateProfileUsername) {
      throw new AppError(
        400,
        `${username} is not available. Username Must be unique!`,
      );
    }
  }
  if (bio) {
    const updateProfileBio = await User.findByIdAndUpdate(
      user?.id,
      { "personalInfo.bio": bio },
      { new: true, runValidators: true },
    );
    if (!updateProfileBio) {
      throw new AppError(400, "Failed to update profile!");
    }
  }
  if (socialLinks) {
    const socialLinksArray = Object.keys(socialLinks);

    for (let i = 0; i < socialLinksArray.length; i++) {
      if (socialLinks[socialLinksArray[i]].length) {
        const hostname = new URL(socialLinks[socialLinksArray[i]]).hostname;

        if (
          !hostname.includes(`${socialLinksArray[i]}.com`) &&
          socialLinksArray[i] !== "website"
        ) {
          throw new AppError(
            403,
            `${socialLinksArray[i]} link is invalid. You must enter a valid url`,
          );
        }
      }
    }

    const updateProfileSocialLinks = await User.findByIdAndUpdate(
      user?.id,
      { socialLinks },
      { new: true, runValidators: true },
    );
    if (!updateProfileSocialLinks) {
      throw new AppError(400, "Failed to update profile!");
    }
  }
};

export const userServices = {
  registerUserIntoDB,
  registerAuthUserIntoDB,
  getUserByUsernameFromDB,
  getUsersFromDB,
  updateUserProfile,
};
