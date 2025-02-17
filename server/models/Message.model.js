import mongoose from "mongoose";
import i18next from "i18next";

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      default: "",
    },
    image: {
      type: Object,
      default: {
        filePath: "",
        type: "",
      },
    },
    video: {
      type: Object,
      default: {
        filePath: "",
        type: "",
      },
    },
    audio: {
      type: Object,
      default: {
        filePath: "",
        type: "",
      },
    },
    seen: {
      type: Boolean,
      default: false,
    },
    emojis: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Emojis",
      },
    ],
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, i18next.t("messageSenderIsRequired")],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Messages", messageSchema);
