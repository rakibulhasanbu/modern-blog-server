const handleDuplicateError = (err: { message: string }) => {
  const match = err?.message.match(/"([^"]*)"/);

  const extractedId = match && match[1];

  const errorMessage = `${extractedId} this value is already taken, This field id unique!`;

  const statusCode = 400;

  const errorDetails = {
    stringValue: `${extractedId}`,
    valueType: "string",
    kind: "ObjectId",
    value: extractedId,
    path: match && match[0],
    reason: {},
    name: "CastError",
    message: match?.input,
  };

  return {
    statusCode,
    message: "Duplicate value",
    errorMessage,
    errorDetails,
  };
};

export default handleDuplicateError;
