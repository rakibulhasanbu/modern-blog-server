import AppError from "../../../error/AppError";
import User from "./auth.model";
import {
  TAuthUser,
  TChangePassword,
  TLogIn,
  TTokenUser,
  TUpdateProfilePayload,
  TUser,
} from "./auth.interface";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../../config";
import { QueryOptions } from "mongoose";
import cloudinary from "cloudinary";
import { getAuth } from "firebase-admin/auth";
import QueryBuilder from "../../../builder/QueryBuilder";

const loginUserIntoDB = async (payload: TLogIn) => {
  //checking if the user is exists
  const user = await User.findOne({
    "personalInfo.email": payload.email,
  }).select("+personalInfo.password");

  if (!user) {
    throw new AppError(404, `${payload.email} this user email not found!`);
  }

  if (user?.googleAuth) {
    throw new AppError(
      403,
      `Account was created using google. Try to log in with google!`,
    );
  }
  //checking if the password is matched
  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.personalInfo.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(404, `Password is not correct!`);
  }

  const jwtPayload = {
    id: user._id,
    username: user.personalInfo.username,
    email: user.personalInfo.email,
    fullName: user.personalInfo.fullName,
    profileImg: user.personalInfo.profileImg,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: "1d",
  });

  return {
    user: {
      id: user._id,
      username: user.personalInfo.username,
      email: user.personalInfo.email,
      fullName: user.personalInfo.fullName,
      profileImg: user.personalInfo.profileImg,
    },
    token: accessToken,
  };
};

const changePasswordIntoDB = async (
  payload: TChangePassword,
  userData: JwtPayload,
) => {
  const user = await User.findById(userData?.id).select(
    "+personalInfo.password +personalInfo.oldPassword +personalInfo.moreOldPassword",
  );
  if (!user) {
    throw new AppError(401, `Your provided Token is not valid user!`);
  }

  if (user.googleAuth) {
    throw new AppError(
      403,
      `You can't change account password because you logged in through google!`,
    );
  }

  if (payload.currentPassword === payload.newPassword) {
    return null;
  }

  //checking if the current password is matched
  const isPasswordMatched = await bcrypt.compare(
    payload.currentPassword,
    user.personalInfo.password,
  );
  if (!isPasswordMatched) {
    return null;
  }

  const isMatchWithOldPassword = await bcrypt.compare(
    payload.newPassword,
    user.personalInfo.oldPassword as string,
  );
  const isMatchWithMoreOldPassword = await bcrypt.compare(
    payload.newPassword,
    user.personalInfo.moreOldPassword as string,
  );

  if (isMatchWithOldPassword || isMatchWithMoreOldPassword) {
    return null;
  }

  const hashPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt),
  );

  return await User.findByIdAndUpdate(
    userData?._id,
    {
      password: hashPassword,
      oldPassword: user?.personalInfo.password,
      moreOldPassword: user?.personalInfo.oldPassword,
    },
    { new: true },
  );
};

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

  const data = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return {
    meta,
    data,
  };
};

const getUserByUsernameFromDB = async (username: string) => {
  return await User.findOne({ "personalInfo.username": username }).select(
    "-personalInfo.password -personalInfo.moreOldPassword -personalInfo.oldPassword -updatedAt -blogs",
  );
};

const updateUserProfile = async (
  user: TTokenUser | JwtPayload,
  payload: TUpdateProfilePayload,
) => {
  const { profileImg, bio, socialLinks } = payload;
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
  // if (username) {
  //   const updateProfileUsername = await User.findByIdAndUpdate(
  //     user?.id,
  //     { "personalInfo.username": username },
  //     { new: true, runValidators: true },
  //   );
  //   if (!updateProfileUsername) {
  //     throw new AppError(
  //       400,
  //       `${username} is not available. Username Must be unique!`,
  //     );
  //   }
  // }
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
    const socialLinksArray = Object.keys(socialLinks) as Array<
      keyof typeof socialLinks
    >;

    for (let i = 0; i < socialLinksArray.length; i++) {
      const key = socialLinksArray[i];
      if (socialLinks[key].length) {
        const hostname = new URL(socialLinks[key]).hostname;

        if (!hostname.includes(`${key}.com`) && key !== "website") {
          throw new AppError(
            403,
            `${key} link is invalid. You must enter a valid URL`,
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

export const authServices = {
  loginUserIntoDB,
  changePasswordIntoDB,
  registerUserIntoDB,
  updateUserProfile,
  getUserByUsernameFromDB,
  getUsersFromDB,
  registerAuthUserIntoDB,
};
