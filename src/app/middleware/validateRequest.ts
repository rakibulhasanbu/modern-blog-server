import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import { CatchAsyncError } from "../utils/CatchAsyncError";

const validateRequest = (schema: AnyZodObject) => {
  return CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      await schema.parseAsync({
        body: req.body,
      });
      next();
    },
  );
};

export default validateRequest;
