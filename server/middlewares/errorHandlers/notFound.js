import AppError from "../../utils/AppError.js";
function notFound(req, res, next) {
  return next(new AppError(`This Route ${req.originalUrl} Not Found.`, 404));
}
export default notFound;
