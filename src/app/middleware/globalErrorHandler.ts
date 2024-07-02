/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import handleZodError from "../error/handleZodError";
import handleValidationError from "../error/handleValidationError";
import handleCastError from "../error/handleCastError";
import handleDuplicateError from "../error/handleDuplicateError";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err?.statusCode || 500;
  let message = err?.message || "Something went wrong!";
  let errorMessage =
    err?.errorMessage ||
    "Something went wrong in te server when validation or Retrieve!";
  let errorDetails: unknown = [
    {
      path: "",
      message: "Something went wrong!",
    },
  ];
  let stack = err?.stack;

  if (err?.statusCode === 401) {
    message = "Unauthorized Access";
    errorMessage =
      "You do not have the necessary permissions to access this resource.";
    errorDetails = null;
    stack = null;
  } else if (err?.name === "JsonWebTokenError") {
    message = "Unauthorized Access";
    errorMessage =
      "You do not have the necessary permissions to access this resource.";
    errorDetails = null;
    stack = null;
  } else if (err instanceof ZodError) {
    const simpleError = handleZodError(err);
    statusCode = simpleError.statusCode;
    message = simpleError.message;
    errorMessage = simpleError.errorMessage;
    errorDetails = simpleError?.errorDetails;
  } else if (err?.name === "ValidationError") {
    const simpleError = handleValidationError(err);
    statusCode = simpleError.statusCode;
    message = simpleError.message;
    errorMessage = simpleError.errorMessage;
    errorDetails = simpleError.errorDetails;
  } else if (err?.name === "CastError") {
    const simpleError = handleCastError(err);
    statusCode = simpleError?.statusCode;
    message = simpleError?.message;
    errorMessage = simpleError.errorMessage;
    errorDetails = simpleError?.errorDetails;
  } else if (err?.code === 11000) {
    const simpleError = handleDuplicateError(err);
    statusCode = simpleError?.statusCode;
    message = simpleError?.message;
    errorMessage = simpleError.errorMessage;
    errorDetails = simpleError?.errorDetails;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorMessage,
    errorDetails,
    stack: stack,
  });
};

export default globalErrorHandler;
