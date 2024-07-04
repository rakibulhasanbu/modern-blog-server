import config from "../../config";
import { TAuthUser, TUser } from "./user.interface";
import User from "./user.model";
import jwt from "jsonwebtoken";
import { getAuth } from "firebase-admin/auth";
import AppError from "../../error/AppError";

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

      const result = {
        accessToken,
        user: {
          id: user?._id,
          fullName: user?.personalInfo.fullName,
          email: user?.personalInfo.email,
          username: user?.personalInfo.username,
          profileImg: user?.personalInfo.profileImg,
        },
      };

      return result;
    });
};

export const userServices = {
  registerUserIntoDB,
  registerAuthUserIntoDB,
};
