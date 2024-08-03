import express from "express";
import { userControllers } from "./user.controller";
import validateRequest from "../../middleware/validateRequest";
import { userValidations } from "./user.validation";
import auth from "../../middleware/auth";

const userRoute = express.Router();

userRoute.post(
  "/register",
  validateRequest(userValidations.registerUserValidation),
  userControllers.registerUser,
);

userRoute.post(
  "/google-auth",
  validateRequest(userValidations.googleAuthValidation),
  userControllers.googleAuthRegisterUser,
);

userRoute.get("/users", userControllers.getUsers);

userRoute.put("/update-profile", auth(), userControllers.updateUserProfile);

userRoute.get("/user/:username", auth(), userControllers.getUserByUsername);

export default userRoute;
