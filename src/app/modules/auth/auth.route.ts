import express from "express";
import validateRequest from "../../middleware/validateRequest";
import { authValidations } from "./auth.validation";
import { authControllers } from "./auth.controller";
import auth from "../../middleware/auth";

const authRoute = express.Router();

authRoute.post(
  "/login",
  validateRequest(authValidations.logInValidation),
  authControllers.loginUser,
);

authRoute.post(
  "/change-password",
  auth(),
  validateRequest(authValidations.changePasswordValidation),
  authControllers.changePassword,
);

export default authRoute;
