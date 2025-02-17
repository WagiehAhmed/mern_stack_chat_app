import { validationResult } from "express-validator";
import AppError from "../../utils/AppError.js";

export default function validator(request, response, next) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    const firstError = new AppError(errors.array()[0].msg, 400);
    return response.status(400).json({
      message: firstError.message,
      ...firstError,
    });
  }
  next();
}
