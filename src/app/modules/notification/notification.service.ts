import { JwtPayload } from "jsonwebtoken";
import { TGetNotificationQuery, TNotification } from "./notification.interface";
import Notification from "./notification.model";
import User from "../auth/auth.model";
import { QueryOptions } from "mongoose";
import QueryBuilder from "@builder/QueryBuilder";
import AppError from "@error/AppError";
import { TTokenUser } from "../auth/auth.interface";

const createNotificationIntoDB = async (notification: TNotification) => {
  return await Notification.create(notification);
};

const getNotificationByUserIDFromDB = async (
  user: TTokenUser | JwtPayload,
  query: QueryOptions,
) => {
  const maxLimit = 10;
  const { filter, page, deletedDocCount } = query;

  let skipDocs = (page - 1) * maxLimit;

  const findQuery: TGetNotificationQuery = {
    notificationFor: user.id,
    user: { $ne: user?.id },
  };

  if (filter !== "all") {
    findQuery.type = filter;
  }
  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  const notificationQuery = new QueryBuilder(
    Notification.find(findQuery)
      .skip(skipDocs)
      .populate({
        path: "blog",
        select: "title blogId",
      })
      .populate({
        path: "user",
        select:
          "personalInfo.fullName personalInfo.username personalInfo.profileImg",
      })
      .populate({
        path: "comment",
        select: "comment",
      })
      .populate({
        path: "repliedOnComment",
        select: "comment",
      })
      .populate({
        path: "reply",
        select: "comment",
      })
      .select("createdAt type seen reply"),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await notificationQuery.modelQuery;
  const meta = await notificationQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getNewNotificationFromDB = async (user: TTokenUser | JwtPayload) => {
  const { id } = user;
  const isUserExist = await User.findById(id);
  if (!isUserExist) {
    throw new AppError(404, "User not Exist!");
  }

  const result = await Notification.exists({
    notificationFor: id,
    seen: false,
    user: { $ne: id },
  });

  if (!result) {
    throw new AppError(400, "Notification error");
  } else if (result) {
    return { newNotificationAvailable: true };
  } else {
    return { newNotificationAvailable: false };
  }
};

export const notificationServices = {
  createNotificationIntoDB,
  getNotificationByUserIDFromDB,
  getNewNotificationFromDB,
};
