import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../utils/CatchAsyncError";
import AppError from "../error/AppError";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import User from "../modules/user/user.model";

const auth = () => {
  return CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      //if the token is send from the client
      const token = req.headers.authorization;
      if (!token) {
        throw new AppError(401, "You are not Authorized!");
      }

      //check if the token is valid
      const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;

      const user = await User.findById(decoded?._id);
      if (!user) {
        throw new AppError(401, `Your provided Token is not valid user!`);
      }
      //checking required role are write or wrong
      // if (roles && !roles.includes(decoded.role)) {
      //   throw new AppError(401, "You are not Authorized!");
      // }

      req.user = decoded as JwtPayload;
      next();
    },
  );
};

export default auth;
