import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
export default async function verifyToken(token) {
  if (!token) {
    return null;
  }
  try {
    const result = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(result._id);
    return user;
  } catch (error) {
    return null;
  }
}
