export const handleError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    status: "fail",
    message: message,
  });
};
