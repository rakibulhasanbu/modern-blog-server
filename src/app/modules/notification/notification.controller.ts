import { Request, Response } from "express";
import { CatchAsyncError } from "../../utils/CatchAsyncError";
import { notificationServices } from "./notification.service";
import sendResponse from "../../utils/sendResponse";

const createNotification = CatchAsyncError(
  async (req: Request, res: Response) => {
    const notification = req.body;
    notification.createdBy = req.user._id;

    const result =
      await notificationServices.createNotificationIntoDB(notification);
    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Notification created successfully",
      data: result,
    });
  },
);

const getNotificationByUserID = CatchAsyncError(
  async (req: Request, res: Response) => {
    const result = await notificationServices.getNotificationByUserIDFromDB(
      req.user,
      req.query,
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Notifications retrieved successfully",
      data: result,
    });
  },
);

const getNewNotification = CatchAsyncError(
  async (req: Request, res: Response) => {
    const result = await notificationServices.getNewNotificationFromDB(
      req.user,
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Categories retrieved successfully",
      data: result,
    });
  },
);

export const notificationController = {
  createNotification,
  getNotificationByUserID,
  getNewNotification,
};
