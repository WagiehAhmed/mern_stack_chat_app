import AppError from "../../utils/AppError.js";

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const status = error.status || "error";

  // invalid id
  if (error.name === "CastError") {
    error = new AppError(`invalid ${error.path} : ${error.value}.`, 400);
  }
  // duplication feild
  if (error.code === 11000) {
    error = new AppError(`duplicated feild.`, 400);
  }
  // validation feild
  if (error.name === "validationError") {
    error = new AppError(
      Object.values(error.errors)
        .map((err) => err.message)
        .join(", "),
      400
    );
  }

  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      status,
      error,
      message: error.message,
      stack: error.stack,
    });
  } else if (process.env.NODE_ENV === "production") {
    if (error.isOperational) {
      return res.status(statusCode).json({
        status,
        message: error.message,
      });
    } else {
      return res.status(500).json({
        status: "error",
        message: "Something went wrong!",
      });
    }
  }
}

export default errorHandler;
