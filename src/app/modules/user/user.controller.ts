/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import { CatchAsyncError } from "../../utils/CatchAsyncError";
import { userServices } from "./user.service";
import sendRes from "../../utils/sendResponse";

const registerUser = CatchAsyncError(async (req: Request, res: Response) => {
  const userData = req.body;
  const username = userData?.email?.split("@")[0];
  const userCreateData = { ...userData, username };
  const result = await userServices.registerUserIntoDB(userCreateData);

  sendRes(res, {
    success: true,
    statusCode: 201,
    message: "User registered successfully",
    data: result,
  });
});

const googleAuthRegisterUser = CatchAsyncError(
  async (req: Request, res: Response) => {
    const result = await userServices.registerAuthUserIntoDB(req.body);

    sendRes(res, {
      success: true,
      statusCode: 201,
      message: "Login with google account successful.",
      data: result,
    });
  },
);

export const userControllers = {
  registerUser,
  googleAuthRegisterUser,
};
