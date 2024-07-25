import express from "express";
import { notificationController } from "./notification.controller";
import validateRequest from "../../middleware/validateRequest";
import { notificationValidation } from "./notification.validation";
import auth from "../../middleware/auth";

const notificationRoute = express.Router();

notificationRoute.post(
  "/notification",
  auth(),
  validateRequest(notificationValidation.notificationValidationSchema),
  notificationController.createNotification,
);

notificationRoute.get(
  "/notifications",
  auth(),
  notificationController.getNotificationByUserID,
);

notificationRoute.get(
  "/new-notification",
  auth(),
  notificationController.getNewNotification,
);

export default notificationRoute;
