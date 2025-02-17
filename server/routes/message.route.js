import express from "express";
import { upload } from "../utils/uploadImage.js";
import auth from "../middlewares/auth.js";
import { uploadMessageMedia } from "../controllers/message.controller.js";
const messageRouter = express.Router();

messageRouter.post(
  "/upload-image-media",
  upload.fields([{ name: "image" }, { name: "video" }, { name: "audio" }]),
  auth,
  uploadMessageMedia
);

export default messageRouter;
