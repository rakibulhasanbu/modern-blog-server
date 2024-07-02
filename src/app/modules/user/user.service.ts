import { TUser } from "./user.interface";
import User from "./user.model";

const registerUserIntoDB = async (user: TUser) => {
  return await User.create(user);
};

export const userServices = {
  registerUserIntoDB,
};
