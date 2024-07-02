import { TNotification } from "./notification.interface";
import Notification from "./notification.model";

const createNotificationIntoDB = async (notification: TNotification) => {
  return await Notification.create(notification);
};

const getAllNotificationFromDB = async () => {
  const result = await Notification.find().populate({
    path: "createdBy",
    select: "_id name email role",
  });
  return {
    categories: result,
  };
};

export const notificationServices = {
  createNotificationIntoDB,
  getAllNotificationFromDB,
};
