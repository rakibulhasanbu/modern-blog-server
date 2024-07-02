import { Request, Response } from "express";
import { CatchAsyncError } from "../../utils/CatchAsyncError";
import { authServices } from "./auth.service";
import sendRes from "../../utils/sendResponse";

const loginUser = CatchAsyncError(async (req: Request, res: Response) => {
  const result = await authServices.loginUserIntoDB(req.body);

  sendRes(res, {
    success: true,
    statusCode: 200,
    message: "User login successful",
    data: result,
  });
});

const changePassword = CatchAsyncError(async (req: Request, res: Response) => {
  const result = await authServices.changePasswordIntoDB(req.body, req.user);
  if (!result) {
    sendRes(res, {
      success: false,
      statusCode: 400,
      message:
        "Password change failed. Ensure the new password is unique and not among the last two used",
      data: null,
    });
  }
  sendRes(res, {
    success: true,
    statusCode: 200,
    message: "Password changed successfully",
    data: result,
  });
});

export const authControllers = { loginUser, changePassword };
