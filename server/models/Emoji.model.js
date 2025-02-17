import mongoose from "mongoose";
import i18next from "i18next";
const emojiScheam = new mongoose.Schema(
  {
    value: {
      type: String,
      default: "",
      required: [true, i18next.t("emojiValueIsRequired")],
    },
    maker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, i18next.t("emojiMackerIsRequired")],
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Messages",
      required: [true, i18next.t("emojiMessageIsRequired")],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Emojis", emojiScheam);
