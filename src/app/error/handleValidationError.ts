import { Error } from "mongoose";
import { TErrorResponse, TErrorSources } from "../interface/error.interface";

const handleValidationError = (
  error: Error.ValidationError,
): TErrorResponse => {
  const statusCode = 400;
  const errorDetails: TErrorSources[] = Object.values(error?.errors).map(
    (value: Error.ValidatorError | Error.CastError) => {
      return {
        path: value?.path,
        message: value?.message,
      };
    },
  );
  const errorMessage = errorDetails.reduce(
    (acc, curr) => acc + ` ${curr.path} is required.`,
    "",
  );
  return {
    statusCode,
    message: error?.message,
    errorMessage,
    errorDetails,
  };
};
export default handleValidationError;
