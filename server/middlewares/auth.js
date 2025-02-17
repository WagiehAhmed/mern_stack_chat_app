import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import expressAsyncHandler from "express-async-handler";
import i18next from "i18next";
const auth = expressAsyncHandler(async (request, response, next) => {
  if (request?.cookies?.accessToken) {
    let verifiedToken;
    try {
      verifiedToken = jwt.verify(
        request.cookies.accessToken,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return response.status(401).json({ message:error.message });
    }

    if (!verifiedToken) {
      return response.status(401).json({ message: i18next.t("invalidToken") });
    }
    let user = await User.findById(verifiedToken._id);
    request.user = user;
    next();
  }
  if (!request?.cookies?.accessToken) {
    return response.status(401).json({ message: i18next.t("unAuthorized") });
  }
});
export default auth;

