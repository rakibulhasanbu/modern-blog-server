import { Request, Response } from "express";
import { CatchAsyncError } from "../../utils/CatchAsyncError";
import { notificationServices } from "./notification.service";

const createNotification = CatchAsyncError(
  async (req: Request, res: Response) => {
    const notification = req.body;
    notification.createdBy = req.user._id;

    const result =
      await notificationServices.createNotificationIntoDB(notification);
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Notification created successfully",
      data: result,
    });
  },
);

const getAllNotification = CatchAsyncError(
  async (req: Request, res: Response) => {
    const result = await notificationServices.getAllNotificationFromDB();
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Categories retrieved successfully",
      data: result,
    });
  },
);

export const notificationController = {
  createNotification,
  getAllNotification,
};
