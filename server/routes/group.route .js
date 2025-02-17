import express from "express";
import { upload } from "../utils/uploadImage.js";
import auth from "../middlewares/auth.js";
import { uploadGroupAvatar } from "../controllers/group.controller.js";
const groupRouter = express.Router();

groupRouter.post(
  "/upload-group-avatar",
  upload.single("avatar"),
  auth,
  uploadGroupAvatar
);

export default groupRouter;
