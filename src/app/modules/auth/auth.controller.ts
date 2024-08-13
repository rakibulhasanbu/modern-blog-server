import { Request, Response } from "express";
import { authServices } from "./auth.service";
import { CatchAsyncError } from "@utils/CatchAsyncError";
import sendResponse from "@utils/sendResponse";
import AppError from "@error/AppError";

const loginUser = CatchAsyncError(async (req: Request, res: Response) => {
  const result = await authServices.loginUserIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User login successful",
    data: result,
  });
});

const changePassword = CatchAsyncError(async (req: Request, res: Response) => {
  const result = await authServices.changePasswordIntoDB(req.body, req.user);

  if (!result) {
    return new AppError(
      400,
      "Password change failed. Ensure the new password is unique and not among the last two used",
    );
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Password changed successfully",
    data: result,
  });
});

const registerUser = CatchAsyncError(async (req: Request, res: Response) => {
  const userData = req.body;
  const username = userData?.email?.split("@")[0];
  const userCreateData = { ...userData, username };
  const result = await authServices.registerUserIntoDB(userCreateData);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "User registered successfully",
    data: result,
  });
});

const googleAuthRegisterUser = CatchAsyncError(
  async (req: Request, res: Response) => {
    const result = await authServices.registerAuthUserIntoDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Login with google account successful.",
      data: result,
    });
  },
);

const getUsers = CatchAsyncError(async (req: Request, res: Response) => {
  const result = await authServices.getUsersFromDB(req.query);

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
    const result = await authServices.getUserByUsernameFromDB(username);

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
    const result = await authServices.updateUserProfile(req.user, req.body);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User profile updated successfully",
      data: result,
    });
  },
);

export const authControllers = {
  loginUser,
  changePassword,
  registerUser,
  updateUserProfile,
  getUserByUsername,
  getUsers,
  googleAuthRegisterUser,
};
