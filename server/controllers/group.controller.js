import expressAsyncHandler from "express-async-handler";
import { saveFile } from "../utils/uploadImage.js";
import i18next from "i18next";

/**
 * @param {object} groupAvatarFile
 * @returns {object} - response
 */
export const uploadGroupAvatar = expressAsyncHandler(
  async (request, response) => {
    const avatar = request.file;

    let avatarPath = "";
    if (avatar) {
      avatarPath = await saveFile(avatar, "groups");
    }

    return response.status(201).json({
      message: i18next.t("groupAvatarUploadSuccess"),
      avatar: {
        filePath: avatarPath,
        fileType: avatar?.mimetype,
      },
    });
  }
);
