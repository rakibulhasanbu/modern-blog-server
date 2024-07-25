/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import { CatchAsyncError } from "../../utils/CatchAsyncError";
import { userServices } from "./user.service";
import sendResponse from "../../utils/sendResponse";

const registerUser = CatchAsyncError(async (req: Request, res: Response) => {
  const userData = req.body;
  const username = userData?.email?.split("@")[0];
  const userCreateData = { ...userData, username };
  const result = await userServices.registerUserIntoDB(userCreateData);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "User registered successfully",
    data: result,
  });
});

const googleAuthRegisterUser = CatchAsyncError(
  async (req: Request, res: Response) => {
    const result = await userServices.registerAuthUserIntoDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Login with google account successful.",
      data: result,
    });
  },
);

const getUsers = CatchAsyncError(async (req: Request, res: Response) => {
  const result = await userServices.getUsersFromDB(req.query);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Users retrieved successfully",
    data: result,
  });
});

const getUserByUsername = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { username } = req.params;
    const result = await userServices.getUserByUsernameFromDB(username);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User retrieved successfully",
      data: result,
    });
  },
);

const updateUserProfile = CatchAsyncError(
  async (req: Request, res: Response) => {
    const result = await userServices.updateUserProfile(req.user, req.body);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User profile updated successfully",
      data: result,
    });
  },
);

export const userControllers = {
  registerUser,
  getUsers,
  googleAuthRegisterUser,
  getUserByUsername,
  updateUserProfile,
};
