import mongoose from "mongoose";

const handleCastError = (err: mongoose.Error.CastError) => {
  const statusCode = 400;
  const errorMessage = `${err.value} is not a valid ID!`;

  return {
    statusCode,
    message: "Invalid ID",
    errorMessage,
    errorDetails: err,
  };
};

export default handleCastError;
