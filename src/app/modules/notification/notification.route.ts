import express from "express";
import { notificationController } from "./notification.controller";
import validateRequest from "../../middleware/validateRequest";
import { notificationValidation } from "./notification.validation";
import auth from "../../middleware/auth";

const notificationRoute = express.Router();

notificationRoute.post(
  "/notifications",
  auth(),
  validateRequest(notificationValidation.notificationValidationSchema),
  notificationController.createNotification,
);

notificationRoute.get(
  "/notifications",
  notificationController.getAllNotification,
);

export default notificationRoute;
