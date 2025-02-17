import expressAsyncHandler from "express-async-handler";
import { deleteFile, saveFile } from "../utils/uploadImage.js";
import i18next from "i18next";

/**
 * @param {object} messagesMediaFiles
 * @returns {object} - response
 */
export const uploadMessageMedia = expressAsyncHandler(
  async (request, response) => {
    console.log("AUDIO :: ", request.files);
    const { image, video, audio } = request.files;

    let imagePath = "";
    if (image) {
      imagePath = await saveFile(image?.[0], "messages/images");
    }
    let videoPath = "";
    if (video) {
      videoPath = await saveFile(video?.[0], "messages/videos");
    }
    let audioPath = "";
    if (audio) {
      audioPath = await saveFile(audio?.[0], "messages/audios");
    }

    return response.status(201).json({
      message: i18next.t("messageFilesUploadSuccess"),
      image: {
        filePath: imagePath,
        fileType: image?.[0]?.mimetype,
      },
      video: {
        filePath: videoPath,
        fileType: video?.[0].mimetype,
      },
      audio: {
        filePath: audioPath,
        fileType: audio?.[0].mimetype,
      },
    });
  }
);
