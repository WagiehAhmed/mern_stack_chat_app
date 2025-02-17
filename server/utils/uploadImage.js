import multer from "multer";
import path, { dirname, resolve } from "path";
import fs from "fs";
import { promises as fsAsyn } from "fs";
import { fileURLToPath } from "url";

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image") ||
      file.mimetype.startsWith("video") ||
      file.mimetype.startsWith("audio") 
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

export const indexJsDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../"
);

export async function checkAndCreateDirectory(dir) {
  try {
    await fsAsyn.access(dir);
    return true;
  } catch (error) {
    await fsAsyn.mkdir(dir, { recursive: true });
    return true;
  }
}

export const saveFile = async (file, dirName) => {
  const fileName = `${Date.now()}_${file.originalname}`;
  const dirPath = path.join(indexJsDir, "/public/", dirName);
  const result = await checkAndCreateDirectory(dirPath);
  if (result) {
    const filePath = path.join(indexJsDir, "/public/", dirName, fileName);
    fs.writeFile(filePath, file.buffer, (err) => {
      if (err) {
        console.error(err);
      } else {
      }
    });
    return `${dirName}/${fileName}`;
  } else return "";
};

export async function deleteFile(filePath) {
  try {
    await fsAsyn.unlink(path.join(indexJsDir, "/public/", filePath));
    return true;
  } catch (err) {
    return false;
  }
}
