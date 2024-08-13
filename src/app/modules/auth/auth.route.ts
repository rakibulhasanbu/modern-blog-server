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

authRoute.post(
  "/register",
  validateRequest(authValidations.registerUserValidation),
  authControllers.registerUser,
);

authRoute.post(
  "/google-auth",
  validateRequest(authValidations.googleAuthValidation),
  authControllers.googleAuthRegisterUser,
);

authRoute.get("/users", authControllers.getUsers);

authRoute.put("/update-profile", auth(), authControllers.updateUserProfile);

authRoute.get("/user/:username", auth(), authControllers.getUserByUsername);

export default authRoute;
