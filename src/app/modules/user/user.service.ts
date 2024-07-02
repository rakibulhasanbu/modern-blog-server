import config from "../../config";
import { TUser } from "./user.interface";
import User from "./user.model";
import jwt from "jsonwebtoken";

const registerUserIntoDB = async (user: TUser) => {
  const createdUser = await User.create({
    personalInfo: { ...user },
  });

  const jwtPayload = {
    id: createdUser?._id,
    email: createdUser?.personalInfo.email,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: "1d",
  });

  const result = {
    token: accessToken,
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

export const userServices = {
  registerUserIntoDB,
};
