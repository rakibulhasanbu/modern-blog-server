import config from "../../config";
import AppError from "../../error/AppError";
import User from "../user/user.model";
import { TChangePassword, TLogIn } from "./auth.interface";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

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
  const user = await User.findById(userData?._id).select(
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

export const authServices = { loginUserIntoDB, changePasswordIntoDB };
