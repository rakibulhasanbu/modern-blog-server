import express from "express";
import { userControllers } from "./user.controller";
import validateRequest from "../../middleware/validateRequest";
import { userValidations } from "./user.validation";

const userRoute = express.Router();

userRoute.post(
  "/register",
  validateRequest(userValidations.registerUserValidation),
  userControllers.registerUser,
);

export default userRoute;
